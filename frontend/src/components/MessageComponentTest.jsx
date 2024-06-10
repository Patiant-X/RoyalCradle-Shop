import React, { useEffect, useRef, useState } from 'react';
import { Image } from 'react-bootstrap';
import { useSocketContext } from '../context/SocketContext';
import { useSelector } from 'react-redux';
import { FaPlus } from 'react-icons/fa';
import { IoMdSend } from 'react-icons/io';
import Avatar from './Avatar';
import moment from 'moment';
import Dexie from 'dexie';
import backgroundImage from '../assets/wallapaper.jpeg';
import AudioCall from './AudioCall';

const db = new Dexie('MessageDB');
db.version(1).stores({
  messages:
    '++id,sender,receiver,text,imageUrl,videoUrl,msgByUserId,msgByNonUserID,createdAt,[msgByUserId+msgByNonUserID]',
});

const MessageComponent = ({ receiverData }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const { socket } = useSocketContext();
  const [message, setMessage] = useState({
    text: '',
    imageUrl: '',
    videoUrl: '',
  });
  const [messages, setMessages] = useState([]);
  const currentMessage = useRef(null);

  useEffect(() => {
    // Retrieve messages from IndexedDB
    const fetchMessages = async () => {
      const storedMessages = await db.messages
        .where('[msgByUserId+msgByNonUserID]')
        .anyOf(
          [userInfo._id, receiverData._id],
          [receiverData._id, userInfo._id]
        )
        .toArray();

      setMessages(storedMessages);
    };

    fetchMessages();

    if (socket) {
      socket.on('message', (newMessage) => {
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, newMessage];
          db.messages.add(newMessage);
          return updatedMessages;
        });
      });
    }

    return () => {
      if (socket) {
        socket.off('message');
      }
    };
  }, [socket, userInfo._id, receiverData._id]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setMessage((prev) => ({
      ...prev,
      text: value,
    }));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.text || message.imageUrl || message.videoUrl) {
      if (socket) {
        const newMessage = {
          text: message.text,
          imageUrl: message.imageUrl,
          videoUrl: message.videoUrl,
          seen: false,
          msgByUserId: userInfo._id,
          msgByNonUserID: receiverData._id,
          sender: userInfo._id,
          receiver: receiverData._id,
          createdAt: new Date().toISOString(),
        };
        socket.emit('new message', newMessage);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        await db.messages.add(newMessage);
        setMessage({
          text: '',
          imageUrl: '',
          videoUrl: '',
        });
      }
    }
  };

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [messages]);

  return (
    <>
      <AudioCall />
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
              imageUrl={receiverData?.profile_pic}
              name={receiverData?.name}
              userId={receiverData?._id}
            />
            <div className='ml-3'>
              <h3 className='user-name'>{receiverData?.name}</h3>
              <p
                className={`online-status ${
                  receiverData?.online ? 'online' : 'offline'
                }`}
              >
                {receiverData?.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </header>

        <section className='message-section flex-grow overflow-y-auto px-4'>
          <div className='message-container' ref={currentMessage}>
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message-card ${
                    userInfo._id === msg.msgByUserId
                      ? 'own-message'
                      : 'other-message'
                  }`}
                >
                  <div className='media'>
                    {msg.imageUrl && (
                      <Image src={msg.imageUrl} className='media-image' />
                    )}
                    {msg.videoUrl && (
                      <video
                        src={msg.videoUrl}
                        className='media-video'
                        controls
                      />
                    )}
                  </div>
                  <div
                    className='message-text'
                    dangerouslySetInnerHTML={{ __html: msg.text }} // Render HTML content
                  />
                  <p className='message-timestamp'>
                    {moment(msg.createdAt).fromNow()}
                  </p>
                </div>
              ))
            ) : (
              <div className='no-messages'>No messages yet</div>
            )}
          </div>
        </section>
        <section className='input-section flex-none p-4'>
          <div className='attach-button'>
            <FaPlus size={20} />
          </div>
          <form onSubmit={handleSendMessage} className='message-form flex'>
            <input
              type='text'
              placeholder='Type your message...'
              className='message-input flex-grow'
              value={message.text}
              onChange={handleOnChange}
            />
            <button type='submit' className='send-button'>
              <IoMdSend size={28} />
            </button>
          </form>
        </section>
      </div>
      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
          background-color: #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .user-info {
          display: flex;
          align-items: center;
        }

        .user-name {
          font-weight: bold;
          font-size: 16px;
          margin: 0;
        }

        .online-status {
          font-size: 12px;
          margin: 0;
          color: #888;
        }

        .online {
          color: #0a8d00;
        }

        .offline {
          color: #888;
        }

        .message-section {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
          display: flex;
          flex-direction: column;
        }

        .message-container {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .message-card {
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 10px;
          max-width: 80%;
        }

        .own-message {
          align-self: flex-end;
          background-color: #dff8c2;
        }

        .other-message {
          align-self: flex-start;
          background-color: #fff;
        }

        .media {
          position: relative;
          max-width: 200px;
        }

        .media-image,
        .media-video {
          max-width: 100%;
          border-radius: 8px;
        }

        .message-text {
          margin: 5px 0;
        }

        .message-timestamp {
          font-size: 12px;
          color: #888;
        }

        .no-messages {
          flex-grow: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 16px;
          color: #888;
        }

        .loading-indicator {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .input-section {
          display: flex;
          align-items: center;
          padding: 10px;
          background-color: #fff;
          box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
        }

        .attach-button,
        .send-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
        }

        .attach-button:hover,
        .send-button:hover {
          background-color: #f0f0f0;
          border-radius: 50%;
        }

        .message-form {
          flex: 1;
          display: flex;
          align-items: center;
          margin-left: 10px;
        }

        .message-input {
          flex: 1;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          outline: none;
        }
      `}</style>
    </>
  );
};

export default MessageComponent;
