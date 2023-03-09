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
        onSubmit: (state, component) => {
          console.log(state.data.paymentMethod);
          state.data.paymentMethod.type = "googlepay";
          state.data.paymentMethod.googlePayToken = "{\"signature\":\"MEUCIAOHaFMb77brcsLEqqjU9uJqvIC4D8RolsPybnrlrpXKAiEA/0BimTtNO4lSP6CcI+JYXVQkJkCpOQC7IO4mbiKIdGQ\\u003d\",\"protocolVersion\":\"ECv1\",\"signedMessage\":\"{\\\"encryptedMessage\\\":\\\"+RG6k43QL5OVGiduL4zxtykBOuwH4yLzUL0SjRbK0aGhcEDGsDEcSakWXGahxYqiS4436j/djBuQrBgYn07Il5f0ZdHlo48U89VOQbgvEsmERueI+5CT96BuKpjvpi+0BOqylA2cYvMmwwGvQ3lOzayBgWFsYLM/REF4LrnU12zqcET6XLPp3Y0Bf5LJaL8JF5IlFLDb9rqWVMucCMmftDpG4X2zbLCFFjQLMH/xoPRJ0E2jn4ZCXZCijpW4DZPODXO6c1/z7r4GOmW133bh4s09y445DJNK1UfyvH3u1PqHQrGmVRLhEu9NIjQCCIS9mCQWdxDNPrw35+rHQqEjHHgUiubuN/mcZ/Z/M8ABQrJ156l8YfDufouXsXvysLKh2DaOlKR3UQ0AreK/duyy6z0YiCpJQmAZcYQ4u3FHBd0CZ6xt1n4MLXQHnyX80M7Y4JXXnN6j78j1rDxQrPHllLzP5n9N3H20yUZ1F4L6agOB0cToZr8hKNSaSgZfrlmk4BKDQWD1whmcmyN69flZxojokJxD8OaSwyQzzAAtZLEZ0KadJ5tfDxBZeFvHMhG6H3damE91b22zZw\\\\u003d\\\\u003d\\\",\\\"ephemeralPublicKey\\\":\\\"BE3dpQP/Chi/49QnzYnoamoSTgdu7H42Ee48H5deV7BudSlC6e5MCKCUFtantOhUby01yOogPyLWMqxFxAHO5DQ\\\\u003d\\\",\\\"tag\\\":\\\"RrjkNDGmNE5X7mQ00HS7Ev7oenr/0BSbLLMKYqFm3uI\\\\u003d\\\"}\"}";
          console.log(state.data)
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

      const googlePayComponent = checkout.create("paywithgoogle", {
        // onClick: (resolve, reject) => {
        //   console.log(checkout);
        //   paymentsDefaultConfig.amount.value = 4000;
        //   configuration.amount.value = 4000;
        //   resolve();
        // }
      }).mount("#googlepay-container");
  })
});
