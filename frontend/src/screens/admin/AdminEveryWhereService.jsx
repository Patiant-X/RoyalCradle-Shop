import { Button, Container, Row, Col, Form } from 'react-bootstrap';
import DOMPurify from 'dompurify';
import StoreAddress from '../../components/StoreAddress';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteClientAddress,
  deleteShopAddress,
  setClientAddress,
  setShopAddress,
} from '../../slices/addressSlice';
import { resetUserMessageCount, setSelectUser } from '../../slices/authSlice';
import { FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { calculateRestaurantDistance } from '../../utils/calculateDeliveryDistance';
import MessageComponent from '../../components/MessageComponent';
import useConversations from '../../hooks/useConversations';
import OnlineUser from '../../components/OnlineUser';
import { useSocketContext } from '../../context/SocketContext';

const AdminEveryWhereService = () => {
  const { socket } = useSocketContext();
  const { userInfo } = useSelector((state) => state.auth);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showMessageComponent, setShowMessageComponent] = useState(false);
  const [onlineUserDetail, setOnlineUserDetail] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(null);
  const [address, setAddress] = useState(null);
  const [numberOfGoods, setNumberOfGoods] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [distanceTravelled, setDistanceTravelled] = useState(0);
  const onlineUsers = useSelector((state) => state.auth.onlineUsers);
  const { shopAddresses, clientAddress } = useSelector(
    (state) => state.address
  );

  const dispatch = useDispatch();

  const handleToggleMessageComponent = (userId) => {
    dispatch(resetUserMessageCount(userId));
    dispatch(setSelectUser(userId));
    setSelectedUser(userId);
    setShowMessageComponent(true);
    setOnlineUserDetail(userId);
  };

  const handleStoreAddress = (addressType) => {
    let address_2;
    if (address != null) {
      const location = address.place.address_components
        .map((component) => component.long_name)
        .join(' ');
      const lat = address.lat;
      const lng = address.lng;
      address_2 = {
        location,
        lat,
        lng,
      };
    } else {
      return;
    }
    const exists = shopAddresses.some(
      (shop) => shop.location === address_2.location
    );
    if (!exists) {
      if (addressType === 'store' && address != null) {
        if (clientAddress.location && clientAddress.lat && clientAddress.lng) {
          dispatch(setShopAddress(address_2));
        }
      } else {
        dispatch(setClientAddress(address_2));
      }
      window.location.reload();
    } else {
      toast.error('Shop already in List');
      window.location.reload();
    }
  };

  const handleDeleteShopAddress = (location) => {
    dispatch(deleteShopAddress(location));
    window.location.reload();
  };

  const conversation = useConversations(onlineUserDetail);
  const user = conversation?.userData;

  const handleDeleteClientAddress = () => {
    dispatch(deleteClientAddress());
    window.location.reload();
  };

  const handleNumberOfGoodsChange = (e) => {
    setNumberOfGoods(e.target.value);
  };

  const handleTimeTakenChange = (e) => {
    setTimeTaken(e.target.value);
  };

  const handleGenerateDeliveryFee = () => {
    const deliveryFee = calculateDeliveryFee(clientAddress, shopAddresses);
    setDistanceTravelled(deliveryFee * 2);
    setDeliveryFee(deliveryFee * 2);
  };

  const handleSendServiceFee = () => {
    const basicServiceFee = 50; // Assuming a base fee of 50 for simplicity
    const basicItems = 5;
    const basicTime = 30;
    const basiceDistance = 3;
    let additionalDistance = distanceTravelled - basiceDistance;
    let additionalItems = numberOfGoods - basicItems;
    let additionalTime = timeTaken - basicTime;
    let additionalItemsCost = additionalItems > 0 ? additionalItems * 5 : 0;
    let additionalTimeCost = additionalTime > 0 ? additionalTime * 1 : 0;
    let additionalDistanceCost =
      additionalDistance > 0 ? additionalDistance * 10 : 0;
    let totalCost =
      basicServiceFee +
      additionalItemsCost +
      additionalTimeCost +
      additionalDistanceCost;

    let messageText = `
    <div>
      <strong>EveryWhere Service</strong><br/><br/>
      <strong>Estimated Service Fee:</strong> R${basicServiceFee}<br/><br/>
      <strong>Basic Items:</strong> ${basicItems}<br/>
      <strong>Basic Items:</strong> ${basiceDistance}km<br/>
      <strong>Basic Time:</strong> ${basicTime} minutes of shopping<br/><br/>
  `;

    if (
      additionalItemsCost > 0 ||
      additionalTimeCost > 0 ||
      additionalDistanceCost > 0
    ) {
      messageText += `<strong>Additional Charges:</strong><br/>`;
      if (additionalItemsCost > 0) {
        messageText += `- Items (additional ${additionalItems}): R${additionalItemsCost}<br/>`;
      }
      if (additionalTimeCost > 0) {
        messageText += `- Time (additional ${additionalTime} minutes): R${additionalTimeCost}<br/>`;
      }
      if (additionalDistanceCost > 0) {
        messageText += `- Distance (additional ${additionalDistance} km): R${additionalDistanceCost}<br/>`;
      }
      messageText += `<br/><strong>Total Cost:</strong> R${totalCost}`;
    } else {
      messageText += `<br/><strong>Total Cost:</strong> R${basicServiceFee}`;
    }

    messageText += `</div>`;

    // Sanitize the message text using DOMPurify
    const sanitizedMessageText = DOMPurify.sanitize(messageText);

    if (socket && userInfo?._id && user) {
      socket.emit('new message', {
        name: userInfo?.name,
        sender: userInfo?._id,
        receiver: onlineUserDetail, // Ensure this is the client's user ID
        text: sanitizedMessageText,
        imageUrl: '',
        videoUrl: '',
        msgByUserId: userInfo?._id,
        msgByNonUserId: user?._id,
      });
      toast.success('Service fee sent to client as a message');
    }
  };

  // Cleanup function to dispatch setSelectUser('') when component unmounts or user leaves
  useEffect(() => {
    return () => {
      dispatch(setSelectUser(''));
    };
  }, [dispatch]);
  return (
    <Container>
      <Row>
        {!showMessageComponent && (
          <Col md={4}>
            <OnlineUser
              onlineUsers={onlineUsers}
              setOnlineUserDetail={setOnlineUserDetail}
              handleToggleMessageComponent={handleToggleMessageComponent}
            />
          </Col>
        )}
        <Col md={8}>
          {selectedUser && showMessageComponent && (
            <>
              {/* <MessageComponentTest receiverData = {conversation.userData} /> */}
              <MessageComponent
                conversation={conversation}
                selectedUser={selectedUser}
              />
              <div className='mt-3'>
                <h3>Manage Addresses</h3>
                {clientAddress?.location && (
                  <div>
                    <strong>Your Location: </strong>
                    <p className='fw-light'> {clientAddress.location}</p>
                    <Button
                      type='button'
                      variant='light'
                      onClick={() => handleDeleteClientAddress()}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                )}

                {!clientAddress ? (
                  <h4>Enter Your Location</h4>
                ) : (
                  <h4>Enter Store address</h4>
                )}

                {shopAddresses?.length > 0 && (
                  <div className='mt-3'>
                    <strong>Chosen Shops:</strong>
                    <ul>
                      {shopAddresses.map((shop, index) => (
                        <div key={index}>
                          <li className='my-2'>{shop.location}</li>
                          <Button
                            type='button'
                            variant='light'
                            onClick={() =>
                              handleDeleteShopAddress(shop.location)
                            }
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      ))}
                    </ul>
                  </div>
                )}

                <StoreAddress setAddress={setAddress} />

                <div>
                  {clientAddress && (
                    <Button
                      variant='secondary'
                      onClick={() => handleStoreAddress('store')}
                    >
                      Save Store Address
                    </Button>
                  )}
                  {!clientAddress && (
                    <Button
                      variant='secondary'
                      onClick={() => handleStoreAddress('client')}
                    >
                      Save Your Location
                    </Button>
                  )}
                </div>
                <div className='d-flex justify-content-center mt-4'>
                  {clientAddress && shopAddresses.length > 0 && (
                    <Button
                      variant='primary'
                      onClick={handleGenerateDeliveryFee}
                    >
                      Generate Delivery Fee
                    </Button>
                  )}
                </div>

                <div className='m-3'>
                  {deliveryFee ? <strong>R {deliveryFee}</strong> : <></>}
                </div>

                <div className='mt-3'>
                  <h4>Service Fee Details</h4>
                  <Form>
                    <Form.Group controlId='numberOfGoods'>
                      <Form.Label>Number of Goods</Form.Label>
                      <Form.Control
                        type='number'
                        placeholder='Enter number of goods'
                        value={numberOfGoods}
                        onChange={handleNumberOfGoodsChange}
                      />
                    </Form.Group>
                    <Form.Group controlId='timeTaken' className='mt-3'>
                      <Form.Label>Time Taken (minutes)</Form.Label>
                      <Form.Control
                        type='number'
                        placeholder='Enter time taken'
                        value={timeTaken}
                        onChange={handleTimeTakenChange}
                      />
                    </Form.Group>
                    <Button
                      variant='success'
                      type='submit'
                      className='mt-3'
                      onClick={handleSendServiceFee}
                    >
                      Send Service Fee to Client
                    </Button>
                  </Form>
                </div>
              </div>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

const calculateDeliveryFee = (clientAddress, shopAddresses) => {
  let totalDistance = 0;

  const distancesToClient = shopAddresses.map((shop) =>
    calculateRestaurantDistance(
      shop.lat,
      shop.lng,
      clientAddress.lat,
      clientAddress.lng
    )
  );

  const sortedShopAddresses = shopAddresses
    .map((shop, index) => ({
      shop,
      distanceToClient: distancesToClient[index],
    }))
    .sort((a, b) => b.distanceToClient - a.distanceToClient)
    .map(({ shop }) => shop);

  for (let i = 0; i < sortedShopAddresses.length - 1; i++) {
    const distance = calculateRestaurantDistance(
      sortedShopAddresses[i].lat,
      sortedShopAddresses[i].lng,
      sortedShopAddresses[i + 1].lat,
      sortedShopAddresses[i + 1].lng
    );
    totalDistance += distance;
  }

  if (sortedShopAddresses.length > 0) {
    const lastShop = sortedShopAddresses[sortedShopAddresses.length - 1];
    const distanceToClient = calculateRestaurantDistance(
      lastShop.lat,
      lastShop.lng,
      clientAddress.lat,
      clientAddress.lng
    );
    console.log(totalDistance, 'before to client');
    totalDistance += distanceToClient;
    console.log(totalDistance, 'to client');
  }

  // if (totalDistance <= 3) {
  //   console.log(totalDistance);
  //   let deliveryFee = 50;
  //   deliveryFee = Math.round(deliveryFee);
  //   return deliveryFee;
  // }
  let deliveryFee = totalDistance;
  deliveryFee = Math.round(deliveryFee);
  return totalDistance;
};

export default AdminEveryWhereService;
