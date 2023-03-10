getClientKey().then((clientKey) => {
  getPaymentMethods().then(async (paymentMethodsResponse) => {
      const configuration = {
        clientKey: clientKey,
        environment: "live",
        paymentMethodsResponse,
        amount: {
          currency: "EUR",
          value: 100
        },
        onSubmit: async (state, dropin) => {
          console.dir(state);
          const response =  await makePayment(state.data);
          dropin.setStatus("loading");
          if (response.action) {
            dropin.handleAction(response.action);
          } else if (response.resultCode === "Authorised") {
            dropin.setStatus("success", { message: "Payment successful!" });
          } else if (response.resultCode !== "Authorised") {
            dropin.setStatus("error", { message: "Oops, try again please!" });
          }
        },
        onAdditionalDetails: (state, dropin) => {
          submitDetails(state.data)
            .then((response) => {
              if (response.action) {
                component.handleAction(response.action);
              } else if (response.resultCode === "Authorised") {
                component.setStatus("success", { message: "Payment successful!" });
                setTimeout(function () {
                  component.setStatus("ready");
                }, 2000);
              } else if (response.resultCode !== "Authorised") {
                setTimeout(function () {
                  component.setStatus("ready");
                }, 2000);
              }
            })
            .catch((error) => {
              throw Error(error);
            });
          }
      };

      const checkout = await AdyenCheckout(configuration);

      const googlePayComponent = checkout.create("googlepay", {
        async onClick (resolve, reject) {
          console.log("clicked");
          resolve();
        },
        onAuthorized: (data) => {
          console.log(data);
        },
        emailRequired: true,
        billingAddressRequired: true
      }).mount("#googlepay-container");
  })
});
