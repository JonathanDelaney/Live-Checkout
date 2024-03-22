// 0. Get clientKey
const asyncCheckout = async () => {
  console.log("theasyncmethod");
  const clientKey = await getClientKey();
  const paymentMethodsResponse = await getPaymentMethods();
  const configuration = {
    environment: "live",
    amount: {
        value: 0,
        currency: 'EUR'
    },
    clientKey: clientKey, // Mandatory. clientKey from Customer Area
    paymentMethodsResponse,
    onChange: (state, component) => {
      updateStateContainer(state); // Demo purposes only
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
    onAdditionalDetails: async (state, dropin) => {
      console.log(state.data);
      const response = await submitDetails(state.data);
      if (response.action) {
        console.log(response);
        dropin.handleAction(response.action);
      } else if (response.resultCode === "Authorised") {
        dropin.setStatus("success", { message: "Payment successful!" });
        setTimeout(function () {
          dropin.setStatus("ready");
        }, 2000);
      } else if (response.resultCode !== "Authorised") {
        dropin.setStatus("error", { message: "Oops, try again please!" });
        setTimeout(function () {
          dropin.setStatus("ready");
        }, 2000);
      }
    },
    paymentMethodsConfiguration: {
      card: {
        enableStoreDetails: true
      },
      klarna_account:{
        name: "Achter maintenant"
      },
      applepay: {
        countryCode: "NL",
        amount: {
          currency: "EUR",
          value: 100
        },
        onClick: (resolve, reject) => {
            console.log('Apple Pay - Button clicked');
            resolve();
        }
      }
    }
  };
  console.log(paymentMethodsResponse);
  
  // 1. Create an instance of AdyenCheckout
  const checkout = await AdyenCheckout(configuration);



  
  
  // 2. Create and mount the Component
  const dropin = checkout
    .create("dropin", {
      showStorePaymentMethodButton: true,
      showRemovePaymentMethodButton: true,
      
      //showPayButton: true,
      onSelect: (component) => {
        console.log(component.props.type);
      }
    })
    .mount("#dropin-container");
  console.log(dropin);

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
      environment: "live",
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
      environment: "live",
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
