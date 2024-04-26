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

const RestaurantProductsListScreen = () => {
  const { pageNumber, keyword, id } = useParams();
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

  const { data, isLoading, error, refetch } = useGetProductsQuery({
    keyword,
    pageNumber,
    latitude,
    longitude,
    restaurant: id,
    category: selectedCategory.trim(),
  });

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
      {keyword || isLoading || error || !data || data.products.length === 0 ? (
        <Link to='/' className='btn btn-light mb-4'>
          Go Back
        </Link>
      ) : (
        <>
          <Link to='/' className='btn btn-light mb-4'>
            Go Back
          </Link>
          <RestaurantProductCarousal products={data.products} image={image}/>
        </>
      )}
      {!isLoading && // Check if data is not loading
        (error || !data || data.products.length === 0) && ( // Check if there's an error or data array is empty
          <Alert variant='warning'>
            <h4>No Products Found!</h4>
            <p>
              There are no products available based on your current location. If
              you are in Witpoortjie, Mindalore, or Royal Cradle, please turn on
              your location and try again.
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
        data.products.length > 0 && (
          <>
            {' '}
            <Meta />
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
