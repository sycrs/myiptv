
const scraperObject = {
    //url: 'https://ww1.cuevana3.me/peliculas',
    async scraper(browser,page, url = 'https://ww1.cuevana3.me/peliculas') {
       // let page = await browser.newPage();
        console.log(`Navigating to ${url}...`);
        await page.goto(url,{waitUntil: 'load', timeout: 6000});
        await page.waitForSelector('main');
        let movs = {};
        movs['data'] = await page.$$eval('section ul > li', links => {
            links = links.map(el => {
                let obj = {};

                // obj['info'] = el.querySelector('.Info').innerHTML;
                // obj['description'] = el.querySelector('.Description').innerHTML;
                obj['genero'] = el.querySelector('.Description > .Genre').textContent.replace('Género: ', '');
                obj['titulo'] = el.querySelector('.Title').textContent;
                obj['estreno'] = el.querySelector('.Info > .Date').textContent;
                obj['calidad'] = el.querySelector('.Info > .Qlty').textContent;
                obj['duracion'] = el.querySelector('.Info > .Time').textContent;
                obj['calificacion'] = el.querySelector('.Info > .Vote').textContent;
                obj['descripcion'] = el.querySelector('.Description > p:nth-child(2)').textContent;
                obj['url'] = el.querySelector('a').href;
                obj['src'] = el.querySelector('a .Image figure img').getAttribute('data-src');
                return obj;
            })
            return links;
        });
        movs['continuacion'] = await page.$eval('section nav > .nav-links > .next.page-numbers', (nav) => nav.href);
        // console.log(movs);
        return movs;
    },
    cuevana: {
        get_goto_ir: async (url, page) => {
            console.log(`Navegando a ${url}...`);
            await page.goto(url, { 'waitUntil': 'networkidle0' });
            await page.waitForSelector('body');
            let va = await page.$eval('.bd > .video > .TPlayerCn .TPlayerTb > iframe', (nav) => nav.src);//.replace('player','goto');
            let ru = String(va).replace('player', 'goto');
            return ru;
        }
    }

}

module.exports = scraperObject;