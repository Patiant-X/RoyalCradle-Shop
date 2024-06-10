import { Container, Row, Col, Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MessageComponent from '../../components/MessageComponent';
import useConversations from '../../hooks/useConversations';
import OnlineUser from '../../components/OnlineUser';
import { resetUserMessageCount, setSelectUser } from '../../slices/authSlice';

const RestaurantChatScreen = () => {
  const dispatch = useDispatch();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showMessageComponent, setShowMessageComponent] = useState(false);
  const [onlineUserDetail, setOnlineUserDetail] = useState(null);

  const onlineUsers = useSelector((state) => state.auth.onlineUsers);

  const handleToggleMessageComponent = (userId) => {
    dispatch(setSelectUser(userId));
    dispatch(resetUserMessageCount(selectedUser));
    setSelectedUser(userId);
    setShowMessageComponent(true);
    setOnlineUserDetail(userId);
  };

  const handleBackButton = () => {
    setSelectedUser(null);
    setShowMessageComponent(false);
  };

  const conversation = useConversations(onlineUserDetail);

  // Cleanup function to dispatch setSelectUser('') when component unmounts or user leaves
  useEffect(() => {
    return () => {
      dispatch(setSelectUser(''));
    };
  }, [dispatch]);

  return ( 
    <Container>
      <Row>
        <Col md={4}>
          {!showMessageComponent && (
            <OnlineUser
              onlineUsers={onlineUsers}
              setOnlineUserDetail={setOnlineUserDetail}
              handleToggleMessageComponent={handleToggleMessageComponent}
            />
          )}
        </Col>
        <Col md={8}>
          {showMessageComponent && (
            <>
              <Button className='btn btn-light mb-4' onClick={handleBackButton}>
                Back
              </Button>
              <MessageComponent
                conversation={conversation}
                selectedUser={selectedUser}
              />
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default RestaurantChatScreen;
