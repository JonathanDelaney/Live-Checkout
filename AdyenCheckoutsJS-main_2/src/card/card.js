
getClientKey().then((clientKey) => {
  const queryResultString = window.location.search;
  const urlParams = new URLSearchParams(queryResultString);
  const redirectResult = urlParams.get("redirectResult");
  // const sessionId = urlParams.get("sessionId");
  async function initiateCheckout() {
    const response = await getPaymentMethods()
    const paymentMethodsResponse = response;
    // 1. Create an instance of AdyenCheckout
      const checkout = await AdyenCheckout({
          environment: 'live',
          // locale: "en-US",
          clientKey: clientKey, // Mandatory. clientKey from Customer Area
          paymentMethodsResponse,
          // removePaymentMethods: ['paysafecard', 'c_cash'],
          // onPaymentCompleted: (result, dropin) => {
          //   console.log(result);
          //   updateResponseContainer(result);
          // },
          onChange: state => {
              updateStateContainer(state); // Demo purposes only
          },
          onSubmit: async (state, component) => {
            const response = await makePayment(state.data);
            component.setStatus("loading");
            if (response.action) {
              component.handleAction(response.action);
            } else if (response.resultCode === "Authorised") {
              component.setStatus("success", { message: "Payment successful!" });
            } else if (response.resultCode !== "Authorised") {
              component.setStatus("error", { message: "Oops, try again please!" });
            }
          },
          onAdditionalDetails: async (state, dropin) => {
            console.log(state.data);
            const response = await submitDetails(state.data);
            if (response.action) {
              console.log(response);
              dropin.handleAction(response.action);
            } else if (response.resultCode === "Authorised") {
              dropin.setStatus("success", { message: "Payment successful!" });
              setTimeout(function () {
                dropin.setStatus("ready");
              }, 2000);
            } else if (response.resultCode !== "Authorised") {
              dropin.setStatus("error", { message: "Oops, try again please!" });
              setTimeout(function () {
                dropin.setStatus("ready");
              }, 2000);
            }
          }
      });
      const cardComponent = checkout.create('card', {
          showPayButton: true,
          onBinLookup: (value) => {
            console.log(value);
          },
          // brands: [],
          hasHolderName: true,
          holderNameRequired: true,
          billingAddressRequired: true,
          disableIOSArrowKeys: false
      }).mount('#card-container');

      // const custompaybutton = document.getElementById("custompaybutton");

      // if (custompaybutton) {
      //   custompaybutton.addEventListener("click", a => {cardComponent.submit()})
      // }
  }
  async function handleRedirectResult(redirectResult) {
    const checkout = await AdyenCheckout({
      environment: "live",
      clientKey: clientKey
    });
    const dropin = checkout
      .create("dropin", {
        setStatusAutomatically: false,
      })
      // .mount("#dropin-container");

    const response = await submitDetails({ details: { redirectResult } });
    if (response.resultCode === "Authorised") {
      document.getElementById("card-container").innerHTML =
        '<img alt="Success" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/success.svg">';
    } else {
      document.getElementById("card-container").innerHTML =
        '<img alt="Error" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/error.svg">';
    }
  }


  if (redirectResult) {
    console.log("there is a redirect");
    handleRedirectResult(redirectResult);
  } else {
    initiateCheckout();
  }
});

