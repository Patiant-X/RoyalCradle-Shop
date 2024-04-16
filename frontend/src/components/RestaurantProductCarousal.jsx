import { Link } from 'react-router-dom';
import { Carousel, Image } from 'react-bootstrap';

const RestaurantProductCarousal = ({ products }) => {
  return (
    <Carousel pause='hover' className='bg-primary mb-4'>
      {products.map((product) => {
        const encodedImage = encodeURIComponent(JSON.stringify(product.image));
        const toPath =
          product.image === '/images/sample.jpg'
            ? `/product/${product._id}/${encodedImage}`
            : `/product/${product._id}/${encodedImage}`;

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
