from playwright.sync_api import sync_playwright
import zipfile,io,os,json
with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(viewport={'width':1400,'height':900},accept_downloads=True);pg=ctx.new_page()
    errs=[];pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    B='http://localhost:8099/'
    # QR downloads
    pg.goto(B+'#/qr/url');pg.fill('[data-f=url]','example.com/hello');pg.wait_for_timeout(300)
    for k in ['png','svg','pdf']:
        with pg.expect_download() as d: pg.click(f'[data-dl={k}]')
        d.value.save_as(f'/tmp/qr.{k}')
    # barcode all formats
    samples={'ean13':'590123412345','ean8':'9638507','upca':'03600029145','upce':'0123456','code128':'AroundByte-2026','code39':'AROUND-BYTE','itf14':'1234567890123','itf':'12345678','codabar':'A123456B'}
    for s,v in samples.items():
        pg.goto(B+'#/barcode/'+s);pg.wait_for_timeout(300);pg.fill('#data',v);pg.wait_for_timeout(250)
        st=pg.inner_text('#status')
        with pg.expect_download() as d: pg.click('[data-dl=png]')
        d.value.save_as(f'/tmp/bc_{s}.png');print(s,st)
    with pg.expect_download() as d: pg.click('[data-dl=pdf]')
    d.value.save_as('/tmp/bc.pdf')
    with pg.expect_download() as d: pg.click('[data-dl=svg]')
    d.value.save_as('/tmp/bc.svg')
    # validation
    pg.goto(B+'#/barcode/ean13');pg.wait_for_timeout(300);pg.fill('#data','5901234123450');pg.wait_for_timeout(200);print('bad EAN:',pg.inner_text('#status'))
    pg.goto(B+'#/barcode/itf');pg.wait_for_timeout(300);pg.fill('#data','123');pg.wait_for_timeout(200);print('bad ITF:',pg.inner_text('#status'))
    # bulk
    pg.goto(B+'#/bulk/qr');pg.wait_for_timeout(300);pg.fill('#list','https://a.com\nhello world\nthird');
    with pg.expect_download() as d: pg.click('#go')
    d.value.save_as('/tmp/bulkq.zip')
    pg.goto(B+'#/bulk/barcode');pg.wait_for_timeout(300);pg.fill('#list','ABC-1\nÜmlaut\nXYZ9');
    with pg.expect_download() as d: pg.click('#go')
    d.value.save_as('/tmp/bulkb.zip');print('bulk err:',pg.inner_text('#errs'))
    pg.screenshot(path='/tmp/bulk.png')
    # screenshots
    for n,u in [('qrp','#/qr/designer'),('bcp','#/barcode/ean13'),('scan','#/scan/qr'),('about','#/about')]:
        pg.goto(B+u);pg.wait_for_timeout(300);pg.screenshot(path=f'/tmp/{n}.png')
    print(errs)
for z in ['bulkq','bulkb']: print(z,zipfile.ZipFile(f'/tmp/{z}.zip').namelist())
