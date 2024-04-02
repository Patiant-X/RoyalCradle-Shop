import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import FormContainer from '../../components/FormContainer';
import AddressData from '../../components/AddressData';
import { toast } from 'react-toastify';
import {
  useGetProductDetailsQuery,
  useUpdateProductMutation,
  useUploadProductImageMutation,
} from '../../slices/productsApiSlice';

const ProductEditScreen = () => {
  const { id: productId } = useParams();

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [isFood, setIsFood] = useState(true);
  const [category, setCategory] = useState('');
  const [productIsAvailable, setProductIsAvailable] = useState(true);
  const [description, setDescription] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantArea, setRestaurantArea] = useState('');
  const [address, setAddress] = useState(null);
  const [addressCoordinates, setAddressCoordinates] = useState(null);

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const [updateProduct, { isLoading: loadingUpdate }] =
    useUpdateProductMutation();

  const [uploadProductImage, { isLoading: loadingUpload }] =
    useUploadProductImageMutation();

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (
      addressCoordinates?.place != null &&
      addressCoordinates?.lat != null &&
      addressCoordinates?.lng != null
    ) {
      const location = addressCoordinates.place.address_components
        .map((component) => component.long_name)
        .join(' ');
      const lat = addressCoordinates.lat;
      const lng = addressCoordinates.lng;

      const updatedProduct = {
        productId,
        name,
        price,
        image,
        IsFood: isFood,
        category,
        description,
        restaurantArea,
        restaurantName,
        productIsAvailable,
        latitude: lat,
        longitude: lng,
        address: location,
      };
      try {
        await updateProduct(updatedProduct).unwrap(); // NOTE: here we need to unwrap the Promise to catch any rejection in our catch block
        toast.success('Product updated');
        refetch();
        navigate('/admin/productlist');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    } else {
      toast.error('Please select address from google suggestions');
    }
  };

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price);
      setImage(product.image);
      setIsFood(product.IsFood);
      setCategory(product.category);
      setRestaurantArea(product?.restaurantArea);
      setRestaurantName(product?.restaurantName);
      setProductIsAvailable(product.productIsAvailable);
      setDescription(product.description);
      setAddress(product.location);
    }
  }, [product]);

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      setImage(res.image);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Link to='/admin/productlist' className='btn btn-light my-3'>
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
            <Form.Group controlId='name'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type='name'
                placeholder='Enter name'
                value={name}
                onChange={(e) => setName(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='price'>
              <Form.Label>Price</Form.Label>
              <Form.Control
                type='number'
                placeholder='Enter price'
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='image'>
              <Form.Label>Image</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter image url'
                value={image}
                onChange={(e) => setImage(e.target.value)}
              ></Form.Control>
              <Form.Control
                label='Choose File'
                onChange={uploadFileHandler}
                type='file'
              ></Form.Control>
              {loadingUpload && <Loader />}
            </Form.Group>

            <label style={{ marginBottom: '5px', marginTop: '20px' }}>
              Enter address:
            </label>
            <AddressData setAddressCoordinates={setAddressCoordinates} />

            <Form.Group controlId='category' className='my-4'>
              <Form.Label>Category</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter category'
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='description'>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as='textarea'
                placeholder='Enter description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ height: '150px', resize: 'both' }}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='restaurantName' className='my-4'>
              <Form.Label>Restaurant Name</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter Restaurant Name'
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='restaurantArea' className='my-4'>
              <Form.Label>Restaurant Area</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter Restaurant Area'
                value={restaurantArea}
                onChange={(e) => setRestaurantArea(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='isFood' className='my-2'>
              <Form.Label>IsFood</Form.Label>
              <Form.Check
                style={{ marginLeft: '10px' }}
                type='checkbox'
                label='Food'
                checked={isFood}
                onChange={(e) => setIsFood(e.target.checked)}
              />
            </Form.Group>

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

export default ProductEditScreen;
