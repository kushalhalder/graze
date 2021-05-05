const url = require('url');
const Apify = require('apify');
const routes = require('./routes');
const {
    utils: { log },
} = Apify;

const domainRouteMap = {
    "www.bigbasket.com" : 'CATEGORY_LISTING',
    "www.justdial.com" : 'JD_PRODUCT_LISTING'
}

exports.getSources = async () => {
    log.debug('Getting sources.');
    const input = await Apify.getInput();
    return input.map(function fn(currentUrl) {
        thisUrl = new URL(currentUrl);
        return {
            url: `${currentUrl}`,
            userData: {
               label: domainRouteMap[thisUrl.hostname],
            },
        }
    });
};

exports.createRouter = globalContext => {
    return async function(routeName, requestContext) {
        const route = routes[routeName];
        if (!route) throw new Error(`No route for name: ${routeName}`);
        log.debug(`Invoking route: ${routeName}`);
        return route(requestContext, globalContext);
    };
};
