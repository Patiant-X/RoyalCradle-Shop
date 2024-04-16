import webpush from 'web-push';

// Function to send push notification
export const sendPushNotification = (subscription, payload) => {
  webpush
    .sendNotification(subscription, JSON.stringify(payload))
    .catch((error) => {
      console.error('Error sending push notification:', error);
    });
};
