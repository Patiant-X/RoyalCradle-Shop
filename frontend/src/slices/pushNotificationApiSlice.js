// pushNotificationApiSlice.js

import { apiSlice } from './apiSlice';
import { NOTIFICATIONS_URL } from '../constants';

export const pushNotificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    handleSubscribe: builder.mutation({
      query: (subscription) => ({
        url: NOTIFICATIONS_URL,
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),
    sendNotification: builder.mutation({
      query: (notificationData) => ({
        url: `${NOTIFICATIONS_URL}/send-push-notification`,
        method: 'POST',
        body: notificationData,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),
  }),
});

export const { useHandleSubscribeMutation, useSendNotificationMutation } =
  pushNotificationApiSlice;
