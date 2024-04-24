import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import FormContainer from '../../components/FormContainer';
import { toast } from 'react-toastify';
import {
  useGetProductDetailsQuery,
  useUpdateProductMutation,
} from '../../slices/productsApiSlice';

const RestaurantProductEditScreen = () => {
  const { id: productId } = useParams();
  const [productIsAvailable, setProductIsAvailable] = useState(true);
  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const [updateProduct, { isLoading: loadingUpdate }] =
    useUpdateProductMutation();

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    const updatedProduct = {
      productId,
      productIsAvailable,
    };
    try {
      await updateProduct(updatedProduct).unwrap(); // NOTE: here we need to unwrap the Promise to catch any rejection in our catch block
      toast.success('Product updated');
      refetch();
      navigate('/restaurant/restaurantproductlist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  useEffect(() => {
    if (product) {
      setProductIsAvailable(product.productIsAvailable);
    }
  }, [product]);

  return (
    <>
      <Link
        to='/restaurant/restaurantproductlist'
        className='btn btn-light my-3'
      >
        Go Back
      </Link>
      <FormContainer>
        <h1>Edit Product</h1>
        {loadingUpdate && <Loader />}
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>{error.data.message}</Message>
        ) : (
          <Form onSubmit={submitHandler}>
            <Form.Group controlId='productIsAvailable'>
              <Form.Label>Product is Available</Form.Label>
              <Form.Check
                style={{ marginLeft: '10px' }}
                type='checkbox'
                label='Available'
                checked={productIsAvailable}
                onChange={(e) => setProductIsAvailable(e.target.checked)}
              />
            </Form.Group>

            <Button
              type='submit'
              variant='primary'
              style={{ marginTop: '1rem' }}
            >
              Update
            </Button>
          </Form>
        )}
      </FormContainer>
    </>
  );
};

export default RestaurantProductEditScreen;
