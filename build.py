"""Сборка сайта «Ты — пассажир».

1. Из web/index.html (русская версия) делает web/en/index.html и web/he/index.html
   с переведёнными title/description/og-тегами, lang и dir.
2. Поднимает локальный сервер, открывает страницу в headless Chromium и рисует
   картинки-превью для ссылок (web/og-ru.jpg, og-en.jpg, og-he.jpg).

Запуск:  python build.py           — страницы + превью
         python build.py --pages   — только страницы
"""
import json, re, sys, threading, http.server, functools, base64, pathlib

ROOT = pathlib.Path(__file__).parent
WEB = ROOT / 'web'
SITE = 'https://cosmos.tomerisr.org.il'
PORT = 8765


def load_i18n():
    src = (WEB / 'i18n.js').read_text(encoding='utf-8')
    # достаём нужные поля регэкспом, чтобы не тащить JS-движок
    out = {}
    for lang in ('ru', 'en', 'he'):
        block = src.split(f'\n{lang}: {{', 1)[1]
        def get(key):
            m = re.search(r"\b" + key + r": '((?:[^'\\]|\\.)*)'", block)
            return m.group(1).replace("\\'", "'")
        out[lang] = {k: get(k) for k in ('title', 'metaDesc', 'ogTitle', 'ogSub')}
        out[lang]['dir'] = 'rtl' if lang == 'he' else 'ltr'
    return out


def build_pages():
    base = (WEB / 'index.html').read_text(encoding='utf-8')
    tr = load_i18n()
    ru = tr['ru']
    for lang in ('en', 'he'):
        d = tr[lang]
        url = f'{SITE}/{lang}/'
        html = base
        html = html.replace('<html lang="ru" dir="ltr">', f'<html lang="{lang}" dir="{d["dir"]}">')
        html = html.replace(f'<title>{ru["title"]}</title>', f'<title>{d["title"]}</title>')
        html = html.replace(f'name="description" content="{ru["metaDesc"]}"', f'name="description" content="{d["metaDesc"]}"')
        html = html.replace(f'<link rel="canonical" href="{SITE}/">', f'<link rel="canonical" href="{url}">')
        html = html.replace(f'<meta property="og:url" content="{SITE}/">', f'<meta property="og:url" content="{url}">')
        html = html.replace(f'content="{ru["ogTitle"]}"', f'content="{d["ogTitle"]}"')
        html = html.replace(f'content="{ru["ogSub"]}"', f'content="{d["ogSub"]}"')
        html = html.replace('/og-ru.jpg', f'/og-{lang}.jpg')
        for needle in (f'<title>{d["title"]}</title>', f'content="{d["ogTitle"]}"', f'/og-{lang}.jpg', f'lang="{lang}"'):
            assert needle in html, f'{lang}: replacement failed for {needle}'
        (WEB / lang).mkdir(exist_ok=True)
        (WEB / lang / 'index.html').write_text(html, encoding='utf-8')
        print('page', lang)


def serve():
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(WEB))
    httpd = http.server.ThreadingHTTPServer(('127.0.0.1', PORT), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def build_og():
    from playwright.sync_api import sync_playwright
    httpd = serve()
    try:
        with sync_playwright() as p:
            b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
            pg = b.new_page(viewport={'width': 1200, 'height': 800})
            pg.goto(f'http://127.0.0.1:{PORT}/', wait_until='domcontentloaded', timeout=60000)
            pg.wait_for_function('typeof window.__ogCard === "function"', timeout=60000)
            pg.wait_for_timeout(2500)
            for lang in ('ru', 'en', 'he'):
                data = pg.evaluate(f'window.__ogCard({json.dumps(lang)})')
                from PIL import Image
                import io
                img = Image.open(io.BytesIO(base64.b64decode(data.split(',', 1)[1]))).convert('RGB')
                img.save(WEB / f'og-{lang}.jpg', quality=86, optimize=True, progressive=True)
                print('og', lang)
            b.close()
    finally:
        httpd.shutdown()


if __name__ == '__main__':
    build_pages()
    if '--pages' not in sys.argv:
        build_og()
