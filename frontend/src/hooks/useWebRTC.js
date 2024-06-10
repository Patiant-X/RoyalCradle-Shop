import { useEffect, useRef } from 'react';
import { useSocketContext } from '../context/SocketContext';
import { useToast } from '../context/ToastContext'
import { FaPhone } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Button, ButtonGroup } from 'react-bootstrap';
import {
  setCallInProgress,
  setRemoteStream,
  setCallDetails,
  clearCall,
} from '../slices/webrtcSlices';
import { useDispatch, useSelector } from 'react-redux';
import ringtoneSrc from '../utils/mixkit-bubble-pop-up-alert-notification-2357.mp3'
import useRingtone from '../hooks/useRingtone'

const useWebRTC = (user, userInfo) => {
  const dispatch = useDispatch();
  const { socket } = useSocketContext();
  const callInProgress = useSelector((state) => state.webrtc.callInProgress);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const showToast = useToast()
  const audioRef = useRef(null); 
  //const { playRingtone , stopRingtone } = useRingtone(ringtoneSrc);

  const ringtoneAudio = useRef(new Audio(ringtoneSrc));

  useEffect(() => {
    if (!socket) return;

    socket.on('offer', handleReceiveOffer);
    socket.on('answer', handleReceiveAnswer);
    socket.on('ice-candidate', handleReceiveIceCandidate);
    socket.on('call-rejected', handleCallRejected);
    socket.on('call-ended', handleCallEnded);

    return () => {
      socket.off('offer', handleReceiveOffer);
      socket.off('answer', handleReceiveAnswer);
      socket.off('ice-candidate', handleReceiveIceCandidate);
      socket.off('call-rejected', handleCallRejected);
      socket.off('call-ended', handleCallEnded);
    };
  }, [socket, user, userInfo]);

  const handleReceiveOffer = async (offerData) => {
    if (callInProgress) {
      rejectCall(offerData);
      return;
    }
    const { senderData } = offerData;
    //playRingtone()
    const mes = (
      <div style={{ fontSize: '12px', padding: '0px' }}>
        <h2 style={{ fontSize: '14px', margin: '0 0 0px 0', fontWeight: 'bold' }}>
          {senderData?.name}
        </h2>
        <ButtonGroup className='mt-2'>
          <Button
            variant='success'
            onClick={() => acceptCall(offerData)}
            className='icon accept'
            style={{ marginRight: '10px' }}
          >
            <FaPhone />
          </Button>
          <Button
            variant='danger'
            onClick={() => rejectCall(offerData)}
            className='icon reject'
          >
            <FaPhone />
          </Button>
        </ButtonGroup>
      </div>
    );
    showToast(mes, {
      position: 'top-right',
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });
    dispatch(setCallDetails(offerData));
  };

  const acceptCall = async (offerData) => {
    //stopRingtone();
    toast.dismiss();
    try {
      await fetchUserMedia();

      const peerConnection = createPeerConnection(offerData.senderData);
      localStreamRef.current.getTracks().forEach((track) => {
        if (!peerConnection.getSenders().find((sender) => sender.track === track)) {
          peerConnection.addTrack(track, localStreamRef.current);
        }
      });

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offerData?.offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket.emit('answer', {
        answer,
        senderData: offerData?.senderData,
        receiverData: offerData?.receiverData,
        accepted: true,
      });
      dispatch(setCallInProgress(true));
    } catch (error) {
      console.error('Error handling receive offer', error);
    }
  };

  const rejectCall = (offerData) => {
   // stopRingtone();
    toast.dismiss();
    socket.emit('answer', {
      accepted: false,
      senderData: offerData.senderData,
    });
  };

  const handleCallRejected = (message) => {
    dispatch(setCallInProgress(false));
    toast.error(message?.message);
  };

  const handleCallEnded = (user) => {
    if (callInProgress) {
      toast.success(`Call ended`);
    }
    dispatch(clearCall());
  };

  const handleReceiveAnswer = async (answer) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling receive answer', error);
    }
  };

  const handleReceiveIceCandidate = async (candidate) => {
    try {
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error adding received ice candidate', error);
    }
  };

  const createPeerConnection = (data) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          receiverData: data,
        });
      }
    };

    peerConnection.ontrack = (event) => {
      dispatch(setRemoteStream(event.streams[0]));
    };

    peerConnectionRef.current = peerConnection;

    return peerConnection;
  };

  const fetchUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        alert('Microphone access was denied. Please check your system and browser settings.');
      } else if (error.name === 'NotFoundError') {
        alert('No microphone found. Please ensure your device has a microphone.');
      } else {
        alert('Error accessing media devices: ' + error.message);
      }
    }
  };

  const startCall = async () => {
    try {
      if (!user || !userInfo) {
        return;
      }
      await fetchUserMedia();
      const peerConnection = createPeerConnection(user);
      localStreamRef.current.getTracks().forEach((track) => {
        if (!peerConnection.getSenders().find((sender) => sender.track === track)) {
          peerConnection.addTrack(track, localStreamRef.current);
        }
      });

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socket.emit('offer', {
        offer,
        senderData: userInfo,
        receiverData: user,
      });
      dispatch(setCallInProgress(true));
    } catch (error) {
      console.error('Error starting call', error);
    }
  };

  const endCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (callInProgress) {
      toast.success(`Call ended`);
    }
    dispatch(clearCall());
    socket.emit('call-ended', user);
  };

  return {
    startCall,
    endCall,
    callInProgress,
  };
};

export default useWebRTC;
