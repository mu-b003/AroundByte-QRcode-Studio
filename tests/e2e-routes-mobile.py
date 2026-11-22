from playwright.sync_api import sync_playwright
B='http://localhost:8099/'
routes=['','qr','qr/url','qr/text','qr/wifi','qr/contact','qr/email','qr/phone','qr/sms','qr/designer','scan/qr','scan/barcode','bulk/qr','bulk/barcode','about']+['barcode/'+x for x in 'ean13 ean8 upca upce code128 code39 itf14 itf codabar'.split()]+['nope']
with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(viewport={'width':390,'height':800},is_mobile=True,has_touch=True);pg=ctx.new_page()
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    for r in routes:
        pg.goto(B+'#/'+r);pg.wait_for_timeout(250);w=pg.evaluate('document.documentElement.scrollWidth');t=pg.title()
        if w>391 or 'Studio' not in t: print('OVERFLOW/TITLE',r,w,t)
    pg.goto(B+'#/qr/designer');pg.wait_for_timeout(300);pg.screenshot(path='/tmp/m_qr.png')
    pg.goto(B+'#/');pg.wait_for_timeout(300);pg.click('summary:has-text("QR Code Tools")');pg.wait_for_timeout(200);pg.screenshot(path='/tmp/m_home.png')
    d=ctx.new_page();d.set_viewport_size({'width':1400,'height':800});d.goto(B);d.evaluate("localStorage.setItem('abqs-theme','light')");d.goto(B+'#/scan/qr');d.reload();d.wait_for_timeout(400);d.screenshot(path='/tmp/light_scan.png')
    print('errs',errs,'done')
