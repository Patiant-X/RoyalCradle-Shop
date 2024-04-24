import { Row, Col, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import ProductCarousel from '../components/ProductCarousel';
import Meta from '../components/Meta';

import { useEffect, useState } from 'react';

import { useGetAllRestaurantsQuery } from '../slices/restaurantApiSlice';
import Restaurant from '../components/Restaurant';

const HomeScreen = () => {
  const { pageNumber, keyword } = useParams();
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

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
  const {
    data: restaurantData,
    isLoading: restaurantIsLoading,
    error: restaurantError,
  } = useGetAllRestaurantsQuery({
    keyword,
    pageNumber,
    latitude,
    longitude,
    state: true,
  });
  return (
    <>
      {keyword ||
      restaurantIsLoading ||
      restaurantError ||
      restaurantData?.restaurants?.length === 0 ? (
        <Link to='/' className='btn btn-light mb-4'>
          Go Back
        </Link>
      ) : (
        <>
          <ProductCarousel />
          <h1 className='my-2'>Shops near You</h1>
        </>
      )}
      {!restaurantIsLoading && // Check if data is not loading
        !keyword &&
        (restaurantError || restaurantData?.restaurants?.length === 0) && ( // Check if there's an error or data array is empty
          <Alert variant='warning'>
            <h4>No Products Found!</h4>
            <p>
              There are no products available based on your current location. If
              you are in Witpoortjie, Mindalore, or Royal Cradle, please turn on
              your location and try again.
            </p>
          </Alert>
        )}
      {keyword &&
        !restaurantIsLoading &&
        restaurantData?.restaurants?.length === 0 && (
          <Alert variant='info'>
            {' '}
            {/* Use variant='info' for a positive message */}
            <h4>No Store/Kitchen/Restaurant Found!</h4>
            <p>
              We are expanding and reaching more businesses. Please check back
              soon for more products.
            </p>
          </Alert>
        )}

      {restaurantIsLoading ? (
        <Loader />
      ) : restaurantError ? (
        <Message variant='danger'>
          {restaurantError?.data?.message || restaurantError.error}
          <span>Please try again</span>
        </Message>
      ) : (
        restaurantData &&
        restaurantData?.restaurants?.length > 0 && (
          <>
            {' '}
            <Meta />
            <Row>
              {restaurantData?.restaurants?.map((restaurant) => (
                <Col key={restaurant._id} sm={12} md={6} lg={4} xl={3}>
                  <Restaurant
                    restaurant={restaurant}
                    latitude={latitude}
                    longitude={longitude}
                  />
                </Col>
              ))}
            </Row>
            <Paginate
              pages={restaurantData?.pages}
              page={restaurantData?.page}
              keyword={keyword ? keyword : ''}
            />{' '}
          </>
        )
      )}
    </>
  );
};

export default HomeScreen;
