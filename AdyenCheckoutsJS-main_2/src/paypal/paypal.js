
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
          amount: {
            currency: "EUR",
            value: 100
          },
          removePaymentMethods: ['paysafecard', 'c_cash'],
          onChange: state => {
              updateStateContainer(state); // Demo purposes only
          },
          onSubmit: (state, component) => {
            console.log(state.data);
            makePayment(state.data)       // Pseudo function to post the state.data to the /payments endpoint
              .then((response) => {
                component.setStatus("loading");
                if (response.action) {
                  component.handleAction(response.action);
                } else if (response.resultCode === "Authorised") {
                  component.setStatus("success", { message: "Payment successful!" });
                } else if (response.resultCode !== "Authorised") {
                  component.setStatus("error", { message: "Oops, try again please!" });
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
            } else if (response.resultCode === "Authorised") {
              component.setStatus("success", { message: "Payment successful!" });
            } else if (response.resultCode !== "Authorised") {
              component.setStatus("error", { message: "Oops, try again please!" });
            }
          }
      });
      const paypalComponent = checkout.create('paypal', {
          // showPayButton: true
      }).mount('#paypal-container');

      // const custompaybutton = document.getElementById("custompaybutton");

      // if (custompaybutton) {
      //   custompaybutton.addEventListener("click", a => {cardComponent.submit()})
      // }
  })
});

