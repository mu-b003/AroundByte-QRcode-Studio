from playwright.sync_api import sync_playwright
B='http://localhost:8099/'
def scan(pg,mode,path):
    pg.goto(B+'#/scan/'+mode);pg.wait_for_timeout(300);pg.set_input_files('#file',path);pg.wait_for_timeout(900)
    t=pg.inner_text('#res').replace('\n',' | ');return t
with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(accept_downloads=True);pg=ctx.new_page()
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    print('QR url:',scan(pg,'qr','/tmp/qr.png'))
    # QR variants: rounded / dots / logo
    pg.goto(B+'#/qr/designer');pg.wait_for_timeout(300);pg.fill('[data-f=url]','https://aroundbyte.com/test');pg.select_option('#shape','dot');pg.wait_for_timeout(200)
    with pg.expect_download() as d: pg.click('[data-dl=png]')
    d.value.save_as('/tmp/q_dot.png');print('dots:',scan(pg,'qr','/tmp/q_dot.png'))
    pg.goto(B+'#/qr/designer');pg.wait_for_timeout(300);pg.fill('[data-f=url]','https://aroundbyte.com/logo');pg.set_input_files('#logo','/home/claude/qr/assets/aroundbyte-qrcode-studio-logo.png');pg.select_option('#shape','rounded');pg.wait_for_timeout(400)
    with pg.expect_download() as d: pg.click('[data-dl=png]')
    d.value.save_as('/tmp/q_logo.png');print('logo+rounded:',scan(pg,'qr','/tmp/q_logo.png'));pg.goto(B+'#/qr/designer');pg.wait_for_timeout(200)
    for s,v in {'ean13':'5901234123457','ean8':'96385074','upca':'036000291452','upce':'01234565','code128':'AroundByte-2026','code39':'AROUND-BYTE','itf14':'12345678901231','itf':'12345678','codabar':'A123456B'}.items():
        print(s,'->',scan(pg,'barcode',f'/tmp/bc_{s}.png')[:90])
    pg.goto(B+'#/scan/qr');pg.wait_for_timeout(200);pg.set_input_files('#file','/tmp/bc_ean13.png');pg.wait_for_timeout(700);print('negative:',pg.inner_text('#res')[:80])
    print(errs)
