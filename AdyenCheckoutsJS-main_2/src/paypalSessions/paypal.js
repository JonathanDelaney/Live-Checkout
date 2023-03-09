sessionsDropin().then((session) => {
  initSession();
  async function initSession() {
    const checkout = await AdyenCheckout({
      clientKey: "test_BO5RR7SQCNBOHDWTH5MDULHBOYTN4HTA",
      environment: "test",
      session,
      onChange: (state, component) => {
        updateStateContainer(state); // Demo purposes only
      },
      onPaymentCompleted: (result, component) => {
        console.info(result, component);
        updateResponseContainer(result);
        const paymentResult = result.resultCode;
        if (paymentResult === "Authorised" || paymentResult === "Received") {
          console.log("trying to show success");
          component.setStatus('loading');
          // document.getElementById("result-container").innerHTML =
          //   '<img alt="Success" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/success.svg">';
        } else {
          document.getElementById("result-container").innerHTML =
            '<img alt="Error" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/error.svg">';
        }
        updateResponseContainer(result);
      },
      onError: (error, component) => {
        console.error(error.name, error.message, error.stack, component);
        updateResponseContainer(response.message);
      },
    });
    const paypalComponent = checkout
      .create("paypal", {
        setStatusAutomatically: false
      })
      .mount("#paypal-container");
  }
});
