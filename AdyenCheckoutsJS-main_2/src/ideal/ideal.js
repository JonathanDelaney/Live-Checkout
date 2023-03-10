
const queryResultString = window.location.search;
const urlParams = new URLSearchParams(queryResultString)
const amazonCheckoutSessionId = urlParams.get('amazonCheckoutSessionId')
const isAmazonPay = urlParams.get('amazonRedirect')

getClientKey().then((clientKey) => {
  getPaymentMethods().then(async (paymentMethodsResponse) => {

    // 1. Create an instance of AdyenCheckout
      const checkout = await AdyenCheckout({
          environment: 'live',
          locale: "en-US",
          clientKey: clientKey, // Mandatory. clientKey from Customer Area
          paymentMethodsResponse,
          removePaymentMethods: ['paysafecard', 'c_cash'],
          onChange: state => {
              updateStateContainer(state); // Demo purposes only
          },
          onSubmit: (state, dropin) => {
            console.log(state.data);
            makePayment(state.data)       // Pseudo function to post the state.data to the /payments endpoint
              .then((response) => {
                dropin.setStatus("loading");
                if (response.action) {
                  dropin.handleAction(response.action);
                } else if (response.resultCode === "Authorised") {
                  dropin.setStatus("success", { message: "Payment successful!" });
                } else if (response.resultCode !== "Authorised") {
                  dropin.setStatus("error", { message: "Oops, try again please!" });
                }
              })
              .catch((error) => {
                throw Error(error);
              });
          }
      });
      const idealComponent = checkout.create('ideal', {
          // Optional configuration
          issuers: [
            {
                "id": "1121",
                "name": "Test Issuer"
            },
            {
                "id": "1154",
                "name": "Test Issuer 5"
            }
          ],
          showPayButton: true
      }).mount('#card-container');
  })
   
  // Redirect handling code starts here till the end

  const getSearchParameters = (search = window.location.search) =>
  search
    .replace(/\?/g, "")
    .split("&")
    .reduce((acc, cur) => {
      const [key, prop = ""] = cur.split("=");
      acc[key] = decodeURIComponent(prop);
      return acc;
    }, {});

  const { redirectResult } = getSearchParameters(window.location.search);

  async function handleRedirectResult(redirectResult) {
    const checkout = await AdyenCheckout({
      environment: "live",
      clientKey: clientKey
    });
    const dropin = checkout
      .create("dropin", {
        setStatusAutomatically: false,
      })
      .mount("#dropin-container");

    const response = await submitDetails({ details: { redirectResult } });
    if (response.resultCode === "Authorised") {
      dropin.setStatus("success", { message: "Payment successful!" });
    } else if (response.resultCode !== "Authorised") {
      dropin.setStatus("error", { message: "Oops, try again please!" });
    }
  }


  if (redirectResult) {
    handleRedirectResult(redirectResult);
  }
});
