// import { calculateDistance } from './calculateDeliveryDistance';

// // Function to check if two locations are equal
// function areLocationsEqual(location1, location2) {
//   return (
//     location1.latitude === location2.latitude &&
//     location1.longitude === location2.longitude
//   );
// }

// export const ComputeDeliveryAddress = (state) => {
//   // let shippingPrice = 0;
//   let totalDistance = 0;
//   let prevLat, prevLng, nextLat, nextLng;

//   const foodProducts = [];
//   const notFoodProducts = [];
//   let productsQty = 0;
//   let notFoodProductQty = 0;

//   for (let product of state.cartItems) {
//     if (product.IsFood === true) {
//       // Check if the product's location is already in foodProducts
//       const locationExists = foodProducts.some((item) =>
//         areLocationsEqual(item.location, product.location)
//       );
//       productsQty += product.qty;
//       if (!locationExists) {
//         foodProducts.push(product);
//       }
//     } else {
//       notFoodProductQty += product.qty;
//       notFoodProducts.push(product);
//     }
//   }
//   // if (productsQty > 5) {
//   //   throw new Error(`Only 5 food items allowed, you have ${productsQty}`);
//   // }
//   // if (notFoodProductQty > 5) {
//   //   throw new Error(
//   //     `Only 5 non-food items allowed, you have ${notFoodProductQty}`
//   //   );
//   // }

//   if (notFoodProducts.length > 0 && foodProducts.length > 0) {
//     totalDistance += 5;
//   }
//   if (notFoodProducts.length && !(foodProducts.length > 0)) {
//     totalDistance += 10;

//   }
//   if (foodProducts.length > 0) {
//     for (let index = foodProducts.length - 1; index > 0; index--) {
//       prevLat = foodProducts[index]?.location.latitude;
//       prevLng = foodProducts[index]?.location.longitude;
//       nextLat = foodProducts[index - 1]?.location.latitude;
//       nextLng = foodProducts[index - 1]?.location.longitude;
//       totalDistance += calculateDistance(prevLat, prevLng, nextLat, nextLng);
//       prevLat = nextLat;
//       prevLng = nextLng;
//     }
//     prevLat = state.shippingAddress?.lat;
//     prevLng = state.shippingAddress?.lng;
//     nextLat = foodProducts[0]?.location.latitude;
//     nextLng = foodProducts[0]?.location.longitude;
//     totalDistance += calculateDistance(prevLat, prevLng, nextLat, nextLng);
//   } 
//   // else {
//   //   throw new Error('Please choose items from the store');
//   // }
//   return totalDistance;
// };

import { calculateDistance } from './calculateDeliveryDistance';

export const ComputeDeliveryAddress = (state) => {
  let totalDistance = 0;
  let prevLat, prevLng, nextLat, nextLng;

  const cartItems = state.cartItems;
  const numItems = cartItems.length;

  if (numItems === 0) {
    return totalDistance;
  }

  // Start calculating distance from user to the first product
  prevLat = state.shippingAddress?.lat;
  prevLng = state.shippingAddress?.lng;
  nextLat = cartItems[0]?.location.latitude;
  nextLng = cartItems[0]?.location.longitude;
  totalDistance += calculateDistance(prevLat, prevLng, nextLat, nextLng);

  // If there are more than one items, compute distance between consecutive items
  if (numItems > 1) {
    for (let i = 1; i < numItems; i++) {
      prevLat = cartItems[i - 1]?.location.latitude;
      prevLng = cartItems[i - 1]?.location.longitude;
      nextLat = cartItems[i]?.location.latitude;
      nextLng = cartItems[i]?.location.longitude;
      totalDistance += calculateDistance(prevLat, prevLng, nextLat, nextLng);
    }
  }

  return totalDistance;
};

