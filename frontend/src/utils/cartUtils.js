import { toast } from 'react-toastify';
import { calculateDistance } from './calculateDeliveryDistance';

export const addDecimals = (num) => {
  return (Math.round(num * 100) / 100).toFixed(2);
};

// NOTE: the code below has been changed from the course code to fix an issue
// with type coercion of strings to numbers.
// Our addDecimals function expects a number and returns a string, so it is not
// correct to call it passing a string as the argument.

export const updateCart = (state) => {
  // Calculate the items price in whole number (pennies) to avoid issues with
  // floating point number calculations
  const itemsPrice = state.cartItems.reduce(
    (acc, item) => acc + (item.price * 100 * item.qty) / 100,
    0
  );
  state.itemsPrice = addDecimals(itemsPrice);

  // Calculate the shipping price

  let shippingPrice = 0;

  const product = state.cartItems.find((item) => item.IsFood === true);
  if (product) {
    const latClient = state.shippingAddress.lat;
    const lngClient = state.shippingAddress.lng;
    if (product.location) {
      const latShop = product.location.latitude;
      const lngShop = product.location.longitude;
      shippingPrice = calculateDistance(latClient, lngClient, latShop, lngShop);
      state.shippingPrice = addDecimals(shippingPrice);
    } else {
      toast.error("Failed to compute delivery")
    }
  } else {
    const latClient = state.shippingAddress.lat;
    const lngClient = state.shippingAddress.lng;
    // Set default shop coordinates
    const latShop = -26.15905;
    const lngShop = 27.81763;
    shippingPrice = calculateDistance(latClient, lngClient, latShop, lngShop);
    state.shippingPrice = addDecimals(shippingPrice);
  }
  
  // Calculate the tax price
  const serviceFee = (10 / 100) * (itemsPrice + shippingPrice);
  state.taxPrice = addDecimals(serviceFee);

  const totalPrice = itemsPrice + shippingPrice + serviceFee;
  // Calculate the total price
  state.totalPrice = addDecimals(totalPrice);

  // Save the cart to localStorage
  localStorage.setItem('cart', JSON.stringify(state));

  return state;
};
