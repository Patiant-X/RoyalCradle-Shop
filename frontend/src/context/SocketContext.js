import { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { setOnlineUser } from '../slices/authSlice';

export const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [socket, setSocket] = useState(null);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo && userInfo?._id) {
      const newSocket = io('https://royalcradle-shop.onrender.com', {
        query: {
          userId: userInfo._id,
          userRole: userInfo.role,
        },
      });
      newSocket.on('onlineCustomers', (data) => {
        if (userInfo && userInfo._id) {
          // Filter out userInfo._id from the data
          const filteredData = data.filter((id) => id !== userInfo._id);
          // Dispatch the action with the filtered data
          dispatch(setOnlineUser(filteredData));
        } else {
          // Dispatch the action with the original data if userInfo._id is not available
          dispatch(setOnlineUser(data));
        }
      });
      newSocket.on('onlineCustomerNames', (data) => {
        const storedData =
          JSON.parse(localStorage.getItem('onlineCustomerNames')) || {};

        const updatedData = { ...storedData, ...data };

        for (let key in data) {
          if (JSON.stringify(storedData[key]) !== JSON.stringify(data[key])) {
            updatedData[key] = data[key];
          }
        }

        localStorage.setItem(
          'onlineCustomerNames',
          JSON.stringify(updatedData)
        );
      });
      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [userInfo, dispatch]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
