import React, { useState } from 'react';
import ServiceFeatures from '../../components/ServiceEveryWhere';
import MessageComponent from '../../components/MessageComponent';
import useConversations from '../../hooks/useConversations';
import { Card } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { resetUserMessageCount, setSelectUser } from '../../slices/authSlice';

const EveryWhereServiceScreen = () => {

  // Use the useConversations hook to fetch conversations data
  const [adminService, setAdminService] = useState('65e1b284c790e25bc1bd33bb');

  // State to manage the visibility of the MessageComponent
  const [showMessage, setShowMessage] = useState(false);
  const dispatch = useDispatch();

  const handleToggleCardComponent = () => {
    dispatch(setSelectUser('65e1b284c790e25bc1bd33bb'));
    dispatch(resetUserMessageCount(adminService));
    setShowMessage(!showMessage);
    setAdminService('65e1b284c790e25bc1bd33bb');
  };
  const conversation = useConversations(adminService);
  return (
    <>
      <>
        {!showMessage && <ServiceFeatures />}
        {!showMessage && <div className='d-flex justify-content-center my-2'>
          <Card
            style={{
              backgroundColor: '#3c4c5d',
              padding: '20px',
              width: '60%',
              cursor: 'pointer', // Add pointer cursor to indicate it's clickable
            }}
            onClick={handleToggleCardComponent} // Handle card click to show MessageComponent
          >
            <p style={{ color: 'white', margin: '0', textAlign: 'center'}}>
              Proceed to Premium
            </p>
          </Card>
        </div>}
        {showMessage && <div className='d-flex justify-content-center my-2'>
          <Card
            style={{
              backgroundColor: '#3c4c5d',
              padding: '20px',
              width: '60%',
              marginBottom: '20px',  
              cursor: 'pointer', // Add pointer cursor to indicate it's clickable
            }}
            onClick={handleToggleCardComponent} // Handle card click to show MessageComponent
          >
            <p style={{ color: 'white', margin: '0', textAlign: 'center'}}>
              Learn About Premium
            </p>
          </Card>
        </div>}
        

        <div className='mt-2 mb-5'>
          {' '}
          {showMessage && <MessageComponent conversation={conversation} />}{' '}
          {/* {setShowMessage && (
            <MessageComponentTest receiverData={conversation.userData} />
          )} */}
        </div>
      </>
    </>
  );
};

export default EveryWhereServiceScreen;
