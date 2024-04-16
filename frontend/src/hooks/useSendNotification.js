import { useSendNotificationMutation } from '../slices/pushNotificationApiSlice.js';

const useSendNotification = () => {
  const [sendNotificationMutation] = useSendNotificationMutation();

  const sendNotification = async (notificationData) => {
    try {
      await sendNotificationMutation(notificationData).unwrap();
      console.log('Notification sent successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  return sendNotification;
};

export default useSendNotification;
