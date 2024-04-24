import { ComputeDeliveryAddress } from './deliveryAddress';

export const addDecimals = (num) => {
  return (Math.round(num * 100) / 100).toFixed(2);
};

// NOTE: the code below has been changed from the course code to fix an issue
// with type coercion of strings to numbers.
// Our addDecimals function expects a number and returns a string, so it is not
// correct to call it passing a string as the argument.

export const updateCart = (state) => {
  try {
    // Calculate the items price in whole number (pennies) to avoid issues with
    // floating point number calculations
    const itemsPrice = state.cartItems.reduce(
      (acc, item) => acc + (item.price * 100 * item.qty) / 100,
      0
    );
    state.itemsPrice = addDecimals(itemsPrice);
    let deliveryPrice;
    if (state.shippingAddress.delivery) {
      // Calculate the shipping price
    deliveryPrice = ComputeDeliveryAddress(state);

    // Calculate the shipping price based on total distance
    state.shippingPrice = addDecimals(deliveryPrice);
    }else {
      state.shippingPrice = addDecimals(0);
      deliveryPrice = 0;
    }

    // Calculate the service fee
    const YocoFee = (4 / 100) * (itemsPrice + deliveryPrice + 6); // This is because Capitec charges R2 for payments

    const YocoVat = (15 / 100) * YocoFee;

    const YocoTotalFee = YocoFee + YocoVat;

    const serviceFee = YocoTotalFee + 6;
    state.taxPrice = addDecimals(serviceFee);
    const totalPrice = itemsPrice + deliveryPrice + serviceFee;
    // Calculate the total price
    state.totalPrice = addDecimals(totalPrice);

    // Save the cart to localStorage
    localStorage.setItem('cart', JSON.stringify(state));

    return state;
  } catch (error) {
    return state;
  }
};
