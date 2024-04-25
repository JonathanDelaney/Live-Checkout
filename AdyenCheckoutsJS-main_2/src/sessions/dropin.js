getClientKey().then((clientKey) => {
//   // Check URL for redirectResult and sessionId
  const queryResultString = window.location.search;
  const urlParams = new URLSearchParams(queryResultString);
  const redirectResult = urlParams.get("redirectResult");
  const sessionId = urlParams.get("sessionId");

  function initiateSession() {
    sessionsDropin().then((response) => {
      const configuration = {
        environment: "live", // Change to 'live' for the live environment.
        clientKey: clientKey, // Public key used for client-side authentication: https://docs.adyen.com/development-resources/client-side-authentication
        session: {
          id: response.id, // Unique identifier for the payment session.
          sessionData: response.sessionData, // The payment session data.
        },
        onPaymentCompleted: (result, dropin) => {
          console.log(result);
          updateResponseContainer(result);
        },
        onError: (error, component) => {
          console.error(error, component);
        },
        paymentMethodsConfiguration: {
          card: {
            enableStoreDetails: true
          },
          applepay: {
            countryCode: "NL",
            amount: {
              currency: "EUR",
              value: 100
            },
            onClick: (resolve, reject) => {
                alert('Apple Pay - Button clicked');
                resolve();
            }
          }
        },
        // beforeSubmit: (data, component, actions) => {
        //   delete data.origin;
        //   actions.resolve(data);
        // },
        // onSubmit: (state, dropin) => {
        //   console.log("onSubmit");
        //   paymentsDefaultConfig.amount = {
        //     currency: "SEK",
        //     value: 3900
        //   };
        //   makePayment(state.data)
        //     .then((response) => {
        //       dropin.setStatus("loading");
        //       if (response.action) {
        //         dropin.handleAction(response.action);
        //       } else if (response.resultCode === "Authorised") {
        //         dropin.setStatus("success", { message: "Payment successful!" });
        //         setTimeout(function () {
        //           dropin.setStatus("ready");
        //         }, 2000);
        //       } else if (response.resultCode !== "Authorised") {
        //         dropin.setStatus("error", { message: "Oops, try again please!" });
        //         setTimeout(function () {
        //           dropin.setStatus("ready");
        //         }, 2000);
        //       }
        //     })
        //     .catch((error) => {
        //       throw Error(error);
        //     });
        // },
        // onAdditionalDetails: (state, dropin) => {
        //   submitDetails(state.data)
        //     .then((response) => {
        //       if (response.action) {
        //         dropin.handleAction(response.action);
        //       } else if (response.resultCode === "Authorised") {
        //         dropin.setStatus("success", { message: "Payment successful!" });
        //         setTimeout(function () {
        //           dropin.setStatus("ready");
        //         }, 2000);
        //       } else if (response.resultCode !== "Authorised") {
        //         setTimeout(function () {
        //           dropin.setStatus("ready");
        //         }, 2000);
        //       }
        //     })
        //     .catch((error) => {
        //       throw Error(error);
        //     });
        // },
        // onChange: (state, component) => {
        // },
        // beforeSubmit: (data, dropin, actions) => {
        //   console.log(data.paymentMethod.brand);
        //   if (data.paymentMethod.type == "ideal") {
        //     let paymentsDefaultConfigIdeal = {
        //       amount: {
        //           currency: "EUR",
        //           value: 4900
        //       },
        //       returnUrl: setReturnUrl(),
        //       channel: "web",
        //       reference : "xyz",
        //       merchantAccount: "AdyenTechSupport_2021_Jonathand_TEST",
        //       shopperReference : shopperReference,
        //       shopperEmail: "test@test.com",
        //       countryCode : "NL",
        //       shopperLocale: "en-GB",
        //       shopperInteraction: "Ecommerce"
        //     };
        //     const payData = { ...paymentsDefaultConfigIdeal, ...data}
        //     makePayment(payData)
        //     .then((response) => {
        //       dropin.setStatus("loading");
        //       if (response.action) {
        //         dropin.handleAction(response.action);
        //       } else if (response.resultCode === "Authorised") {
        //         dropin.setStatus("success", { message: "Payment successful!" });
        //         setTimeout(function () {
        //           dropin.setStatus("ready");
        //         }, 2000);
        //       } else if (response.resultCode !== "Authorised") {
        //         dropin.setStatus("error", { message: "Oops, try again please!" });
        //         setTimeout(function () {
        //           dropin.setStatus("ready");
        //         }, 2000);
        //       }
        //     })
        //     .catch((error) => {
        //       throw Error(error);
        //     });
        //   } else {
        //     actions.resolve(data);
        //   }
        // }
      };
      async function initiateCheckout() {
        // Create an instance of AdyenCheckout using the configuration object.
        let checkout = await AdyenCheckout(configuration);

        // Create an instance of Drop-in and mount it to the container you created.
        let dropinComponent = checkout
          .create("dropin", {
            onDisableStoredPaymentMethod: async (storedPaymentMethodId, resolve, reject) => {
              console.log(storedPaymentMethodId)
              const disableReq = {
                  "shopperReference": shopperReference,
                  "recurringDetailReference": storedPaymentMethodId
                }

              var disableRes = await cardDisable(disableReq)
              if (disableRes.response === "[detail-successfully-disabled]") {
                resolve();
              }
              else {
                reject();
              }
            },
            onSelect: (activeComponent) => {
              console.log(activeComponent.props.name);
            },
            showStoredPaymentMethods: true,
            showRemovePaymentMethodButton: true
          })
          .mount("#dropin-container");
          console.log(JSON.parse(window.sessionStorage["adyen-checkout__checkout-attempt-id"]).id);

        // setTimeout(() => {
        //   dropinComponent.unmount();
        //   // dropinComponent = {};
        //   // checkout = {};
        //   paymentsDefaultConfig.amount = {
        //     currency: "SEK",
        //     value: 3900
        //   };
        //   sessionsDropin().then(async (response) => {
        //     const configuration = {
        //       amount: {
        //         currency: "EUR"
        //       },
        //       environment: "test", // Change to 'live' for the live environment.
        //       clientKey: clientKey, // Public key used for client-side authentication: https://docs.adyen.com/development-resources/client-side-authentication
        //       session: {
        //         id: response.id, // Unique identifier for the payment session.
        //         sessionData: response.sessionData, // The payment session data.
        //       },
        //       paymentMethodsConfiguration: {
        //         card:{
        //           enableStoreDetails: true
        //         }
        //       },
        //       onPaymentCompleted: (result, dropin) => {
        //         console.log(result);
        //         updateResponseContainer(result);
        //       },
        //       // onSubmit: (state, dropin) => {
        //       //   console.log(state);
        //       //   makePayment(state.data)
        //       //     .then((response) => {
        //       //       dropin.setStatus("loading");
        //       //       if (response.action) {
        //       //         dropin.handleAction(response.action);
        //       //       } else if (response.resultCode === "Authorised") {
        //       //         dropin.setStatus("success", { message: "Payment successful!" });
        //       //         setTimeout(function () {
        //       //           dropin.setStatus("ready");
        //       //         }, 2000);
        //       //       } else if (response.resultCode !== "Authorised") {
        //       //         dropin.setStatus("error", { message: "Oops, try again please!" });
        //       //         setTimeout(function () {
        //       //           dropin.setStatus("ready");
        //       //         }, 2000);
        //       //       }
        //       //     })
        //       //     .catch((error) => {
        //       //       throw Error(error);
        //       //     });
        //       // },
        //       // onAdditionalDetails: (state, dropin) => {
        //       //   submitDetails(state.data)
        //       //     .then((response) => {
        //       //       if (response.action) {
        //       //         dropin.handleAction(response.action);
        //       //       } else if (response.resultCode === "Authorised") {
        //       //         dropin.setStatus("success", { message: "Payment successful!" });
        //       //         setTimeout(function () {
        //       //           dropin.setStatus("ready");
        //       //         }, 2000);
        //       //       } else if (response.resultCode !== "Authorised") {
        //       //         setTimeout(function () {
        //       //           dropin.setStatus("ready");
        //       //         }, 2000);
        //       //       }
        //       //     })
        //       //     .catch((error) => {
        //       //       throw Error(error);
        //       //     });
        //       // },
        //       onError: (error, component) => {
        //         console.error(error.name, error.message, error.stack, component);
        //       },
        //       onChange: (state, component) => {
        //         // console.log(state);
        //       },
        //       beforeSubmit: (data, component, actions) => {
        //         console.log(data.checkoutAttemptId);
        //         actions.resolve(data);
        //       },
        //     };
        //     checkout = await AdyenCheckout(configuration);

        //     // Create an instance of Drop-in and mount it to the container you created.
        //     dropinComponent = checkout
        //         .create("dropin", {
        //           onDisableStoredPaymentMethod: async (storedPaymentMethodId, resolve, reject) => {
        //             console.log(storedPaymentMethodId)
        //             const disableReq = {
        //                 "shopperReference": shopperReference,
        //                 "recurringDetailReference": storedPaymentMethodId
        //               }

        //             var disableRes = await cardDisable(disableReq)
        //             if (disableRes.response === "[detail-successfully-disabled]") {
        //               resolve();
        //             }
        //             else {
        //               reject();
        //             }
        //           },
        //           onSelect: (activeComponent) => {
        //             console.log(activeComponent.props.name);
        //           },
        //           showStoredPaymentMethods: true,
        //           showRemovePaymentMethodButton: true
        //         })
        //         .mount("#dropin-container");
        //     });
        // }, 3000)
      }
      initiateCheckout();
    });
  }

  async function handleRedirect() {
    const configuration = {
      environment: "live", // Change to 'live' for the live environment.
      clientKey: clientKey, // Public key used for client-side authentication: https://docs.adyen.com/development-resources/client-side-authentication
      session: {
        id: sessionId, // Retreived identifier for the payment completion on redirect.
      },
      onPaymentCompleted: (result, component) => {
        // console.log(component);
        // component.session.session = {};
        console.log(component);
        const paymentResult = result.resultCode;
        if (paymentResult === "Authorised" || paymentResult === "Received") {
          document.getElementById("result-container").innerHTML =
            '<img alt="Success" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/success.svg">';
        } else {
          document.getElementById("result-container").innerHTML =
            '<img alt="Error" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/error.svg">';
        }
        updateResponseContainer(result);
      },
      onChange: (state, component) => {
        updateStateContainer(state); // Demo purposes only
      },
      onError: (error, component) => {
        console.error(error.name, error.message, error.stack, component);
      },
    };
    // Create an instance of AdyenCheckout to handle the shopper returning to your website.
    // Configure the instance with the sessionId you extracted from the returnUrl.
    const checkout = await AdyenCheckout(configuration);
    // Submit the redirectResult value you extracted from the returnUrl.
    checkout.submitDetails({ details: { redirectResult } });
  }

  // If no paramters are present in the URL, mount the Drop-in
  if (!redirectResult && !sessionId) {
    initiateSession();
    // Otherwise, handle the redirect
  } else {
    handleRedirect();
  }
});
