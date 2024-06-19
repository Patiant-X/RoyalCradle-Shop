import React, { useEffect, useState } from 'react';
import { Form, Button, Badge, Image, Carousel } from 'react-bootstrap';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import AddressData from '../../components/AddressData';
import { useUploadProductImageMutation } from '../../slices/productsApiSlice';
import { restaurantCategoryList } from '../../data/restaurantCategoryList.js';
import {
  useCreateRestaurantMutation,
  useGetRestaurantByIdQuery,
  useUpdateRestaurantByIdMutation,
  useUploadRestaurantAudioMutation,
  useUploadRestaurantVideoMutation,
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
  const [status, setStatus] = useState('open');
  const [generalOperatingHours, setGeneralOperatingHours] = useState({
    openingTime: '',
    closingTime: '',
    daysOpen: [],
  });
  const daysOfWeek = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];
  const [videoUrl, setVideoUrl] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [addressCoordinates, setAddressCoordinates] = useState(null);
  const [teamImage, setTeamImage] = useState('');
  const [quoteImage, setQuoteImage] = useState('');
  const [restaurantMedia, setRestaurantMedia] = useState({
    team: '',
    quote: '',
    video: '',
  });
  const [restaurantPodcast, setRestaurantPodcast] = useState("");
  const [menuPictures, setMenuPictures] = useState({});
  const [menuPictureCategory, setMenuPictureCategory] = useState('');

  useEffect(() => {
    if (restaurantData) {
      // Set form fields with data fetched from the database
      setName(restaurantData.data.name);
      setChosenCuisines(restaurantData.data.cuisine);
      setRestaurantImage(restaurantData.data.image);
      setPaymentMethods(restaurantData.data.paymentMethods);
      setDeliveryOptions(restaurantData.data.deliveryOptions);
      setRestaurantMedia(restaurantData.data.restaurantMedia || {});
      setMenuPictures(restaurantData.data.menuPictures || {});
      setStatus(restaurantData.data.status || 'open');
      setGeneralOperatingHours(restaurantData.data.operatingHours);
      setRestaurantPodcast(restaurantData.data.aboutPodcast || {});
    }
  }, [restaurantData, refetch]);

  const [createRestaurant, { isLoading, isError }] =
    useCreateRestaurantMutation();

  const [updateRestaurantById] = useUpdateRestaurantByIdMutation();

  const [uploadRestaurantImage, { isLoading: loadingUpload }] =
    useUploadProductImageMutation();

  const [
    uploadRestaurantVideo,
    {
      isLoading: isLoadinguploadRestaurantVideo,
      isError: isErroruploadRestaurantVideo,
    },
  ] = useUploadRestaurantVideoMutation();

  const [uploadRestaurantAudio, { isLoading: isLoadinguploadRestaurantAudio }] =
    useUploadRestaurantAudioMutation();

  const uploadFileHandler = async (e, type) => {
    if (name === '') {
      toast.error('Please provide a restaurant name');
      return;
    }
    if (menuPictureCategory === '' && type === 'menu') {
      toast.error('Please provide a category for the menu picture');
      return;
    }
    const formData = new FormData();
    formData.append('restaurantName', name);
    formData.append('image', e.target.files[0]);
    try {
      const res = await uploadRestaurantImage(formData).unwrap();
      toast.success(res.message);
      switch (type) {
        case 'team':
          setTeamImage(res.image);
          setRestaurantMedia((prevMedia) => ({
            ...prevMedia,
            [type]: res.image,
          }));
          break;
        case 'quote':
          setQuoteImage(res.image);
          setRestaurantMedia((prevMedia) => ({
            ...prevMedia,
            [type]: res.image,
          }));
          break;
        case 'menu':
          setMenuPictures((prevPictures) => ({
            ...prevPictures,
            [menuPictureCategory]: res.image,
          }));
          break;
        default:
          setRestaurantImage(res.image);
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleUploadVideo = async (e) => {
    if (name === '') {
      toast.error('Please provide a restaurant name');
      return;
    }
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('video', file);
    formData.append('restaurantName', name);
    try {
      const res = await uploadRestaurantVideo(formData).unwrap();
      toast(res.message);
      setVideoUrl(res.video);
      setRestaurantMedia((prevMedia) => ({ ...prevMedia, video: res.video }));
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error(error.message);
    }
  };

  const handleUploadAudio = async (e) => {
    // New function
    if (name === '') {
      toast.error('Please provide a restaurant name');
      return;
    }
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('restaurantName', name);
    try {
      const res = await uploadRestaurantAudio(formData).unwrap();
      toast(res.message);
      // Update the aboutPodcast field with the audio URL
      setRestaurantPodcast({
        podcast: res.audio,
      });
    } catch (error) {
      console.error('Error uploading audio:', error);
      toast.error(error.message);
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
        paymentMethods,
        deliveryOptions,
        restaurantMedia,
        menuPictures,
        status,
        aboutPodcast: restaurantPodcast,
        operatingHours: {
          openingTime: generalOperatingHours.openingTime,
          closingTime: generalOperatingHours.closingTime,
          daysOpen: generalOperatingHours.daysOpen,
        },
      };
      setMenuPictureCategory('');
      restaurantInfo = restaurantData;
    } else {
      toast.error('Please select address from google suggestions');
      return;
    }

    try {
      if (restaurantData && id) {
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
      toast.error(err.err || err.message || "Error Crreating or Updating Restaurant");
    }
  };

  if (isLoadingRestaurant) {
    return <Loader />;
  }

  return (
    <>
      {isErrorRestaurant ? (
        <h1>Create Restaurant</h1>
      ) : (
        <h1>Update Restaurant Profile</h1>
      )}

      {isLoading && <Loader />}
      {isError && <Message variant='danger'>{isError.message}</Message>}
      <Form onSubmit={submitHandler}>
        <Form.Group controlId='name'>
          <Form.Label>Name</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId='status'>
          <Form.Label>Status</Form.Label>
          <Form.Control
            as='select'
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value='open'>open</option>
            <option value='closed'>closed</option>
            <option value='suspended'>suspended</option>
          </Form.Control>
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
        <Image
          className='my-2 mt-3'
          src={restaurantImage}
          alt='RestaurantImage'
          style={{ width: '100px', height: '100px' }}
        />

        <Form.Group controlId='teamImage'>
          <Form.Label>Team Image</Form.Label>
          <Form.Control
            type='file'
            label='Choose file'
            onChange={(e) => uploadFileHandler(e, 'team')}
          ></Form.Control>
          {loadingUpload && <Loader />}
          <Image
            className='my-2'
            src={teamImage || restaurantMedia?.team}
            alt='Team'
            style={{ width: '100px', height: '100px' }}
          />
        </Form.Group>
        <Form.Group controlId='quoteImage'>
          <Form.Label>Quote Image</Form.Label>
          <Form.Control
            type='file'
            label='Choose file'
            onChange={(e) => uploadFileHandler(e, 'quote')}
          ></Form.Control>
          {loadingUpload && <Loader />}
          <Image
            className='my-2'
            src={quoteImage || restaurantMedia?.quote}
            alt='Quote'
            style={{ width: '100px', height: '100px' }}
          />
        </Form.Group>

        <Form.Group controlId='menuPictureCategory' className='mt-2'>
          <Form.Label>Menu Picture Category</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter category'
            value={menuPictureCategory}
            onChange={(e) =>
              setMenuPictureCategory(e.target.value.toUpperCase())
            }
          />
        </Form.Group>
        <Form.Group controlId='menuPicture' className='mt-2'>
          <Form.Label>Menu Picture</Form.Label>
          <Form.Control
            type='file'
            label='Choose file'
            onChange={(e) => uploadFileHandler(e, 'menu')}
          ></Form.Control>
          {loadingUpload && <Loader />}
        </Form.Group>

        {/* Display menu pictures in carousel */}
        <Carousel className='my-4'>
          {Object.entries(menuPictures)?.map(([category, url]) => (
            <Carousel.Item key={category}>
              <div className='text-center'>
                <h3>{category}</h3>
                <Image
                  src={url}
                  alt={`${category} image`}
                  style={{ width: '100px', height: '100px' }}
                  fluid
                />
              </div>
            </Carousel.Item>
          ))}
        </Carousel>

        <Form.Group controlId='restaurantVideo' className='mt-2'>
          <Form.Label>Restaurant Video</Form.Label>
          <Form.Control
            label='Choose File'
            onChange={handleUploadVideo}
            type='file'
          ></Form.Control>
          {isLoadinguploadRestaurantVideo && <Loader />}

          {(videoUrl || restaurantMedia?.video) && (
            <div className='my-2'>
              <h2>Uploaded Video</h2>
              <video
                className='my-2'
                src={videoUrl || restaurantMedia?.video}
                controls
                width='100%'
                height='250'
              ></video>
            </div>
          )}
        </Form.Group>

        <Form.Group controlId='restaurantAudio' className='mt-2'>
          <Form.Label>Restaurant Audio (Podcast)</Form.Label>
          <Form.Control
            label='Choose File'
            onChange={handleUploadAudio}
            type='file'
          ></Form.Control>
          {isLoadinguploadRestaurantAudio && <Loader />}

          {restaurantPodcast?.podcast && ( // Update this condition with your audio field name
            <div className='my-2'>
              <h2>Uploaded Audio</h2>
              <audio
                className='my-2'
                src={restaurantPodcast?.podcast} // Update this with your audio field name
                controls
                width='100%'
              ></audio>
            </div>
          )}
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

        <Form.Group controlId='generalOperatingHours' className='mt-2'>
          <Form.Label>Operating Hours</Form.Label>
          <div className='d-flex mb-2 align-items-center mt-2'>
            <Form.Label className='mr-2' style={{ width: '100px' }}>
              Opening Time
            </Form.Label>
            <Form.Control
              type='time'
              value={generalOperatingHours.openingTime}
              onChange={(e) =>
                setGeneralOperatingHours((prev) => ({
                  ...prev,
                  openingTime: e.target.value,
                }))
              }
              className='mr-2'
            />
            <Form.Label className='mr-2' style={{ width: '100px' }}>
              Closing Time
            </Form.Label>
            <Form.Control
              type='time'
              value={generalOperatingHours.closingTime}
              onChange={(e) =>
                setGeneralOperatingHours((prev) => ({
                  ...prev,
                  closingTime: e.target.value,
                }))
              }
            />
          </div>

          <Form.Label>Days Open</Form.Label>
          <div>
            {daysOfWeek.map((day) => (
              <Form.Check
                type='checkbox'
                key={day}
                label={day.charAt(0).toUpperCase() + day.slice(1)}
                checked={generalOperatingHours.daysOpen.includes(day)}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setGeneralOperatingHours((prev) => ({
                    ...prev,
                    daysOpen: isChecked
                      ? [...prev.daysOpen, day]
                      : prev.daysOpen.filter((d) => d !== day),
                  }));
                }}
              />
            ))}
          </div>
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
