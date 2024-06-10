import { useState, useEffect, useRef } from 'react';
import { useSocketContext } from '../context/SocketContext.js';
import { FaPhone } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const AudioCall = ({ user }) => {
  const userInfo = useSelector((state) => state.auth.userInfo);
  const { socket } = useSocketContext();
  const [isCalling, setIsCalling] = useState(false);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  let peerConnection;
  let localStream;
  let didIOffer = false;
  const [isInCall, setIsInCall] = useState(false);

  // useEffect(() => {
  //   socket.on('newOfferAwaiting', async (data) => {
  //     console.log('something happened');
  //     if (data.answererUserID === userInfo._id) {
  //       createOfferEls(data);
  //       await handleReceiveOffer(data.offer, data.OffererUserId);
  //     }
  //   });

  //   //   socket.on('answer', async (data) => {
  //   //     if (data.to === userId) {
  //   //       await peerConnectionRef.current.setRemoteDescription(
  //   //         new RTCSessionDescription(data.answer)
  //   //       );
  //   //     }
  //   //   });

  //   //   socket.on('ice-candidate', async (data) => {
  //   //     if (data.to === userId) {
  //   //       try {
  //   //         await peerConnectionRef.current.addIceCandidate(
  //   //           new RTCIceCandidate(data.candidate)
  //   //         );
  //   //       } catch (e) {
  //   //         console.error('Error adding received ice candidate', e);
  //   //       }
  //   //     }
  //   //   });

  //   return () => {
  //     socket.off('newOfferAwaiting');
  //     //     socket.off('answer');
  //     //     socket.off('ice-candidate');
  //   };
  // }, [userInfo._id, socket]);

  const createPeerConnection = async (offerObj) => {
      peerConnection = await new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              'stun:stun.l.google.com:19302',
              'stun:stun1.l.google.com:19302',
            ],
          },
        ],
      });

      localStream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, localStream));

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', {
            from: userInfo,
            to: user,
            iceCandidate: event.candidate,
            didIOffer,
          });
        }
      };
      if (offerObj) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offerObj)
        );
      }
      //   peerConnection.ontrack = (event) => {
      //     remoteStreamRef.current.srcObject = event.streams[0];
      //   };

      // return peerConnection;
  };

  const handleCall = async (targetUser) => {
    await fetchUserMedia();
    await createPeerConnection();
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      didIOffer = true;
      socket.emit('newOffer', {
        to: targetUser,
        from: userInfo,
        offer,
      });
      peerConnectionRef.current = peerConnection;
      setIsCalling(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleReceiveOffer = async (offer, from) => {
    return new Promise(async (resolve, reject) => {
      await fetchUserMedia();

      await createPeerConnection(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      //   socket.emit('answer', {
      //     to: from,
      //     from: userId,
      //     answer,
      //   });

      //   peerConnectionRef.current = peerConnection;
      //   setIsCalling(true);
    });
  };

  const fetchUserMedia = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        localStreamRef.current.srcObject = stream;
        localStream = stream;
        resolve();
      } catch (error) {
        console.log(error);
        reject();
      }
    });
  };

  // const handleEndCall = () => {
  //   if (peerConnectionRef.current) {
  //     peerConnectionRef.current.close();
  //     peerConnectionRef.current = null;
  //   }

  //   setIsCalling(false);
  //   setIsInCall(false);
  // };

  function createOfferEls(offer) {
    const mes = (
      <div style={{ fontSize: '12px', padding: '0px' }}>
        <h2
          style={{
            fontSize: '14px',
            margin: '0 0 0px 0',
            fontWeight: 'bold',
          }}
        >
          {'It does not matter'}
        </h2>
        <FaPhone color='green' size={25} />
        <FaPhone color='red' size={25} />
      </div>
    );
    toast(mes, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });
  }

  return (
    <div>
      <FaPhone color='green' size={25} onClick={() => handleCall(user)} />
      {/* {isCalling && <Button onClick={handleEndCall}>End Call</Button>} */}
      <audio ref={localStreamRef} autoPlay />
      <audio ref={remoteStreamRef} autoPlay />
    </div>
  );
};

export default AudioCall;
