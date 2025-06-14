import React from 'react';
import { Card } from 'react-bootstrap';
import { calculateRestaurantDistance } from '../utils/calculateDeliveryDistance'; // Assuming calculateDistance function is available
import { MdDirectionsBike, MdStore } from 'react-icons/md';
import { Link } from 'react-router-dom';

const Restaurant = ({ restaurant, latitude, longitude }) => {
  let clientRestaurantDistance;
  let isOpen = false;

  // Calculate delivery distance and time if latitude and longitude are provided
  if (latitude !== null && longitude !== null) {
    clientRestaurantDistance = calculateRestaurantDistance(
      latitude,
      longitude,
      restaurant.location.latitude,
      restaurant.location.longitude
    );
    if (clientRestaurantDistance > 5) {
      clientRestaurantDistance = null;
    }
  }

  // Check if the restaurant is open
  const isRestaurantOpen = () => {
    // Get current time in hours and minutes
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();

    // Parse opening and closing times
    const openingTime = restaurant.operatingHours.openingTime.split(':');
    const openingHour = parseInt(openingTime[0], 10);
    const openingMinute = parseInt(openingTime[1], 10);

    const closingTime = restaurant.operatingHours.closingTime.split(':');
    const closingHour = parseInt(closingTime[0], 10);
    const closingMinute = parseInt(closingTime[1], 10);

    // Convert opening and closing times to minutes since midnight
    const openingTimeInMinutes = openingHour * 60 + openingMinute;
    const closingTimeInMinutes = closingHour * 60 + closingMinute;
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // Check if current time is within operating hours
    return (
      currentTimeInMinutes >= openingTimeInMinutes &&
      currentTimeInMinutes <= closingTimeInMinutes &&
      restaurant.status === 'open'
    );
  };

  isOpen = isRestaurantOpen();
  const toPath = `restaurantProductList/${restaurant?.user?._id}/${restaurant?._id}`;

  return (
    <Card className='my-3 p-3 rounded'>
      <Link to={toPath}>
        <Card.Img
          src={restaurant?.image}
          variant='top'
          className='restaurant-image'
        />
      </Link>

      <Card.Body>
        <Link to={toPath}>
          <Card.Title as='div' className='restaurant-title'>
            <strong>{restaurant.name}</strong>
          </Card.Title>
        </Link>
        <Card.Text as='div' className='fw-light'>
          Operating Times: {restaurant.operatingHours.openingTime} -{' '}
          {restaurant.operatingHours.closingTime}
        </Card.Text>
        <Card.Text
          as='div'
          className={isOpen ? 'text-success mt-2' : 'text-danger mt-2'}
        >
          {isOpen ? 'Open' : 'Closed'}
        </Card.Text>
      </Card.Body>

      <Card.Footer>
        <Card.Text
          as='div'
          className='delivery-options my-2 d-flex justify-content-between'
        >
          {restaurant.deliveryOptions.includes('collection') && (
            <div className='d-flex align-items-center'>
              <MdStore
                size={25}
                style={{ color: 'green' }}
                className='delivery-icon'
              />
              <p
                className='ml-2 mb-0'
                style={{ marginLeft: '3px', fontWeight: 'lighter' }}
              >
                Collect
              </p>
            </div>
          )}
          {restaurant.deliveryOptions.includes('delivery') && (
            <div className='d-flex align-items-center'>
              <MdDirectionsBike
                size={25}
                style={{ color: 'green' }}
                className='delivery-icon'
              />
              <p
                className='ml-2 mb-0 fw-semi'
                style={{ marginLeft: '3px', fontWeight: 'lighter' }}
              >
                Delivery
              </p>
            </div>
          )}
        </Card.Text>

        <Card.Text
          as='div'
          className='text-center text-muted fw-light mt-2'
          style={{ fontSize: '0.9rem' }}
        >
          {restaurant.cuisine.map((item, index) => (
            <span key={index}>
              {'#' /* Always add '#' prefix */}
              {item}
              {index !== restaurant.cuisine.length - 1 && ' '}{' '}
              {/* Add space except for the last item */}
            </span>
          ))}
        </Card.Text>
        {clientRestaurantDistance && (
          <Card.Text
            as='h2'
            className='text-right fw-semi mt-2'
            style={{
              textAlign: 'right',
              fontSize: '0.75rem',
              fontFamily: 'sans-serif',
            }}
          >
             &lt; {clientRestaurantDistance} km Away
          </Card.Text>
        )}
      </Card.Footer>
    </Card>
  );
};

export default Restaurant;
