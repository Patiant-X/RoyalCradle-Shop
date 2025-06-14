// Function to calculate distance between two points using Haversine formula

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = Math.ceil(R * c); // Distance in kilometers
  return calculateDeliveryfee(distance);
}
// Function to convert degrees to radians
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function calculateDeliveryfee(distance) {
  if (distance <= 2) {
    return 20;
  } 
  if (distance > 2 && distance <= 3) {
    return 25;
  }
  if (distance > 3 && distance <= 4) {
    return 30;
  }
  const baseFee = 20; //Base Delivery fee
  const feeIncrement = 6;

  // Calculate delivery fee based on distance
  const deliveryFee = baseFee + Math.max(distance - 1, 0) * feeIncrement;

  return deliveryFee;
}

export function calculateRestaurantDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = Math.ceil(R * c); // Distance in kilometers
  return distance;
}
