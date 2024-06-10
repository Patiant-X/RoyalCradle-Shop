import { useSelector} from 'react-redux';
import { useSocketContext } from '../context/SocketContext.js';
import { useEffect, useState, useCallback } from 'react';

const useConversations = (userId) => {
  const { userInfo } = useSelector((state) => state.auth);
  const { selectedUser } = useSelector((state) => state.auth);
  const { socket } = useSocketContext();
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    profile_pic: '',
    online: false,
    _id: '',
  });

  const handleMessageUser = useCallback((data) => {
    setUserData({
      name: data.name,
      email: data.email,
      profile_pic: data.profile_pic,
      online: data.online,
      _id: data._id,
    });
  }, []);

  const handleMessages = useCallback((data) => {
    const lastMessage = data[data.length - 1];
    if (
      (lastMessage?.msgByNonUserId === selectedUser &&
        lastMessage?.msgByUserId === userInfo._id) ||
      (lastMessage?.msgByNonUserId === userInfo._id &&
        lastMessage?.msgByUserId === selectedUser)
    ) {
      setMessages(data);
    }
  }, [selectedUser, userInfo?._id]);

  useEffect(() => {
    if (socket && userId && selectedUser !== '' && userInfo?._id) {
      socket.emit('message-page', userId);
      socket.on('message-user', handleMessageUser);
      socket.on('message', handleMessages);

      return () => {
        socket.off('message-user', handleMessageUser);
        socket.off('message', handleMessages);
      };
    }
  }, [socket, userId, userInfo?._id, selectedUser, handleMessageUser, handleMessages]);

  return { allMessage: messages, userData };
};

export default useConversations;
