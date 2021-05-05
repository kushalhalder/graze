const Apify = require('apify');
const tools = require('./tools');
const {
    utils: { log },
} = Apify;
const { puppeteer } = Apify.utils;

Apify.main(async () => {
    log.info('Starting actor.');
    const requestList = await Apify.openRequestList('jd_all_categories_v1', await tools.getSources());
    const requestQueue = await Apify.openRequestQueue();
    const router = tools.createRouter({ requestQueue });

    log.info('Setting up crawler.');

    const crawler = new Apify.PuppeteerCrawler({
        requestList,
        requestQueue,
        maxConcurrency: 2,
        handlePageTimeoutSecs: 600,
        puppeteerPoolOptions: {
            useLiveView: false,
        },
        launchPuppeteerOptions: {
            // devtools: true,
            // args: ['--disable-dev-shm-usage'],
            useChrome: true,
            headless: true,
            stealth: true,
            slowMo: 100
        },
        handlePageFunction: async (context) => {
            const { request, skipLinks, page } = context;
            // This function is called to extract data from a single web page
            // 'page' is an instance of Puppeteer.Page with page.goto(request.url) already called
            // 'request' is an instance of Request class with information about the page to load
            log.info(`Processing ${request.url}`);
            // infinite scroll for listing pages
            if (/_LISTING$/.test(request.userData.label)) {
                await puppeteer.infiniteScroll(page, {waitForSecs: 10});
            }
            await router(request.userData.label, context);
            log.info(`END Processing ${request.url}`);
        },
        handleFailedRequestFunction: async ({ request }) => {
            // This function is called when the crawling of a request failed too many times
            log.info(`Processing failed for ${request.url}`);
            await Apify.pushData({
                url: request.url,
                succeeded: false,
                errors: request.errorMessages,
            });
        },
    });

    log.info('Starting the crawl.');
    await crawler.run();
    log.info('Actor finished.');
});
