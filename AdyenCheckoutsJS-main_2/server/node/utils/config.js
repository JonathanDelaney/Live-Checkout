const { CHECKOUT_APIKEY, MERCHANT_ACCOUNT, CLIENT_KEY } = process.env;

const API_VERSION = 'v68';
const CHECKOUT_URL = `https://14bc048714e340cf-AdyenTechSupport-checkout-live.adyenpayments.com/checkout/${API_VERSION}`;

module.exports = {
    CHECKOUT_APIKEY,
    CHECKOUT_URL,
    MERCHANT_ACCOUNT,
    CLIENT_KEY
};
