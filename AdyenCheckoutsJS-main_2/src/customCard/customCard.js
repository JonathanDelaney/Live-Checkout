
const queryResultString = window.location.search;
const urlParams = new URLSearchParams(queryResultString)
const redirectResult = urlParams.get('redirectResult')

getClientKey().then((clientKey) => {
  getPaymentMethods().then(async (paymentMethodsResponse) => {

    // 1. Create an instance of AdyenCheckout
      console.log(paymentMethodsResponse);
      const checkout = await AdyenCheckout({
          environment: 'test',
          locale: "en-US",
          clientKey: clientKey, // Mandatory. clientKey from Customer Area
          onChange: state => {
          },
          onSubmit: (state, component) => {
            console.log(state.data);
            makePayment(state.data)       // Pseudo function to post the state.data to the /payments endpoint
              .then((response) => {
                component.setStatus("loading");
                if (response.action) {
                  component.handleAction(response.action);
                } else if (response.resultCode === "Authorised" || response.resultCode === "Received") {
                  console.log(response.resultCode);
                  document.getElementById("customCard-container").innerHTML =
                    '<img alt="Success" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/success.svg">';
                } else {
                  document.getElementById("customCard-container").innerHTML =
                    '<img alt="Error" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/error.svg">';
                }
              })
              .catch((error) => {
                throw Error(error);
              });
          },
          onAdditionalDetails: async (state, component) => {
            console.log(state.data);
            const response = await submitDetails(state.data);
            if (response.action) {
              component.handleAction(response.action);
            } else if (response.resultCode === "Authorised" || response.resultCode === "Received") {
              console.log(response.resultCode);
              document.getElementById("customCard-container").innerHTML =
                '<img alt="Success" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/success.svg">';
            } else {
              document.getElementById("customCard-container").innerHTML =
                '<img alt="Error" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/error.svg">';
            }
          }
      });
      const customCard = checkout.create('securedfields', {
          // Optional configuration
          type: 'card',
          brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro'],
          styles: {
            base: {
              color: 'black',
              fontSize: '16px',
              fontSmoothing: 'antialiased',
              fontFamily: 'Helvetica'
            },
            error: {
              color: 'red'
            },
            placeholder: {
              color: '#d8d8d8'
            },
            validated: {
              color: 'green'
            }
          },
          // Only for Web Components before 4.0.0.
          // For Web Components 4.0.0 and above, configure aria-label attributes in translation files

          ariaLabels: {
              lang: "en-GB",
              encryptedCardNumber: {
                  label: "Credit or debit card number",
                  iframeTitle: "Iframe for card data input field"
              },
              encryptedExpiryDate: {
                  label: "Credit or debit card expiration date",
                  iframeTitle: "Iframe for card data input field"
              },
              encryptedSecurityCode: {
                  label: "Iframe for card data input field"
              }
          },

          // Events
          onChange: function() {},
          onValid : function() {},
          onLoad: function() {},
          onConfigSuccess: function() {},
          onFieldValid : function() {},
          onBrand: (brand) => {
            console.log(brand);
          },
          onError: function() {},
          onFocus: function() {},
          onBinValue: (bin) => {
            console.log(bin);
          },
          onBinLookup: (callbackObj, component) => {
              // Handle a dual branded result
              console.log(callbackObj);
              if (callbackObj.supportedBrandsRaw?.length > 1) {
                  console.log(callbackObj);
                  onDualBrand(callbackObj);
              }
          }
      }).mount('#customCard-container');
      const payButton = document.getElementById("submit-button");
      payButton.addEventListener("click", function() {
        console.log("submitting")
        customCard.submit();
      })
  })

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
      environment: "test",
      clientKey: clientKey
    });
    const customCard = checkout
      .create("securedfields", {
        setStatusAutomatically: false,
      })
      .mount("#customCard-container");

    const response = await submitDetails({ details: { redirectResult } });
    if (response.resultCode === "Authorised") {
      customCard.setStatus("success", { message: "Payment successful!" });
    } else if (response.resultCode !== "Authorised") {
      customCard.setStatus("error", { message: "Oops, try again please!" });
    }
  }


  if (redirectResult) {
    handleRedirectResult(redirectResult);
  }
});
