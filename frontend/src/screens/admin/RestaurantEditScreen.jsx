import React, { useEffect, useState } from 'react';
import { Form, Button, Badge } from 'react-bootstrap';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import AddressData from '../../components/AddressData';
import { useUploadProductImageMutation } from '../../slices/productsApiSlice';
import { restaurantCategoryList } from '../../data/restaurantCategoryList.js';
import {
  useCreateRestaurantMutation,
  useGetRestaurantByIdQuery,
  useUpdateRestaurantByIdMutation,
} from '../../slices/restaurantApiSlice';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';

const CreateRestaurantScreen = () => {
  const { id } = useParams();

  const {
    data: restaurantData,
    isLoading: isLoadingRestaurant,
    isError: isErrorRestaurant,
    refetch,
  } = useGetRestaurantByIdQuery(id);

  const [name, setName] = useState('');
  const [chosenCuisines, setChosenCuisines] = useState([]);
  const [restaurantImage, setRestaurantImage] = useState('/images/sample.jpg');
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [addressCoordinates, setAddressCoordinates] = useState(null);

  useEffect(() => {
    if (restaurantData) {
      // Set form fields with data fetched from the database
      setName(restaurantData.data.name);
      setChosenCuisines(restaurantData.data.cuisine);
      setRestaurantImage(restaurantData.data.image);
      setOpeningTime(restaurantData.data.operatingHours.openingTime);
      setClosingTime(restaurantData.data.operatingHours.closingTime);
      setPaymentMethods(restaurantData.data.paymentMethods);
      setDeliveryOptions(restaurantData.data.deliveryOptions);
    }
  }, [restaurantData, refetch]);

  const [createRestaurant, { isLoading, isError, error }] =
    useCreateRestaurantMutation();

  const [updateRestaurantById] = useUpdateRestaurantByIdMutation();

  const [uploadRestaurantImage, { isLoading: loadingUpload }] =
    useUploadProductImageMutation();

  const uploadFileHandler = async (e) => {
    if (name === '') {
      toast.error('Please provide a restaurant name');
      return;
    }
    const formData = new FormData();
    formData.append('restaurantName', name);
    formData.append('image', e.target.files[0]);
    try {
      const res = await uploadRestaurantImage(formData).unwrap();
      toast.success(res.message);
      setRestaurantImage(res.image);
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const addCuisine = (cuisine) => {
    setChosenCuisines((prevCuisines) => [...prevCuisines, cuisine]);
  };

  const removeCuisine = (cuisine) => {
    setChosenCuisines((prevCuisines) =>
      prevCuisines.filter((c) => c !== cuisine)
    );
  };

  const handlePaymentMethodChange = (method) => {
    if (paymentMethods.includes(method)) {
      setPaymentMethods(paymentMethods.filter((m) => m !== method));
    } else {
      setPaymentMethods([...paymentMethods, method]);
    }
  };

  const handleDeliveryOptionChange = (option) => {
    if (deliveryOptions.includes(option)) {
      setDeliveryOptions(deliveryOptions.filter((o) => o !== option));
    } else {
      setDeliveryOptions([...deliveryOptions, option]);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    let restaurantInfo;
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
      const restaurantData = {
        name,
        location: {
          address: location,
          latitude: lat,
          longitude: lng,
        },
        cuisine: chosenCuisines,
        image: restaurantImage,
        operatingHours: { openingTime, closingTime },
        paymentMethods,
        deliveryOptions,
      };
      restaurantInfo = restaurantData;
    } else {
      toast.error('Please select address from google suggestions');
      return;
    }

    try {
      if (restaurantData) {
        //If restaurant data exists, update the restaurant
        await updateRestaurantById({ id, updates: restaurantInfo });
        refetch();
        toast.success('Restaurant updated successfully');
      } else {
        // If restaurant data doesn't exist, create a new restaurant
        await createRestaurant(restaurantInfo);
        toast.success('Restaurant created successfully');
      }
    } catch (err) {
      toast.error(err.err || err.message);
      console.error('Error creating restaurant:', err);
    }
  };

  if (isLoadingRestaurant) {
    return <Loader />;
  }

  // if (isErrorRestaurant) {
  //   return <Message variant='danger'>{error.message}</Message>;
  // }

  return (
    <>
      {isErrorRestaurant ? (
        <h1>Create Restaurant</h1>
      ) : (
        <h1>Update Restaurant Profile</h1>
      )}
      {isLoading && <Loader />}
      {isError && <Message variant='danger'>{error.message}</Message>}
      <Form onSubmit={submitHandler}>
        {/* Other form fields */}

        <Form.Group controlId='name'>
          <Form.Label>Name</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId='restaurantImage' className='mt-2'>
          <Form.Label>Restaurant Image</Form.Label>
          <Form.Control
            label='Choose File'
            onChange={uploadFileHandler}
            type='file'
          ></Form.Control>
          {loadingUpload && <Loader />}
        </Form.Group>

        <Form.Group controlId='cuisines' className='mt-2'>
          <Form.Label>Cuisines</Form.Label>
          <div>
            {restaurantCategoryList.map((cuisine, index) => (
              <Button
                key={index}
                variant={
                  chosenCuisines.includes(cuisine.name)
                    ? 'success'
                    : 'outline-secondary'
                }
                className='me-2 mb-2'
                onClick={() =>
                  chosenCuisines.includes(cuisine.name)
                    ? removeCuisine(cuisine.name)
                    : addCuisine(cuisine.name)
                }
              >
                {cuisine.icon} {cuisine.name}
              </Button>
            ))}
          </div>
          <div>
            {chosenCuisines.map((cuisine, index) => (
              <Badge key={index} bg='info' className='me-2 mb-2'>
                {cuisine}
              </Badge>
            ))}
          </div>
        </Form.Group>

        <label style={{ marginBottom: '5px', marginTop: '20px' }}>
              Enter address:
            </label>
            <AddressData setAddressCoordinates={setAddressCoordinates} />

        <Form.Group controlId='openingTime' className='mt-2'>
          <Form.Label>Opening Time</Form.Label>
          <Form.Control
            as='select'
            value={openingTime}
            onChange={(e) => setOpeningTime(e.target.value)}
          >
            <option value=''>Select opening time</option>
            {/* Populate options with 24-hour format times */}
            {Array.from({ length: 24 }, (_, i) => {
              const hour = i < 10 ? `0${i}` : `${i}`;
              return (
                <option key={i} value={`${hour}:00`}>{`${hour}:00`}</option>
              );
            })}
          </Form.Control>
        </Form.Group>

        <Form.Group controlId='closingTime' className='mt-2'>
          <Form.Label>Closing Time</Form.Label>
          <Form.Control
            as='select'
            value={closingTime}
            onChange={(e) => setClosingTime(e.target.value)}
          >
            <option value=''>Select closing time</option>
            {/* Populate options with 24-hour format times */}
            {Array.from({ length: 24 }, (_, i) => {
              const hour = i < 10 ? `0${i}` : `${i}`;
              return (
                <option key={i} value={`${hour}:00`}>{`${hour}:00`}</option>
              );
            })}
          </Form.Control>
        </Form.Group>

        <Form.Group controlId='paymentMethods' className='mt-2'>
          <Form.Label>Payment Methods</Form.Label>
          <div>
            <Form.Check
              type='checkbox'
              label='Card'
              checked={paymentMethods.includes('card')}
              onChange={() => handlePaymentMethodChange('card')}
            />
            <Form.Check
              type='checkbox'
              label='Cash'
              checked={paymentMethods.includes('cash')}
              onChange={() => handlePaymentMethodChange('cash')}
            />
          </div>
        </Form.Group>

        <Form.Group controlId='deliveryOptions' className='my-2'>
          <Form.Label>Delivery Options</Form.Label>
          <div>
            <Form.Check
              type='checkbox'
              label='Delivery'
              checked={deliveryOptions.includes('delivery')}
              onChange={() => handleDeliveryOptionChange('delivery')}
            />
            <Form.Check
              type='checkbox'
              label='Collection'
              checked={deliveryOptions.includes('collection')}
              onChange={() => handleDeliveryOptionChange('collection')}
            />
          </div>
        </Form.Group>

        <Button type='submit' variant='primary'>
          {isErrorRestaurant ? 'Create Restaurant' : 'Update Restaurant'}
        </Button>
      </Form>
    </>
  );
};

export default CreateRestaurantScreen;
