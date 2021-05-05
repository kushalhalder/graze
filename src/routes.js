const Apify = require('apify');
const {
    utils: { log },
} = Apify;

exports.CATEGORY_LISTING = async ({ page, request }, { requestQueue }) => {
    return Apify.utils.enqueueLinks({
        page,
        requestQueue,
        selector: '.prod-view.ng-scope > a',
        transformRequestFunction: req => {
            req.userData.label = 'DETAIL';
            return req;
        },
    });
};

exports.DETAIL = async ({request, page}) => {
    const urlArr = request.url.split('/').slice(-3);

    log.debug('Scraping results.');
    const results = {
        url: request.url,
        id: urlArr[0],
        owner: urlArr[1],
        productName: await page.$eval('h2._25I07', el => el.textContent),
        brandName: await page.$eval('a._2zLWN', el => el.textContent),
        unused_mrp: await page.$eval('td._2ifWF', el => el.textContent).catch(error => 0),
        mrp: await page.$eval('td.IyLvo', el => el.textContent).catch(error => 0),
        variants: await page.$eval('._1LiCn', el => el.innerText).catch(error => null),
        category: await page.$eval('._3moNK', el => el.textContent),
        extra_0: await page.$eval('#about_0 > div:nth-child(2) > div > div', el => el.textContent).catch(error => null),
        extra_1: await page.$eval('#about_1 > div:nth-child(2) > div > div', el => el.textContent).catch(error => null),
        extra_2: await page.$eval('#about_2 > div:nth-child(2) > div > div', el => el.textContent).catch(error => null),
        extra_3: await page.$eval('#about_3 > div:nth-child(2) > div > div', el => el.textContent).catch(error => null),
        extra_4: await page.$eval('#about_4 > div:nth-child(2) > div > div', el => el.textContent).catch(error => null)
    };

    log.debug('Pushing data to dataset.');
    await Apify.pushData(results);
};

exports.JD_PRODUCT_DETAIL = async ({request, page}) => {
    log.debug('Scraping results.')
    url = new URL(request.url);
    const results = {
        url: request.url,
        id: url.searchParams.get('itemsizecode'),
        owner:url.hostname,
        productname: await page.$eval('div.proDetail-bx h1', el => el.textContent.trim()),
        brandname: null,
        unusedmrp: null,
        mrp: await page.$eval('span.RsTx', el => el.textContent),
        variants: await page.$eval('div.prod-size > .row', el => el.textContent),
        category: "" + await page.$eval('div.prod-description span.head', el => el.textContent.trim()) + ">" + await page.$eval('span.prodeslink > a.active', el => el.textContent.trim())
    }
    log.debug('Pushing data to dataset.');
    await Apify.pushData(results);
};

exports.JD_PRODUCT_LISTING = async({page, request}, {requestQueue}) => {
    return Apify.utils.enqueueLinks({
        page,
        requestQueue,
        selector: '.nm_box > a',
        transformRequestFunction: req => {
            req.userData.label = 'JD_PRODUCT_DETAIL';
            return req;
        }
    })
}

