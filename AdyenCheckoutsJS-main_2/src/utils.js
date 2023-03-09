function setReturnUrl() {
  if (window.location.pathname) {
    return window.location.href;
  } else {
    return "http://localhost:3002/";
  }
}

const shopperReference = "xyz";

const paymentMethodsConfig = {
  reference: Math.random(),
  countryCode: "NL",
  shopperLocale: "en-GB",
  shopperReference: shopperReference,
  amount: {
    value: 100,
    currency: "EUR",
  }
};

let paymentsDefaultConfig = {
    amount: {
        currency: "EUR",
        value: 100
    },
    returnUrl: setReturnUrl(),
    // blockedPaymentMethods: ["scheme"],
    channel: "web",
    // origin: setReturnUrl(),
    reference : "xyz",
    merchantAccount: "AdyenTechSupport_2021_Jonathand_TEST",
    shopperReference : shopperReference,
    shopperEmail: "test@test.com",
    countryCode : "NL",
    shopperLocale: "en-GB",
    // storePaymentMethodMode: "enabled",
    // storePaymentMethod : true,
    // redirectFromIssuerMethod: "GET",
    // recurringProcessingModel : "CardOnFile",
    // shopperInteraction: "Ecommerce",
    // authenticationData : {
    //
    // },
    additionalData : {
        executeThreeD : true,
        allow3DS2: true
    },
  //  billingAddress:{
  //     city:"Ankeborg",
  //     country:"SE",
  //     houseNumberOrName:"1",
  //     postalCode:"12345",
  //     street:"Stargatan"
  //  },
  // enableRecurring: true,
  // enableOneClick: true,
  //  shopperStatement: {
  //    brandName: "Remy",
  //    name: "some"
  //  },
  //  channel: "web",
  // lineItems: [
  //   {
  //     id: "1",
  //     description: "Test Item 1",
  //     amountExcludingTax: 10000,
  //     amountIncludingTax: 11800,
  //     taxAmount: 1800,
  //     taxPercentage: 1800,
  //     quantity: 1,
  //     taxCategory: "High",
  //     imageUrl: "https://cdn.dsmcdn.com/ty18/product/media/images/20201026/12/19682072/97612972/1/1_org_zoom.jpg"
  //   },
  // ],
};

// Generic POST Helper
const httpPost = (endpoint, data) =>
  fetch(`/${endpoint}`, {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((response) => response.json());

// Get all available payment methods from the local server
const getPaymentMethods = () =>
  httpPost("paymentMethods", paymentMethodsConfig)
    .then((response) => {
      if (response.error) throw "No paymentMethods available";
      return response;
    })
    .catch(console.error);

// Posts a new payment into the local server
const makePayment = (paymentMethod, config = {}) => {
  const paymentsConfig = { ...config, ...paymentsDefaultConfig };
  console.log(paymentsConfig);
  const paymentRequest = { ...paymentsConfig, ...paymentMethod };
  console.log(paymentMethod);
  if (paymentRequest.amount.value > 100) {
    return "Too much"
  };
  return httpPost("payments", paymentRequest)
    .then((response) => {
      if (response.error) throw "Payment initiation failed";
      return response;
    })
    .catch(console.error);
};

// Make payments/details call
const submitDetails = (details) => {
  return httpPost("paymentsDetails", details)
    .then((response) => {
      return response;
    })
    .catch(console.error);
};

// Make payments/details call
const cardDisable = (storedPaymentMethodId, resolve, reject) => {
  console.log("disabling card details");
  return httpPost("disable", storedPaymentMethodId)
    .then((response) => {
      return response;
    })
    .catch(console.error);
};

// Fetches an originKey from the local server
const getOriginKey = () =>
  httpPost("originKeys")
    .then((response) => {
      if (response.error || !response.originKeys)
        throw "No originKey available";

      return response.originKeys[Object.keys(response.originKeys)[0]];
    })
    .catch(console.error);

// Fetches a clientKey from the
const getClientKey = () =>
  httpPost("clientKeys")
    .then((response) => {
      if (response.error || !response.clientKey) throw "No clientKey available";

      return response.clientKey;
    })
    .catch(console.error);

// Make the /sessions call (for CHECKOUT SDK)
const makeSessionsCall = () => {
  return httpPost("webSdk")
    .then((response) => {
      console.log(response);
      return response;
    })
    .catch(console.error);
};

// ------------------------------------------------SESSIONS FUNCTIONS START HERE ------------------------------------------------

// Makes the /session call (for Drop-in)

const sessionsDropin = (paymentMethod, config = {}) => {
  const paymentsConfig = { ...paymentsDefaultConfig, ...config };
  const sessionRequest = { ...paymentsConfig, ...paymentMethod };

  return httpPost("sessions", sessionRequest)
    .then((response) => {
      if (response.error) throw "Payment initiation failed";
      return response;
    })
    .catch(console.error);
};

// Makes the optional /payments call for sessions

const makePayments = (paymentMethod, config = {}) => {
  console.log(paymentMethod, config);
  const paymentsConfig = { ...paymentsDefaultConfigForSession, ...config };
  const paymentRequest = { ...paymentsConfig, ...paymentMethod };
  console.log(paymentRequest);

  return httpPost("makePayment", paymentRequest)
    .then((response) => {
      console.log(response);
      if (response.error) throw "Payment initiation failed";
      return response;
    })
    .catch(console.error);
};

function onBinLookup(pCallbackObj) {
    // Handle a dual branded result
    if (pCallbackObj.supportedBrandsRaw?.length > 1) {
        onDualBrand(pCallbackObj);
    }
}
// Implement dual branding
function onDualBrand(pCallbackObj) {
  const bancontactLogo = document.getElementById('#pmImageDual1');
  const maestroLogo = document.getElementById('#pmImageDual2');
  const supportedBrands = pCallbackObj.supportedBrandsRaw;

  //Set Bancontact brand icon, add alt or data-value attributes; add an event listener
  bancontactLogo.setAttribute('src', supportedBrands[0].brandImageUrl);
  bancontactLogo.setAttribute('alt', supportedBrands[0].brand);
  bancontactLogo.setAttribute('data-value', supportedBrands[0].brand);
  bancontactLogo.addEventListener('click', dualBrandListener(supportedBrands[0].brand));

  // Set Maestro brand icon, add alt or data-value attributes; add an event listener
  maestroLogo.setAttribute('src', supportedBrands[1].brandImageUrl);
  maestroLogo.setAttribute('alt', supportedBrands[1].brand);
  maestroLogo.setAttribute('data-value', supportedBrands[1].brand);
  maestroLogo.addEventListener('click', dualBrandListener(supportedBrands[1].brand));
}

function dualBrandListener(e) {
  console.log(e);
  // const selectedBrand = document.getElementById('#pmImageDual2');
  // selectedBrand.getAttribute('alt');
}

const paymentsDefaultConfigForSession = {
  merchantAccount: "AdyenTechSupport_2021_Jonathand_TEST",
  reference: Math.random(),
  countryCode: paymentMethodsConfig.countryCode,
  channel: "Web",
  shopperEmail: "adyen@adyen.com",
  dateOfBirth: "1985-07-30",
  shopperName: {
    firstName: "Alex",
    lastName: "Iordachescu",
  },
  paymentMethod: "ideal",
  shopperReference: Math.random(),
  shopperLocale: "fr_FR",
  billingAddress: {
    city: "Lupoaica",
    country: "GB",
    houseNumberOrName: "N/A",
    postalCode: "N/A",
    street: "461 Rue du Centenaire",
  },
  deliveryAddress: {
    city: "UGINE",
    country: "FR",
    houseNumberOrName: "0",
    postalCode: "73400",
    street: "461 Rue du Centenaire",
  },
  origin: "http://localhost:3000",
  telephoneNumber: "+33 1 76 35 07 90",
  amount: {
    value: 30000,
    currency: "EUR",
  },
  storePaymentMethod: true,
  lineItems: [
    {
      id: "1",
      description: "Test Item 1",
      amountExcludingTax: 10000,
      amountIncludingTax: 11800,
      taxAmount: 1800,
      taxPercentage: 1800,
      quantity: 1,
      taxCategory: "High",
    },
  ],
  additionalData: {
    allow3DS2: true,
  },
};
