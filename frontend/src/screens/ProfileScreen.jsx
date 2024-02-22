import React, { useEffect, useState } from 'react';
import { Form, Button} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { useProfileMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import FormContainer from '../components/FormContainer';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const pattern = /\d{3}[-\s]?\d{3}[-\s]?\d{4}/;

  const { userInfo } = useSelector((state) => state.auth);
  const [updateProfile, { isLoading: loadingUpdateProfile }] =
    useProfileMutation();

  useEffect(() => {
    setName(userInfo.name);
    setEmail(userInfo.email);
    setMobileNumber(userInfo.mobileNumber);
  }, [userInfo.email, userInfo.name, userInfo.mobileNumber]);

  const dispatch = useDispatch();
  const submitHandler = async (e) => {
    e.preventDefault();
    if (!pattern.test(mobileNumber)) {
      return toast.error('Please provide a valid number');
    }
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    } else if (password.length < 8) {
      return toast.error('Password must be at least 8 characters long');
    } else {
      try {
        const res = await updateProfile({
          // NOTE: here we don't need the _id in the request payload as this is
          // not used in our controller.
          // _id: userInfo._id,
          name,
          email,
          password,
          mobileNumber,
        }).unwrap();
        dispatch(setCredentials({ ...res }));
        toast.success('Profile updated successfully');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <FormContainer>
      <h2>User Profile</h2>

      <Form onSubmit={submitHandler}>
        <Form.Group className='my-2' controlId='name'>
          <Form.Label>Name</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group className='my-2' controlId='email'>
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type='email'
            placeholder='Enter email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group className='my-2' controlId='mobileNumber'>
          <Form.Label>Cellphone Number</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter cellphone number'
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group className='my-2' controlId='password'>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type='password'
            placeholder='Enter password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group className='my-2' controlId='confirmPassword'>
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type='password'
            placeholder='Confirm password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Button type='submit' variant='primary'>
          Update
        </Button>
        {loadingUpdateProfile && <Loader />}
      </Form>
    </FormContainer>
  );
};

export default ProfileScreen;
