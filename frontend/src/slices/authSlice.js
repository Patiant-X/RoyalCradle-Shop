import { createSlice } from '@reduxjs/toolkit';

// Helper function to get online users with message count from localStorage
const getOnlineUsersFromLocalStorage = () => {
  const data = localStorage.getItem('onlineUsers');
  return data ? JSON.parse(data) : [];
};

// Helper function to set online users with message count to localStorage
const setOnlineUsersToLocalStorage = (onlineUsers) => {
  localStorage.setItem('onlineUsers', JSON.stringify(onlineUsers));
};

const initialState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,
  onlineUsers: getOnlineUsersFromLocalStorage(), // [{ userId: 'someId', messageCount: 0 }]
  selectedUser: '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    setOnlineUser: (state, action) => {
      const newOnlineUserIds = action.payload;
      const existingUsers = state.onlineUsers.reduce((acc, user) => {
        acc[user.userId] = user;
        return acc;
      }, {});

      // Add new IDs to the onlineUsers list
      newOnlineUserIds.forEach((userId) => {
        if (!existingUsers[userId]) {
          state.onlineUsers.push({ userId, messageCount: 0 });
        }
      });

      // Update localStorage with the new online users
      setOnlineUsersToLocalStorage(state.onlineUsers);
    },
    setSelectUser: (state, action) => {
      if (action.payload.customer === 'customer') {
        const selectedUserId = action.payload.id;
        state.selectedUser = action.payload.id;
        state.selectedUser = selectedUserId;

        // Check if the user already exists in onlineUser
        const userExists = state.onlineUsers.some(
          (user) => user.userId === selectedUserId
        );

        if (!userExists) {
          // Append the new user with messageCount 0
          state.onlineUsers.push({ userId: selectedUserId, messageCount: 0 });
          // Update localStorage with the new online users list
          setOnlineUsersToLocalStorage(state.onlineUsers);
        }
      } else {
        state.selectedUser = action.payload;
      }
    },
    updateUserMessageCount: (state, action) => {
      const userId = action.payload;
      const user = state.onlineUsers.find((user) => user.userId === userId);
      if (user) {
        user.messageCount += 1;
      }

      // Update localStorage with the updated message count
      setOnlineUsersToLocalStorage(state.onlineUsers);
    },
    resetUserMessageCount: (state, action) => {
      const userId = action.payload;
      const user = state.onlineUsers.find((user) => user.userId === userId);
      if (user) {
        user.messageCount = 0;
      }

      // Update localStorage with the reset message count
      setOnlineUsersToLocalStorage(state.onlineUsers);
    },
    logout: (state) => {
      state.userInfo = null;
      state.onlineUsers = []; // Clear online users
      localStorage.clear();
    },
  },
});

export const {
  setCredentials,
  logout,
  setOnlineUser,
  setSelectUser,
  updateUserMessageCount,
  resetUserMessageCount,
} = authSlice.actions;

export default authSlice.reducer;
