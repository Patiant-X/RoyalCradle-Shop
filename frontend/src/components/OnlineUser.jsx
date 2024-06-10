import React from 'react';
import { Badge, Button, ListGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FaPhone } from 'react-icons/fa';

const OnlineUser = ({
  onlineUsers,
  setOnlineUserDetail,
  handleToggleMessageComponent,
}) => {
  const { userInfo } = useSelector((state) => state.auth);

  const handleUserClick = (userId) => {
    setOnlineUserDetail(userId);
    handleToggleMessageComponent(userId);
  };

  const getOnlineCustomerNames = () => {
    const storedData = localStorage.getItem('onlineCustomerNames');
    return storedData ? JSON.parse(storedData) : {};
  };

  const onlineCustomerNames = getOnlineCustomerNames();

  return (
    <>
      {userInfo &&
        (userInfo?.role === 'admin' || userInfo?.role === 'restaurant') && (
          <ListGroup className='mt-4'>
            <ListGroup.Item active>Online Users</ListGroup.Item>
            {onlineUsers?.map((user, index) => (
              <ListGroup.Item key={index} className='d-flex justify-content-between align-items-center'>
                <Button
                  variant='link'
                  onClick={() => handleUserClick(user.userId)}
                  className='text-primary'
                >
                  {onlineCustomerNames[user.userId]?.name || user.userId}{' '}
                  {user.messageCount > 0 && (
                    <Badge bg='success'>New</Badge>
                  )}
                </Button>
                {onlineCustomerNames[user.userId]?.mobileNumber && (
                  <a
                    href={`tel:${onlineCustomerNames[user.userId].mobileNumber}`}
                    className='text-primary d-flex align-items-center justify-content-center rounded-circle bg-light'
                    style={{ width: '30px', height: '30px' }}
                  >
                    <FaPhone />
                  </a>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
    </>
  );
};

export default OnlineUser;
