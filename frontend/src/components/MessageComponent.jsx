import React, { useEffect, useRef, useState } from 'react';
import { Button, Image } from 'react-bootstrap';
import { useSocketContext } from '../context/SocketContext';
import { useDispatch, useSelector } from 'react-redux';
import { FaPhoneAlt, FaPhoneSlash, FaPlus } from 'react-icons/fa';
import { IoMdSend } from 'react-icons/io';
import Avatar from './Avatar';
import moment from 'moment';
import backgroundImage from '../assets/wallapaper.jpeg';
import useWebRTC from '../hooks/useWebRTC';
import usePushNotifications from '../hooks/usePushNotifications';

const MessageComponent = ({ conversation }) => {
  usePushNotifications();
  const dispatch = useDispatch();
  const { callInProgress, remoteStream } = useSelector((state) => state.webrtc);

  const { userInfo } = useSelector((state) => state.auth);
  const { socket } = useSocketContext();

  const [message, setMessage] = useState({
    text: '',
    imageUrl: '',
    videoUrl: '',
  });

  const currentMessage = useRef(null);
  const remoteAudioRef = useRef(null);

  const handleOnChange = (e) => {
    const { value } = e.target;
    setMessage((prev) => ({
      ...prev,
      text: value,
    }));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if ((message.text || message.imageUrl || message.videoUrl) && user) {
      if (socket && userInfo && user._id !== '') {
        socket.emit('new message', {
          name: userInfo?.name,
          sender: userInfo?._id,
          receiver: user?._id,
          text: message.text,
          imageUrl: message.imageUrl,
          videoUrl: message.videoUrl,
          msgByUserId: userInfo?._id,
          msgByNonUserId: user?._id,
        });
        setMessage({
          text: '',
          imageUrl: '',
          videoUrl: '',
        });
      }
    }
  };

  const allMessage = conversation?.allMessage;
  const user = conversation?.userData;

  const { startCall, endCall } = useWebRTC(user, userInfo);

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [allMessage]);

  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <>
      <div
        style={{
          backgroundImage: `url(${backgroundImage})`,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        className='bg-no-repeat bg-cover'
      >
        <header className='sticky top-0 h-16 bg-white flex justify-between items-center px-4'>
          <div className='user-info flex items-center'>
            <Avatar
              width={50}
              height={50}
              imageUrl={user?.profile_pic}
              name={user?.name}
              userId={user?._id}
            />
            <div className='ml-4'>
              <h3 className='user-name'>{user?.name}</h3>
              <p
                className={`online-status ${
                  user?.online ? 'online' : 'offline'
                }`}
              >
                {user?.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <div className='call-button'>
            {!callInProgress ? (
              user?.online && (
                <Button onClick={startCall} variant='primary'>
                  <FaPhoneAlt />
                </Button>
              )
            ) : (
              <Button onClick={endCall} variant='danger'>
                <FaPhoneSlash />
              </Button>
            )}
          </div>
        </header>

        <section className='message-section flex-grow overflow-y-auto'>
          <div className='message-container' ref={currentMessage}>
            {allMessage?.length > 0 ? (
              allMessage.map((msg, index) => (
                <div
                  key={index}
                  className={`message-card ${
                    userInfo._id === msg?.msgByUserId
                      ? 'own-message'
                      : 'other-message'
                  }`}
                >
                  <div className='media'>
                    {msg?.imageUrl && (
                      <Image src={msg?.imageUrl} className='media-image' />
                    )}
                    {msg?.videoUrl && (
                      <video
                        src={msg.videoUrl}
                        className='media-video'
                        controls
                      />
                    )}
                  </div>
                  <div
                    className='message-text'
                    dangerouslySetInnerHTML={{ __html: msg.text }}
                  />
                  <p className='message-timestamp'>
                    {moment(msg.createdAt).fromNow()}
                  </p>
                </div>
              ))
            ) : (
              <div className='no-messages'>
                Welcome to the restaurant / everwhere service chat app. Here you can communicate with the restaurant regarding menu, orders, and more. 
                Please note, you must be logged in to use the chat functionality.
              </div>
            )}
          </div>
        </section>

        <section className='input-section flex-none'>
          <div className='attach-button'>
            <FaPlus size={20} />
          </div>
          <form onSubmit={handleSendMessage} className='message-form'>
            <textarea
              placeholder='Type your message...'
              className='message-input'
              value={message.text}
              onChange={handleOnChange}
              rows='1'
              style={{ maxHeight: '150px', minHeight: '50px' }}
              disabled={!userInfo} // Disable input if user is not logged in
            />
            <button type='submit' className='send-button' disabled={!userInfo}>
              <IoMdSend size={28} />
            </button>
          </form>
        </section>
        <audio ref={remoteAudioRef} autoPlay />
      </div>
      <style jsx>{`
      `}</style>

    </>
  );
};

export default MessageComponent;
