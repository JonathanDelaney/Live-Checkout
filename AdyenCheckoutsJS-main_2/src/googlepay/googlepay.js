getClientKey().then((clientKey) => {
  getPaymentMethods().then(async (paymentMethodsResponse) => {
      const configuration = {
        clientKey: clientKey,
        environment: "test",
        paymentMethodsResponse,
        amount: {
          currency: "USD",
          value: 5000
        },
        paymentMethodsConfiguration: {
          google: {
            // onClick: (state, component) => {
            //   console.log("clicked");
            // },
            configuration: {
              merchantName: "Nameofmerchant",
              gatewayMerchantId: "AdyenTechSupport_2021_Jonathand_TEST",
              merchantId: "50"
            },
            onChange: (state, component) => {
              console.log("change");
            },
            shopperStatement: {
              name: "comeoverhere",
              brandName: "gooverhere"
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
          }
        }
      };

      const checkout = await AdyenCheckout(configuration);

      let count = 0;

      const googlePayComponent = checkout.create("googlepay", {
        async onClick (resolve, reject) {
          console.log("clicked");
          // paymentsDefaultConfig.amount.value = 4000;
          // configuration.amount.value = 4000;
          resolve();
        },
        // buttonType: "donate",
        onAuthorized: (data) => {
          count++
          console.log(data, count);
          // paymentsDefaultConfigG.shopperEmail = data.email.toString();
        },
        async onSubmit (state, component) {
          count++
          console.log("onSubmit", count);
          // let paymentsDefaultConfigG = {
          //   amount: {
          //       currency: "EUR",
          //       value: 4900
          //   },
          //   returnUrl: setReturnUrl(),
          //   channel: "web",
          //   reference : "xyz",
          //   merchantAccount: "AdyenTechSupport_2021_Jonathand_TEST",
          //   shopperReference : shopperReference,
          //   shopperEmail: "test@test.com",
          //   countryCode : "BE",
          //   shopperLocale: "en-GB",
          //   storePaymentMethod : true,
          //   recurringProcessingModel : "CardOnFile",
          //   shopperInteraction: "Ecommerce",
          //   additionalData : {
          //       executeThreeD : true,
          //       allow3DS2: true
          //   },
          //  shopperStatement: {
          //    brandName: "Remy",
          //    name: "some"
          //  },
          // };
          paymentsDefaultConfig.shopperEmail = "new@new.com",
          // console.log(state.data)
          // console.log(paymentsDefaultConfigG);
          // const data = { ...state.data, ...paymentsDefaultConfigG };
          setTimeout(() => {makePayment(state.data).then(console.log("submitted"))}, 1000)
        //   makePaymentG(data)
        //     .then((response) => {
        //       component.setStatus("loading");
        //       if (response.action) {
        //         component.handleAction(response.action);
        //       } else if (response.resultCode === "Authorised") {
        //         component.setStatus("success", { message: "Payment successful!" });
        //         setTimeout(function () {
        //           component.setStatus("ready");
        //         }, 2000);
        //       } else if (response.resultCode !== "Authorised") {
        //         component.setStatus("error", { message: "Oops, try again please!" });
        //         setTimeout(function () {
        //           component.setStatus("ready");
        //         }, 2000);
        //       }
        //     })
        //     .catch((error) => {
        //       throw Error(error);
        //     });
        },
        emailRequired: true,
        billingAddressRequired: true
      }).mount("#googlepay-container");
  })
});

const makePaymentG = (data) => {
  // const paymentsConfig = { ...config, ...paymentsDefaultConfigG };
  // const paymentRequest = { ...paymentsConfig, ...paymentMethod };
  return httpPost("payments", data)
    .then((response) => {
      if (response.error) throw "Payment initiation failed";
      return response;
    })
    .catch(console.error);
};
