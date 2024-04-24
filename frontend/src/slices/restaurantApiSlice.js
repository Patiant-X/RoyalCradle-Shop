import { apiSlice } from './apiSlice';
import { RESTAURANTS_URL } from '../constants';

export const restaurantSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createRestaurant: builder.mutation({
      query: (restaurant) => ({
        url: RESTAURANTS_URL,
        method: 'POST',
        body: restaurant,
      }),
    }),
    getRestaurantById: builder.query({
      query: (id) => ({
        url: `${RESTAURANTS_URL}/${id}`,
      }),
      keepUnusedDataFor: 5,
    }),
    updateRestaurantById: builder.mutation({
      query: ({ id, updates }) => ({
        url: `${RESTAURANTS_URL}/${id}`,
        method: 'PUT',
        body: updates,
      }),
    }),
    deleteRestaurantById: builder.mutation({
      query: (id) => ({
        url: `${RESTAURANTS_URL}/${id}`,
        method: 'DELETE',
      }),
    }),
    getAllRestaurants: builder.query({
      query: ({ keyword, pageNumber, latitude, longitude, state}) => ({
        url : RESTAURANTS_URL,
        params: { keyword, pageNumber, latitude, longitude, state},
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Restaurant'],
    }),
  }),
});

export const {
  useCreateRestaurantMutation,
  useGetRestaurantByIdQuery,
  useUpdateRestaurantByIdMutation,
  useDeleteRestaurantByIdMutation,
  useGetAllRestaurantsQuery,
} = apiSlice;
