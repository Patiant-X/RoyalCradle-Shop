import React from 'react';
import { Link } from 'react-router-dom';
import { Carousel, Image } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import '../assets/styles/Components/RestaurantProductCarousal.css'

const RestaurantProductCarousal = ({ products, restaurantData, restaurantId }) => {
  const { userInfo } = useSelector((state) => state.auth);

  const isPremiumUserOrAdmin = userInfo?.isPremiumCustomer || userInfo?.role === 'admin' || true;

  const hasRestaurantMedia = 
    restaurantData?.restaurantMedia?.team?.trim() ||
    restaurantData?.restaurantMedia?.quote?.trim() ||
    restaurantData?.restaurantMedia?.video?.trim();

  return (
    <Carousel
      pause='hover'
      className='bg-primary mb-4'
      nextIcon={<span className="carousel-control-next-icon restaurant-carousel-control-next" aria-hidden="true"></span>}
      prevIcon={<span className="carousel-control-prev-icon restaurant-carousel-control-prev" aria-hidden="true"></span>}
    >
      {isPremiumUserOrAdmin && restaurantData?.restaurantMedia?.team?.trim() && (
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
      {isPremiumUserOrAdmin && restaurantData?.restaurantMedia?.quote?.trim() && (
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
      {isPremiumUserOrAdmin && restaurantData?.restaurantMedia?.video?.trim() && (
        <Carousel.Item>
          <video
            controls
            autoPlay
            muted
            loop
            width='100%'
            style={{ maxHeight: '500px', position: 'relative', zIndex: 2 }}
          >
            <source
              src={restaurantData.restaurantMedia.video}
              type='video/mp4'
            />
            Your browser does not support the video tag.
          </video>
        </Carousel.Item>
      )}

      {!hasRestaurantMedia && products.map((product) => {
        const encodedImage = encodeURIComponent(JSON.stringify(product.image));
        const toPath = `/product/${product._id}/${encodedImage}/${restaurantId}`;

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
