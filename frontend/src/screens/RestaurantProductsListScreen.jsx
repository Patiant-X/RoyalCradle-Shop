import { Row, Col, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import { Link } from 'react-router-dom';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import Meta from '../components/Meta';

import { useEffect, useRef, useState } from 'react';
import CategoryList from '../components/CategoryList';
import { restaurantCategoryList } from '../data/restaurantCategoryList';
import RestaurantProductCarousal from '../components/RestaurantProductCarousal';
import { useGetRestaurantByIdQuery } from '../slices/restaurantApiSlice';
import MenuCategoryDisplay from '../components/MenuCategoryDisplay';
import { useSelector } from 'react-redux';

const RestaurantProductsListScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { pageNumber, keyword, id, restaurantId } = useParams();
  const categoriesFromProductsRef = useRef([]);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

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

  const { data, isLoading, isError, refetch } = useGetProductsQuery({
    keyword,
    pageNumber,
    latitude,
    longitude,
    restaurant: id,
    category: selectedCategory.trim(),
  });

  const {
    data: restaurantData,
    isLoading: isLoadingRestaurantData,
    isError: isErrorRestaurantData,
  } = useGetRestaurantByIdQuery(restaurantId);
  const image = data?.products[0]?.image;

  // Fetch data and update categoriesFromProducts only on component mount
  useEffect(() => {
    if (data) {
      // Fetch data and preprocess categories only on component mount
      const categories =
        data?.products?.map((product) => preprocessName(product.category)) ||
        [];
      const uniqueCategories = [...new Set(categories)];
      categoriesFromProductsRef.current = uniqueCategories;
      // Filter the restaurantCategoryList based on partial matches of preprocessed categories present in the products
      const filteredCategoryList = restaurantCategoryList.filter((category) => {
        const categoryName = preprocessName(category.name);
        return categoriesFromProductsRef.current.some((productCategory) =>
          partialMatch(productCategory, categoryName)
        );
      });

      // Set filtered category list
      setFilteredCategoryList(filteredCategoryList);
    }
  }, [data]);

  const handleSelectedCategory = (category) => {
    setSelectedCategory(category);
    refetch();
  };

  const [filteredCategoryList, setFilteredCategoryList] = useState([]);

  // Assuming data.products is an array of products with each product having a category key
  // Function to preprocess category names
  const preprocessName = (name) => name.replace(/\s/g, '').toLowerCase();

  // Function to check if any part of a string matches any part of another string
  const partialMatch = (str1, str2) => {
    const normalizedStr1 = str1.replace(/\s/g, '').toLowerCase();
    const normalizedStr2 = str2.replace(/\s/g, '').toLowerCase();
    return normalizedStr1
      .split(',')
      .some((part1) =>
        normalizedStr2.split(',').some((part2) => part1.includes(part2))
      );
  };
  return (
    <>
      {keyword ||
      isLoading ||
      isError ||
      !data ||
      data.products.length === 0 ? (
        <Link to='/' className='btn btn-light mb-4'>
          Go Back
        </Link>
      ) : (
        <>
          <Link to='/' className='btn btn-light mb-4'>
            Go Back
          </Link>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              fontFamily: 'serif',
              letterSpacing: '2px',
            }}
            className='mb-2'
          >
            {(userInfo?.isPremiumCustomer ||
              userInfo?.role === 'admin' ||
              true) && <h1>#{restaurantData?.data?.name?.toUpperCase()}</h1>}
          </div>
          <RestaurantProductCarousal
            products={data.products}
            image={image}
            restaurantData={restaurantData?.data}
            restauarantId={restaurantId}
          />
        </>
      )}
      {!isLoading && // Check if data is not loading
        (isError || !data || data.products.length === 0) && ( // Check if there's an error or data array is empty
          <Alert variant='warning'>
            <h4>No Products Found!</h4>
            <p>
              There are no products available based on your current location. If
              you are in Witpoortjie, Mindalore, or Royal Cradle, please turn on
              your location and try again.
            </p>
          </Alert>
        )}

      {isLoading || isLoadingRestaurantData ? (
        <Loader />
      ) : isError ? (
        <Message variant='danger'>
          {isError?.data?.message ||
            isError.error ||
            isErrorRestaurantData?.data?.message ||
            isErrorRestaurantData.error}
        </Message>
      ) : (
        data &&
        data.products.length > 0 && (
          <>
            {' '}
            <Meta />
            {(userInfo?.isPremiumCustomer ||
              userInfo?.role === 'admin' ||
              true) && (
              <MenuCategoryDisplay
                menuPictures={restaurantData?.data?.menuPictures}
                restauarantId={restaurantData?.data?.user}
                userInfo={userInfo ? userInfo : null}
              />
            )}
            {(userInfo?.isPremiumCustomer ||
              userInfo?.role === 'admin' ||
              true) &&
              restaurantData?.data?.aboutPodcast?.podcast && ( // Update this condition with your audio field name
                <div
                  className='my-2'
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <h2>Our Podcast...</h2>
                  <audio
                    className='my-2'
                    src={restaurantData?.data?.aboutPodcast?.podcast} // Update this with your audio field name
                    controls
                    width='100%'
                  ></audio>
                </div>
              )}
            <CategoryList
              categories={filteredCategoryList}
              onSelectCategory={handleSelectedCategory}
              selectedCategory={selectedCategory}
            />
            <Row>
              {data.products.map((product) => (
                <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                  <Product
                    product={product}
                    latitude={latitude}
                    longitude={longitude}
                    image={image}
                    restauarantId={restaurantId}
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

export default RestaurantProductsListScreen;
