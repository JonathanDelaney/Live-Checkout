const queryResultString = window.location.search;
const urlParams = new URLSearchParams(queryResultString)
const amazonCheckoutSessionId = urlParams.get('amazonCheckoutSessionId')
const isAmazonPay = urlParams.get('amazonRedirect')

console.log("page is up");

getClientKey().then((clientKey) => {
  function initCheckout() {
    getPaymentMethods().then(async (paymentMethodsResponse) => {

    // 1. Create an instance of AdyenCheckout
      console.log(paymentMethodsResponse);
      const checkout = await AdyenCheckout({
          environment: 'test',
          locale: "en-US",
          clientKey: clientKey, // Mandatory. clientKey from Customer Area
          // paymentMethodsResponse,
      });
      const amazonPayComponent = checkout.create('amazonpay', {
          // Optional configuration
          productType: 'PayAndShip',
          region: "UK",
          currency: 'EUR',
          configuration: {
            merchantId: "A3060DH7B5DB0W",
            storeId: "amzn1.application-oa2-client.4f94bd3cb3e0430bb1f42594f170db09",
            region: "EU",
            publicKeyId: "SANDBOX-AGFEQXVLKMSIJNVT4AD7PAGT"
          },
          environment: 'test',
          returnUrl: 'http://localhost:3002/amazonpay?second=false'
      }).mount('#amazonpay_button-container');
    })
  };

  async function handleAmazonRedirect(amazonCheckoutSessionId) {
    getPaymentMethods().then(async (paymentMethodsResponse) => {
      const checkout = await AdyenCheckout({
        environment: "test",
        clientKey: clientKey,
        // paymentMethodsResponse  
      });
      const amazonPayComponent = checkout
        .create('amazonpay', {
            amount: {
                currency: 'EUR',
                value: 4.99
            },
            configuration: {
              merchantId: "A3060DH7B5DB0W",
              storeId: "amzn1.application-oa2-client.4f94bd3cb3e0430bb1f42594f170db09",
              // region: "EU",
              publicKeyId: "SANDBOX-AGFEQXVLKMSIJNVT4AD7PAGT"
            },
            amazonCheckoutSessionId: amazonCheckoutSessionId,
            returnUrl: 'http://localhost:3002/amazonpay?second=true',
            showChangePaymentDetailsButton: true   
        })
        .mount('#amazonpay_order-container');
    });
  };
  
  async function handleSecondAmazonRedirect(amazonCheckoutSessionId) {
    getPaymentMethods().then(async (paymentMethodsResponse) => {
      const checkout = await AdyenCheckout({
        environment: "test",
        clientKey: clientKey,
        // paymentMethodsResponse  
      });
      const amazonPayComponent = checkout
        .create('amazonpay', {
            amount: {
                currency: 'EUR',
                value: 4900
            },
            region: "UK",
            amazonCheckoutSessionId: amazonCheckoutSessionId,
            returnUrl: setReturnUrl(),
            showChangePaymentDetailsButton: true,
            onSubmit: (state, component) => {
              component.setStatus('loading');
             
              // Merchant's function to make a payment
              return makePayment(state.data)
                  .then(response => {
                      component.setStatus('ready');
                      if (response.action) {
                          // Handle additional action (3D Secure / redirect / other)
                          component.handleAction(response.action);
                      } else if (response.resultCode === "Authorised") {
                        document.getElementById("amazonpay_payment-container").innerHTML = '<img alt="Success" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/success.svg">';
                      } else if (response.resultCode !== "Authorised") {
                        document.getElementById("amazonpay_payment-container").innerHTML = '<img alt="Error" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/error.svg">';
                      }
                  })
                  .catch(error => {
                      // Handle error;
                  });
            }      
        })
        // .mount('#amazonpay_payment-container');

        amazonPayComponent.submit();
    });
  };

  const getSearchParameters = (search = window.location.search) =>
    search
      .replace(/\?/g, "")
      .split("&")
      .reduce((acc, cur) => {
        const [key, prop = ""] = cur.split("=");
        acc[key] = decodeURIComponent(prop);
        return acc;
      }, {});
      
  
  const { amazonCheckoutSessionId } = getSearchParameters(window.location.search);
  const { second } = getSearchParameters(window.location.search);
  console.log((window.location.search));

  if (amazonCheckoutSessionId && second == 'false') {
    console.log("doinf stuff");
    handleAmazonRedirect(amazonCheckoutSessionId);
  } else if (amazonCheckoutSessionId && second == 'true') {
    console.log("SecondRedirect");
    handleSecondAmazonRedirect(amazonCheckoutSessionId);
  } else {
    initCheckout();
  }
});