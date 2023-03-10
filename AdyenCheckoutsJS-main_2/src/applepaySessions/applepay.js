getClientKey().then((clientKey) => {
  sessionsDropin().then((session) => {
    initSession();
    async function initSession() {
      const checkout = await AdyenCheckout({
        clientKey: clientKey,
        environment: "live",
        session,
        onChange: (state, component) => {
          updateStateContainer(state); // Demo purposes only
        },
        onPaymentCompleted: (result, component) => {
          console.info(result, component);
          updateResponseContainer(result);
        },
        onError: (error, component) => {
          console.error(error.name, error.message, error.stack, component);
          updateResponseContainer(response.message);
        },
      });
      const applePayComponent = checkout.create("applepay",{
        countryCode: "NL",
        amount: {
          currency: "EUR",
          value: 100
        }
      });

      applePayComponent
        .isAvailable()
        .then(() => {
          applePayComponent.mount("#applepay-container");
        })
        .catch((e) => {
          console.log(e);
        });
    }
  });
});
