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
        locale: "fi-FI",
        onSubmit: (state, component) => {
          console.log(state);
          delete state.data.browserInfo;
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
        countryCode: "FI",
        amount: {
          currency: "EUR",
          value: 100
        },
        buttonType: 'buy',
        onClick: (resolve, reject) => {
            console.log('Apple Pay - Button clicked');
            resolve();
        },
        onAuthorized: (resolve, reject, event) => {
            console.log('Apple Pay onAuthorized', event);
            document.getElementById('response').innerText = JSON.stringify(event, null, 2);
            resolve();
        },
        onShippingContactSelected: (resolve, reject, event) => {
            console.log('Apple Pay onShippingContactSelected event', event);
            document.getElementById('response-two').innerText = JSON.stringify(event, null, 2);
            resolve();
        },
        onShippingMethodSelected: (resolve, reject, event) => {
            console.log('Apple Pay onShippingMethodSelected event', event);
            document.getElementById('response-three').innerText = JSON.stringify(event, null, 2);
            resolve();
        },
      }).mount("#applepay-container");
  })
});
