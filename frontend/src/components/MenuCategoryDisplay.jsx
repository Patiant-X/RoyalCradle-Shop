import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Image, Button, Card } from 'react-bootstrap';
import useConversations from '../hooks/useConversations';
import MessageComponent from './MessageComponent';
import { RiChat4Line } from 'react-icons/ri';
import { resetUserMessageCount, setSelectUser } from '../slices/authSlice';
import { useDispatch } from 'react-redux';

const MenuCategoryDisplay = ({ menuPictures, restauarantId }) => {
  const dispatch = useDispatch();
  // Use the useConversations hook to fetch conversations data
  const [adminService, setAdminService] = useState(restauarantId);
  // State to manage the visibility of the MessageComponent
  const [showMessage, setShowMessage] = useState(false);
  const handleToggleCardComponent = () => {
    dispatch(resetUserMessageCount(adminService));
    dispatch(setSelectUser({ id: adminService, customer: 'customer' }));
    setShowMessage(!showMessage);
    setAdminService(restauarantId);
  };
  const conversation = useConversations(adminService);
  // Set an initial category to be displayed when the page loads
  const initialCategory = menuPictures && Object.keys(menuPictures)[0];
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Update the selected category when the component mounts
  useEffect(() => {
    setSelectedCategory(initialCategory);
    return () => {
      dispatch(setSelectUser('')); // Dispatch setSelectedUser('') when component unmounts
    }
  }, [initialCategory, dispatch]);

  return (
    <Container>
      <h2 className='text-center my-4 fw-bold'>Our Menu</h2>
      <Row className='mb-4' style={{ justifyContent: 'center' }}>
        {menuPictures &&
          Object.keys(menuPictures).map((category) => (
            <Col key={category} xs='auto' className='text-center mb-2'>
              <Button
                variant='outline-primary'
                onClick={() => setSelectedCategory(category)}
                className='category-button'
                style={{
                  border:
                    selectedCategory === category
                      ? '2px solid #0056b3'
                      : '2px solid #000',
                  color: '#3c4c5d',
                  backgroundColor:
                    selectedCategory === category ? '#e7f1ff' : 'transparent',
                  fontWeight: 'bold',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {category}
              </Button>
            </Col>
          ))}
      </Row>

      {selectedCategory && (
        <Row className='justify-content-center'>
          <Col xs={12} md={8} className='text-center'>
            <Image
              src={menuPictures[selectedCategory]}
              alt={selectedCategory}
              fluid
              style={{
                maxHeight: '400px',
                objectFit: 'cover',
                transition: 'opacity 0.3s ease',
              }}
            />
          </Col>
        </Row>
      )}
      <style jsx>{`
        .scrolling-wrapper {
          display: flex;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .category-button:hover {
          background-color: #007bff;
          color: white;
        }
      `}</style>

      <Card
        className='mt-3'
        onClick={handleToggleCardComponent}
        style={{ cursor: 'pointer' }}
      >
        <div className='d-flex align-items-center flex-row p-2'>
          <RiChat4Line
            size={40}
            style={{ fontSize: '24px', color: '#000', marginRight: '10px' }}
          />
          <p className='mb-0' style={{ margin: 0 }}>
            Love Something on the Menu? Click Here
          </p>
        </div>
      </Card>

      <div className='mt-3 mb-5'>
        {' '}
        {showMessage && <MessageComponent conversation={conversation} />}{' '}
      </div>
    </Container>
  );
};

export default MenuCategoryDisplay;
