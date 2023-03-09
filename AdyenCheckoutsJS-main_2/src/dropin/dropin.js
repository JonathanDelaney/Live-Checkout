// 0. Get clientKey
const asyncCheckout = async () => {
  console.log("theasyncmethod");
  const clientKey = await getClientKey();
  const paymentMethodsResponse = await getPaymentMethods();
  const configuration = {
    environment: "test",
    clientKey: clientKey, // Mandatory. clientKey from Customer Area
    paymentMethodsResponse,
    paymentMethodsConfiguration: {
    },
    // amount: {
    //   currency: "USD",
    //   value: 4900
    // },
    // onChange: (state, component) => {
    //   updateStateContainer(state); // Demo purposes only
    // },
    // // onError: (error) => {
    // //   console.log(error);
    // //   dropin.setStatus("ready");
    // // },
    // // onCancel: (error) => {
    // //   console.log("Cancel event");
    // //   dropin.setStatus("ready");
    // // },
    // onActionHandled: (data) => {
    //   console.log("Action handled");
    //   console.log(data);
    // },
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
    // onAdditionalDetails: async (state, dropin) => {
    //   console.log(state.data);
    //   const response = await submitDetails(state.data);
    //   if (response.action) {
    //     console.log(response);
    //     dropin.handleAction(response.action);
    //   } else if (response.resultCode === "Authorised") {
    //     dropin.setStatus("success", { message: "Payment successful!" });
    //     setTimeout(function () {
    //       dropin.setStatus("ready");
    //     }, 2000);
    //   } else if (response.resultCode !== "Authorised") {
    //     dropin.setStatus("error", { message: "Oops, try again please!" });
    //     setTimeout(function () {
    //       dropin.setStatus("ready");
    //     }, 2000);
    //   }
    // },
    // paymentMethodsConfiguration: {
    //   card: {
    //     enableStoreDetails: true
    //   }
    // }
  };
  console.log(paymentMethodsResponse);
  // 1. Create an instance of AdyenCheckout
  const checkout = await AdyenCheckout(configuration);

  // 2. Create and mount the Component
  const dropin = checkout
    .create("dropin", {
      showStorePaymentMethodButton: true,
      showRemovePaymentMethodButton: true
    })
    .mount("#dropin-container");
  console.log(dropin);

  let isRecurring = false;
  function makeRecurring () {
    if (isRecurring === false) {
      paymentsDefaultConfig.recurringProcessingModel = "Subscription";
      isRecurring = true;
    } else {
      paymentsDefaultConfig.recurringProcessingModel = "CardOnFile";
      isRecurring = false;
    }
  };
  const reSwitch = document.getElementById("recurring");
  reSwitch.addEventListener("click", makeRecurring)



  // Redirect handling code starts here till the end

  const getSearchParameters = (search = window.location.search) =>
  search
    .replace(/\?/g, "")
    .split("&")
    .reduce((acc, cur) => {
      const [key, prop = ""] = cur.split("=");
      acc[key] = decodeURIComponent(prop);
      return acc;
    }, {});

  const { redirectResult } = getSearchParameters(window.location.search);

  async function handleRedirectResult(redirectResult) {
    const checkout = await AdyenCheckout({
      environment: "test",
      clientKey: clientKey
    });
    const dropin = checkout
      .create("dropin", {
        setStatusAutomatically: false,
      })
      .mount("#dropin-container");

    const response = await submitDetails({ details: { redirectResult } });
    if (response.resultCode === "Authorised") {
      dropin.setStatus("success", { message: "Payment successful!" });
    } else if (response.resultCode !== "Authorised") {
      dropin.setStatus("error", { message: "Oops, try again please!" });
    }
  }


  if (redirectResult) {
    handleRedirectResult(redirectResult);
  }

  // Pre v67 MD PaRes

  async function handleMDPaRes(MD, PaRes) {
    const checkout = new AdyenCheckout({
      environment: "test",
      clientKey: clientKey
    });
    const dropin = checkout
      .create("dropin", {
        setStatusAutomatically: false,
      })
      .mount("#dropin-container");

    const response = await submitDetails({ details: { MD, PaRes } });
    if (response.resultCode === "Authorised") {
      dropin.setStatus("success", { message: "Payment successful!" });
    } else if (response.resultCode !== "Authorised") {
      dropin.setStatus("error", { message: "Oops, try again please!" });
    }
  }

  console.log(window.location.search);
  const { MD, PaRes } = getSearchParameters(window.location.search);

  if (MD && PaRes) {
    console.log(MD, PaRes);
    handleMDPaRes(MD, PaRes);
  }
}


asyncCheckout();
