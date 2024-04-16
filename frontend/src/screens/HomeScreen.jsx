import { Row, Col, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import ProductCarousel from '../components/ProductCarousel';
import Meta from '../components/Meta';

import { useEffect, useState } from 'react';
import RestaurantList from '../components/RestaurantList';
import Product from '../components/Product';

const HomeScreen = () => {
  const { pageNumber, keyword } = useParams();
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const restaurant = 'restaurantList';

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, Geoerror);
    } else {
      console.log('Geolocation not supported');
    }

    function success(position) {
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
    }

    function Geoerror() {
      setLatitude(null);
      setLongitude(null);
      console.error('Unable to retrieve your location');
    }
  }, []);

  const { data, isLoading, error } = useGetProductsQuery({
    keyword,
    pageNumber,
    latitude,
    longitude,
    restaurant,
  });
  return (
    <>
      {keyword || isLoading || error || data?.product?.length === 0 ? (
        <Link to='/' className='btn btn-light mb-4'>
          Go Back
        </Link>
      ) : (
        <ProductCarousel />
      )}
      {!isLoading &&  // Check if data is not loading
      !keyword && (error || data?.products?.length === 0) && ( // Check if there's an error or data array is empty
          <Alert variant='warning'>
            <h4>No Products Found!</h4>
            <p>
              There are no products available based on your current location. If
              you are in Witpoortjie, Mindalore, or Royal Cradle, please turn on
              your location and try again.
            </p>
          </Alert>
        )}
      {keyword && !isLoading && data?.products?.length === 0 && (
        <Alert variant='info'>
          {' '}
          {/* Use variant='info' for a positive message */}
          <h4>No Products Found!</h4>
          <p>
            We are expanding and reaching more restaurants. Please check back
            soon for more products.
          </p>
        </Alert>
      )}

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        data &&
        (data?.product?.length > 0 || data?.products?.length > 0) && (
          <>
            {' '}
            <Meta />
            <Row>
              {keyword ? '' :  data?.product?.map((product) => (
                <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                  <RestaurantList
                    productAndUser={product}
                    latitude={latitude}
                    longitude={longitude}
                  />
                </Col>
              ))}
              {keyword && data?.products?.map((product) => (
                <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                  <Product
                    product={product}
                    latitude={latitude}
                    longitude={longitude}
                    image='/images/sample.jpg'
                  />
                </Col>
              ))}
            </Row>
            <Paginate
              pages={data.pages}
              page={data.page}
              keyword={keyword ? keyword : ''}
            />{' '}
          </>
        )
      )}
    </>
  );
};

export default HomeScreen;
