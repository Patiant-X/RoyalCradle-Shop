import { calculateDistance } from './calculateDeliveryDistanceFee.js';

function addDecimals(num) {
  return (Math.round(num * 100) / 100).toFixed(2);
}

// NOTE: the code below has been changed to fix an issue
// with type coercion of strings to numbers.
// Our addDecimals function expects a number and returns a string, so it is not
// correct to call it passing a string as the argument.

export function calcPrices(orderItems, shippingAddress) {
  // Calculate the items price in whole number (pennies) to avoid issues with
  // floating point number calculations
  const itemsPrice = orderItems.reduce(
    (acc, item) => acc + (item.price * 100 * item.qty) / 100,
    0
  );

  // Calculate the shipping price
  let shippingPrice = 0;

  const product = orderItems.find((item) => item.IsFood === true);
  if (product) {
    const latClient = shippingAddress.lat;
    const lngClient = shippingAddress.lng;
    if (product.location) {
      const latShop = product.location.latitude;
      const lngShop = product.location.longitude;
      shippingPrice = calculateDistance(latClient, lngClient, latShop, lngShop);
      // shippingPrice = addDecimals(shippingPrice);
    } else {
      // shippingPrice = addDecimals(20);
      shippingPrice = 20;
    }
  } else {
    const latClient = shippingAddress.lat;
    const lngClient = shippingAddress.lng;
    // Set default shop coordinates for drinks or bread or chips at Arizona
    // const latShop = -26.15824523119767;
    // const lngShop = 27.817694505487587;

    // This is 2nd shop
    const latShop = -26.147148954967506;
    const lngShop = 27.8160062928267;

    shippingPrice = calculateDistance(latClient, lngClient, latShop, lngShop);
    // shippingPrice = addDecimals(shippingPrice);
  }

  // Calculate the tax price
  // Calculate the service fee
  const YocoFee = (3 / 100) * (itemsPrice + shippingPrice);
  const YocoVat = (15 / 100) * YocoFee;
  const YocoTotalFee = YocoFee + YocoVat;
  const taxPrice = YocoTotalFee + 6; // This is because Capitec charges R2 for payments

  // Calculate the total price
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  // return prices as strings fixed to 2 decimal places
  return {
    itemsPrice: addDecimals(itemsPrice),
    shippingPrice: addDecimals(shippingPrice),
    taxPrice: addDecimals(taxPrice),
    totalPrice: addDecimals(totalPrice),
  };
}
