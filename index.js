const puppeteer = require('puppeteer');
require('dotenv').config()

const LOGIN = process.env.URL_LOGIN;
const TRACKING = (day) => process.env.URL_TRACK;
const day_id = `20201007`;


function getFrame(page, name) {
    let frame = page.mainFrame();
    for (let child of frame.childFrames()) {
        if (name === child.name()) {
            return child;
        }
    }
}

(async () => {
    try {
        const browser = await puppeteer.launch({
            devtools: false,
            headless: true
        });

        const page = (await browser.pages())[0];
        await page.goto(LOGIN);
        await page.waitForSelector('frameset')
        let frame = getFrame(page, 'Hauptframe')
        await frame.type('#InpEmpId', process.env.TIMEMAG_USER);
        await frame.type('#InpEmpPwd', process.env.TIMEMAG_PASS);
        await frame.click('button');

        await page.waitForSelector('frame[name="Main"]')
        frame = getFrame(page, 'Main')
        await frame.waitForSelector('#butterfly');

        await page.goto(TRACKING(day_id), {waitUntil: 'networkidle0'});
        await page.waitForSelector('td.iflxCorrectionTab input');
        const array = await page.evaluate(() => {
            return [...document.querySelectorAll('td.iflxCorrectionTab input')]
                .map(x => x.value)
                .filter(e => e !== '' && e !== 'false')
        })

        const result = array.filter((e, i) => i%3===0);
        console.log(result.length % 2 !== 0) // true logged back in, false forgot it...

        await browser.close();

    } catch (e) {
        console.error(e);
        process.exit = 1;
    }
})();
