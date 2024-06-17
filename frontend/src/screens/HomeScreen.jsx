import { Row, Col, Alert, Container, Button } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import Meta from '../components/Meta';
import SearchBox from '../components/SearchBox';
import { useEffect, useRef, useState } from 'react';
import { useGetAllRestaurantsQuery } from '../slices/restaurantApiSlice';
import { setRestaurantList } from '../slices/restaurantSlice';
import Restaurant from '../components/Restaurant';
import { useDispatch, useSelector } from 'react-redux';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { pageNumber, keyword } = useParams();
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [showSearch, setShowSearch] = useState(true); // State to toggle search bar
  const searchBoxRef = useRef(null);
  const h2Ref = useRef(null);

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

  useEffect(() => {
    if (searchBoxRef.current) {
      searchBoxRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Focus on h2 element if there is a keyword when the component mounts
    if (keyword && h2Ref.current) {
      h2Ref.current.focus();
    }
  }, [keyword]);

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
  useEffect(() => {
    if (!restaurantIsLoading && restaurantData?.restaurants) {
      dispatch(setRestaurantList(restaurantData?.restaurants));
    }
  }, [restaurantData, restaurantIsLoading, dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;

      const searchBar = document.querySelector('.fixed-bottom-search');
      if (searchBar) {
        if (scrolled >= scrollableHeight) {
          searchBar.style.display = 'none';
        } else {
          searchBar.style.display = 'block';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <>
      {!keyword &&
        (userInfo?.isPremiumCustomer || userInfo?.role === 'admin' || true) && (
          <Alert variant='info'>
            <h4
              style={{ letterSpacing: '4px', fontFamily: 'serif' }}
              className='fw-bold'
            >
              5TYGA EVERYWHERE
            </h4>
            <p style={{ fontSize: '12px' }} className='fw-semi'>
              A premium service for premium people.
            </p>
            <Button variant='primary' size='sm' as={Link} to='/everywhere'>
              Explore More
            </Button>
          </Alert>
        )}
      {restaurantIsLoading && <Loader />}
      {restaurantIsLoading ||
      restaurantError ||
      restaurantData?.restaurants?.length === 0 ? (
        <>
          <Link to='/' className='btn btn-light mb-4'>
            Go Back
          </Link>
        </>
      ) : (
        <>
          <h2 ref={h2Ref} className='my-2'>
            {keyword
              ? `Restaurants shown based on "${keyword}" search`
              : 'Shops near You'}
          </h2>
        </>
      )}
      {!restaurantIsLoading &&
        !keyword &&
        (restaurantError || restaurantData?.restaurants?.length === 0) && (
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
            <Meta />
            <Container fluid style={{ maxWidth: '100%' }}>
              <Row>
                {restaurantData?.restaurants?.map((restaurant, index) => (
                  <Col key={restaurant._id} sm={12} md={6} lg={4} xl={3}>
                    <Restaurant
                      restaurant={restaurant}
                      latitude={latitude}
                      longitude={longitude}
                    />
                  </Col>
                ))}
              </Row>
            </Container>
            <Paginate
              pages={restaurantData?.pages}
              page={restaurantData?.page}
              keyword={keyword ? keyword : ''}
            />
          </>
        )
      )}
      {/* Search box */}
      {showSearch && (
        <>
          <div className='fixed-bottom-search'>
            <SearchBox ref={searchBoxRef} />
          </div>
        </>
      )}
    </>
  );
};

export default HomeScreen;
