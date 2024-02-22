import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Col, Row } from 'react-bootstrap';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import FormContainer from '../../components/FormContainer';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import {
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from '../../slices/usersApiSlice';

const UserEditScreen = () => {
  const { id: userId } = useParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [role, setRole] = useState('');
  const pattern = /\d{3}[-\s]?\d{3}[-\s]?\d{4}/;

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useGetUserDetailsQuery(userId);

  const [updateUser, { isLoading: loadingUpdate }] = useUpdateUserMutation();

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!pattern.test(mobileNumber)) {
      return toast.error('Please provide a valid number');
    }
    try {
      await updateUser({
        userId,
        name,
        email,
        mobileNumber,
        roles: [role],
      }).unwrap();
      toast.success('user updated successfully');
      refetch();
      navigate('/admin/userlist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setMobileNumber(user.mobileNumber);
      setRole(user.roles[0]);
    }
  }, [user]);

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  return (
    <>
      <Link to='/admin/userlist' className='btn btn-light my-3'>
        Go Back
      </Link>
      <FormContainer>
        <h1>Edit User</h1>
        {loadingUpdate && <Loader />}
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <Form onSubmit={submitHandler}>
            <Form.Group className='my-2' controlId='name'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type='name'
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
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter Cell Number'
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group as={Row} className='my-2'>
              <Col>
                <Form.Check
                  type='radio'
                  label='Customer'
                  name='role'
                  id='customer'
                  value='customer'
                  checked={role === 'customer'}
                  onChange={handleRoleChange}
                />
              </Col>
              <Col>
                <Form.Check
                  type='radio'
                  label='Rider'
                  name='role'
                  id='driver'
                  value='driver'
                  checked={role === 'driver'}
                  onChange={handleRoleChange}
                />
              </Col>
              <Col>
                <Form.Check
                  type='radio'
                  label='Restaurant'
                  name='role'
                  id='restaurant'
                  value='restaurant'
                  checked={role === 'restaurant'}
                  onChange={handleRoleChange}
                />
              </Col>
            </Form.Group>

            <Button type='submit' variant='primary'>
              Update
            </Button>
          </Form>
        )}
      </FormContainer>
    </>
  );
};

export default UserEditScreen;
