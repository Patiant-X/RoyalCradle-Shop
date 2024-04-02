import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import { calculateDistance } from '../utils/calculateDeliveryDistance';

const Product = ({ product, latitude, longitude }) => {
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

  return (
    <Card className='my-3 p-3 rounded'>
      <Link to={`/product/${product._id}`}>
        <Card.Img src={product.image} variant='top' />
      </Link>

      <Card.Body>
        <Link to={`/product/${product._id}`}>
          <Card.Title as='div' className='product-title'>
            <strong>{product.name}</strong>
          </Card.Title>
        </Link>

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
          <Card.Text
            as='div'
            style={{ fontStyle: 'italic' }}
            className='mb-2'
          >
            Delivery Time: {deliveryTime}
          </Card.Text>
          {(product?.restaurantName || product?.restaurantArea) && (
            <Card.Text
              as='div'
              className='text-center text-muted fw-light'
              style={{ fontSize: '0.9rem' }}
            >
              {product?.restaurantName ? `#${product?.restaurantName}` : ''}{" "}
              {product?.restaurantArea ? `#${product?.restaurantArea}` : ''}
            </Card.Text>
          )}
        </Card.Footer>
      )}
    </Card>
  );
};

export default Product;
