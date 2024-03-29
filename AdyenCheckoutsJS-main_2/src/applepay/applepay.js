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
        locale: "en-GB",
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
        }
      };

      const checkout = await AdyenCheckout(configuration);

      const eventR = {
        ApplePayLineItem: {
            "label": "Subscription",
            "amount": "1.00",
            "type": "final",
            "paymentTiming": "recurring",
            "recurringPaymentStartDate": new Date("2022-01-01T00:00:00"),
            "recurringPaymentIntervalUnit": "month",
            "recurringPaymentIntervalCount": 6,
            "recurringPaymentEndDate": new Date("2024-01-01T00:00:00"),
        }
      }

      const applePayComponent = checkout.create("applepay", {
        countryCode: "NL",
        amount: {
          currency: "EUR",
          value: 100
        },
       // buttonType: 'buy',
        onClick: (resolve, reject) => {
            console.log('Apple Pay - Button clicked');
            resolve();
        },
        onAuthorized: (resolve, reject, event) => {
            console.log('Apple Pay onAuthorized', JSON.stringify(event.payment));
            document.getElementById('response').innerText = JSON.stringify(event.payment, null, 2);
            resolve();
        },
        onShippingContactSelected: (resolve, reject, event) => {
            console.log('Apple Pay onShippingContactSelected event', event);
            document.getElementById('response-two').innerText = JSON.stringify(event, null, 2);
            resolve(event);
        },
        // onPaymentMethodSelected: (resolve, reject, event) => {
        //     console.log('Apple Pay onPaymentMethodSelected event', event);
        //     document.getElementById('response-four').innerText = JSON.stringify(event, null, 2);
        //     resolve(eventR);
        // },
        onShippingMethodSelected: (resolve, reject, event) => {
            console.log('Apple Pay onShippingMethodSelected event', event);
            document.getElementById('response-three').innerText = JSON.stringify(event, null, 2);
            resolve();
        },
      }).mount("#applepay-container");
  })
});
