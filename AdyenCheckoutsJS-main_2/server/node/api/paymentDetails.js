const { post } = require("request");
const getPostParameters = require("../utils/getPostParameters");
const handleCallback = require("../utils/handleCallback");

module.exports = (res, request) => {
  console.log("Request being sent: "
  const params = getPostParameters("/payments/details", request);
  console.log("Params: ", params);
  post(params, (err, response, body) =>
    handleCallback({ err, response, body }, res)
  );
};
