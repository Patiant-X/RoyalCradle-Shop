import { PRODUCTS_URL } from '../constants';
import { apiSlice } from './apiSlice';

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({
        keyword,
        pageNumber,
        latitude,
        longitude,
        restaurant,
        category,
      }) => ({
        url: PRODUCTS_URL,
        params: {
          keyword,
          pageNumber,
          latitude,
          longitude,
          restaurant,
          category,
        },
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Products'],
    }),
    getRestaurants: builder.query({
      query: () => ({
        url: `${PRODUCTS_URL}/restaurants`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Product'],
    }),
    getRestaurantProduct: builder.query({
      query: ({ id }) => ({
        url: `${PRODUCTS_URL}/restaurant`,
        params: { id },
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Product'],
    }),
    getProductDetails: builder.query({
      query: (productId) => ({
        url: `${PRODUCTS_URL}/${productId}`,
      }),
      keepUnusedDataFor: 5,
    }),
    createProduct: builder.mutation({
      query: (id) => ({
        url: `${PRODUCTS_URL}/${id}`,
        method: 'POST',
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation({
      query: (data) => ({
        url: `${PRODUCTS_URL}/${data.productId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Products'],
    }),
    updateAllProductsToAvailable: builder.mutation({
      query: (userId) => ({
        url: PRODUCTS_URL,
        method: 'PATCH',
        body: userId,
      }),
    }),
    updateAllProductsToNotAvailable: builder.mutation({
      query: (userId) => ({
        url: `${PRODUCTS_URL}/notavailable`,
        method: 'PATCH',
        body: userId,
      }),
    }),
    uploadProductImage: builder.mutation({
      query: (data) => ({
        url: `/api/upload`,
        method: 'POST',
        body: data,
      }),
    }),
    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `${PRODUCTS_URL}/${productId}`,
        method: 'DELETE',
      }),
      providesTags: ['Product'],
    }),
    createReview: builder.mutation({
      query: (data) => ({
        url: `${PRODUCTS_URL}/${data.productId}/reviews`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    getTopProducts: builder.query({
      query: () => `${PRODUCTS_URL}/top`,
      keepUnusedDataFor: 5,
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useGetTopProductsQuery,
  useGetRestaurantProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUploadProductImageMutation,
  useDeleteProductMutation,
  useCreateReviewMutation,
  useUpdateAllProductsToAvailableMutation,
  useUpdateAllProductsToNotAvailableMutation,
} = productsApiSlice;
