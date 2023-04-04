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
        onSubmit: (state, component) => {
          console.log(state);
          makePayment(state.data)
            .then((response) => {
              component.setStatus("loading");
              if (response.action) {
                component.handleAction(response.action);
              } else if (response.resultCode === "Authorised") {
                component.setStatus("success", { message: "Payment successful!" });
                setTimeout(function () {
                  component.setStatus("ready");
                }, 2000);
              } else if (response.resultCode !== "Authorised") {
                component.setStatus("error", { message: "Oops, try again please!" });
                setTimeout(function () {
                  component.setStatus("ready");
                }, 2000);
              }
            })
            .catch((error) => {
              throw Error(error);
            });
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

      const applePayComponent = checkout.create("applepay", {
        countryCode: "NL",
        amount: {
          currency: "EUR",
          value: 100
        },
        onAuthorized: (data) => {
          console.log(data);
          const authEl = document.getElementById("on-authorised");
          authEl.innerHtml = JSON.stringify(data);
        }
      }).mount("#applepay-container");
  })
});
