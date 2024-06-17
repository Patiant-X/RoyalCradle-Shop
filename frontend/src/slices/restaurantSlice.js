import { createSlice } from '@reduxjs/toolkit';

// Helper function to get restaurant data from localStorage
const getRestaurantsFromLocalStorage = () => {
  const data = localStorage.getItem('restaurantList');
  return data ? JSON.parse(data) : [];
};

// Helper function to set restaurants to localStorage
const setRestaurantListToLocalStorage = (restaurantList) => {
  localStorage.setItem('restaurantList', JSON.stringify(restaurantList));
};

const initialState = {
  restaurantList: getRestaurantsFromLocalStorage(),
};

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {
    setRestaurantList: (state, action) => {
      const newRestaurants = action.payload;

      // Create a map for quick look-up of existing restaurants
      const existingRestaurants = state.restaurantList.reduce((acc, restaurant) => {
        acc[restaurant._id] = restaurant;
        return acc;
      }, {});

      // Update or add new restaurants
      newRestaurants.forEach((newRestaurant) => {
        existingRestaurants[newRestaurant._id] = newRestaurant;
      });

      // Update the state with the new list
      state.restaurantList = Object.values(existingRestaurants);

      // Update localStorage with the new restaurant list
      setRestaurantListToLocalStorage(state.restaurantList);
    },
  },
});

export const { setRestaurantList } = restaurantSlice.actions;

export default restaurantSlice.reducer;
