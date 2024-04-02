import { ComputeDeliveyPrice } from './ComputeDeliveryPrice.js';

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

  shippingPrice = ComputeDeliveyPrice(orderItems, shippingAddress);

  // Calculate the tax price
  // Calculate the service fee
  const YocoFee = (4 / 100) * (itemsPrice + shippingPrice + 6);
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
