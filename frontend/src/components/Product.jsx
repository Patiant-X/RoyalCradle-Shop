import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import { calculateDistance } from '../utils/calculateDeliveryDistance';

const Product = ({ product, latitude, longitude, image , restaurantId}) => {
  let deliveryPrice;
  let deliveryTime;
  if (latitude !== null && longitude !== null) {
    deliveryPrice = calculateDistance(
      latitude,
      longitude,
      product.location.latitude,
      product.location.longitude
    );
    if (deliveryPrice === 10) {
      if (product.IsFood) {
        deliveryTime = '25 - 45 minutes';
      } else {
        deliveryTime = '10 - 15 minutes';
      }
    }
    if (deliveryPrice === 20) {
      if (product.IsFood) {
        deliveryTime = '35 - 55 minutes';
      } else {
        deliveryTime = '10 - 15 minutes';
      }
    }
    if (deliveryPrice > 20) {
      deliveryTime = null;
    }
  }

  const encodedImage = encodeURIComponent(JSON.stringify(image));
  const encodedImage2 = encodeURIComponent(JSON.stringify(product.image));

  const toPath =
    product.image === '/images/sample.jpg'
      ? `/product/${product._id}/${encodedImage}/${restaurantId}`
      : `/product/${product._id}/${encodedImage2}/${restaurantId}`;
  return (
    <Card className='my-3 p-3 rounded'>
      <Link to={toPath}>
        <Card.Img src={`${product.image}` === '/images/sample.jpg'? `${image}` : `${product.image}` } variant='top' />
      </Link>

      <Card.Body>
        <Link to={toPath}>
          <Card.Title as='div' className='product-title'>
            <strong>{product.name}</strong>
          </Card.Title>
        </Link>

        <Card.Text as='p'>{product.description}</Card.Text>

        <Card.Text as='div'>
          <Rating
            value={product.rating}
            text={`${product.numReviews} reviews`}
          />
        </Card.Text>

        <Card.Text as='h3'>R{product.price}</Card.Text>
      </Card.Body>
      {deliveryTime && (
        <Card.Footer>
          <Card.Text as='div' style={{ fontStyle: 'italic' }} className='mb-2'>
            Delivery Time: {deliveryTime}
          </Card.Text>
          {(product?.restaurantName || product?.restaurantArea) && (
            <Card.Text
              as='div'
              className='text-center text-muted fw-light'
              style={{ fontSize: '0.9rem' }}
            >
              {product?.restaurantName ? `#${product?.restaurantName}` : ''}{' '}
              {product?.restaurantArea ? `#${product?.restaurantArea}` : ''}
            </Card.Text>
          )}
        </Card.Footer>
      )}
    </Card>
  );
};

export default Product;
