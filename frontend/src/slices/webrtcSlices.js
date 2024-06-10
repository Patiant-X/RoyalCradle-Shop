import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  callInProgress: false,
  remoteStream: null,
  callDetails: null, // Store call details like offerData, senderData, etc.
};

const webRTCSlice = createSlice({
  name: 'webrtc',
  initialState,
  reducers: {
    setCallInProgress: (state, action) => {
      state.callInProgress = action.payload;
    },
    setRemoteStream: (state, action) => {
      state.remoteStream = action.payload;
    },
    setCallDetails: (state, action) => {
      state.callDetails = action.payload;
    },
    clearCall: (state) => {
      state.callInProgress = false;
      state.remoteStream = null;
      state.callDetails = null;
    },
  },
});

export const { setCallInProgress, setRemoteStream, setCallDetails, clearCall } = webRTCSlice.actions;
export default webRTCSlice.reducer;
