import { Link } from 'react-router-dom';
import { Carousel, Image } from 'react-bootstrap';
import { useSelector } from 'react-redux';

const RestaurantProductCarousal = ({ products, restaurantData, restaurantId }) => {
  const { userInfo } = useSelector((state) => state.auth);

  const isPremiumUserOrAdmin = userInfo?.isPremiumCustomer || userInfo?.role === 'admin' || true;
  return (
    <Carousel pause='hover' className='bg-primary mb-4'>
       {isPremiumUserOrAdmin && restaurantData?.restaurantMedia?.team && (
        <Carousel.Item>
          <Image
            src={restaurantData.restaurantMedia.team}
            alt='Team'
            fluid
          />
          <Carousel.Caption className='carousel-caption'>
            <h2 className='text-white text-right'>Meet Our Team</h2>
          </Carousel.Caption>
        </Carousel.Item>
      )}
      {isPremiumUserOrAdmin &&restaurantData?.restaurantMedia?.quote && (
        <Carousel.Item>
          <Image
            src={restaurantData.restaurantMedia.quote}
            alt='Quote'
            fluid
          />
          <Carousel.Caption className='carousel-caption'>
            <h2 className='text-white text-right'>Our Philosophy</h2>
          </Carousel.Caption>
        </Carousel.Item>
      )}
      {isPremiumUserOrAdmin && restaurantData?.restaurantMedia?.video && (
        <Carousel.Item>
          <video
            controls
            autoPlay
            muted
            loop
            width='100%'
            style={{ maxHeight: '250px' }}
          >
            <source
              src={restaurantData.restaurantMedia.video}
              type='video/mp4'
            />
            Your browser does not support the video tag.
          </video>
        </Carousel.Item>
      )}

      {userInfo?.isPremiumCustomer && !restaurantData?.restaurantMedia && products.map((product) => {
        const encodedImage = encodeURIComponent(JSON.stringify(product.image));
        const toPath =
          product.image === '/images/sample.jpg'
            ? `/product/${product._id}/${encodedImage}/${restaurantId}`
            : `/product/${product._id}/${encodedImage}/${restaurantId}`;

        return (
          <Carousel.Item key={product._id}>
            <Link to={toPath}>
              <Image src={product.image} alt={product.name} fluid />
              <Carousel.Caption className='carousel-caption'>
                <h2 className='text-white text-right'>
                  {product.name} (R{product.price})
                </h2>
              </Carousel.Caption>
            </Link>
          </Carousel.Item>
        );
      })}
      {!userInfo?.isPremiumCustomer && products.map((product) => {
        const encodedImage = encodeURIComponent(JSON.stringify(product.image));
        const toPath =
          product.image === '/images/sample.jpg'
            ? `/product/${product._id}/${encodedImage}/${restaurantId}`
            : `/product/${product._id}/${encodedImage}/${restaurantId}`;

        return (
          <Carousel.Item key={product._id}>
            <Link to={toPath}>
              <Image src={product.image} alt={product.name} fluid />
              <Carousel.Caption className='carousel-caption'>
                <h2 className='text-white text-right'>
                  {product.name} (R{product.price})
                </h2>
              </Carousel.Caption>
            </Link>
          </Carousel.Item>
        );
      })}
    </Carousel>
  );
};

export default RestaurantProductCarousal;
