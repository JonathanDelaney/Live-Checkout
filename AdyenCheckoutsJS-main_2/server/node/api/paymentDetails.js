const { post } = require("request");
const getPostParameters = require("../utils/getPostParameters");
const handleCallback = require("../utils/handleCallback");

module.exports = (res, request) => {
  const params = getPostParameters("https://14bc048714e340cf-AdyenTechSupport-checkout-live.adyenpayments.com/checkout/payments/details", request);
  post(params, (err, response, body) =>
    handleCallback({ err, response, body }, res)
  );
};
