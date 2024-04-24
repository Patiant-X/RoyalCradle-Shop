import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Table, Button, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useGetAllRestaurantsQuery, useDeleteRestaurantByIdMutation } from '../../slices/restaurantApiSlice.js';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { toast } from 'react-toastify';

const RestaurantListScreen = () => {
  const { pageNumber, keyword } = useParams();
  const { data, isLoading, error, refetch } = useGetAllRestaurantsQuery({ keyword, pageNumber, latitude: null, longitude: null, state: false });

  const [deleteRestaurantById, { isLoading: loadingDelete }] =
  useDeleteRestaurantByIdMutation('1');

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure')) {
      try {
        await deleteRestaurantById(id);
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };


  useEffect(() => {
    refetch();
  }, []);

  return (
    <>
      <Row className='align-items-center'>
        <Col>
          <h1>Restaurants</h1>
        </Col>
        <Col className='text-end'>
          <Link to='/admin/restaurant/__/edit' className='btn btn-primary'>
            Create Restaurant
          </Link>
        </Col>
      </Row>

      {isLoading && <Loader />}
      {error && <Message variant='danger'>{error.message}</Message>}
      {loadingDelete && <Loader />}
      
      <Table striped bordered hover responsive className='table-sm'>
        <thead>
          <tr>
            <th>ID</th>
            <th>NAME</th>
            {/* Add more columns as needed */}
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {data?.restaurants?.map((restaurant) => (
            <tr key={restaurant._id}>
              <td>{restaurant._id}</td>
              <td><Link to={`/admin/restaurantitemslist/${restaurant?.user?._id}`}>{restaurant.name}</Link></td>
              {/* Add more cells for other restaurant data */}
              <td>
                <Link to={`/admin/restaurant/${restaurant._id}/edit`} className='btn btn-light btn-sm mx-2'>
                  <FaEdit />
                </Link>
                <Button
                  variant='danger'
                  className='btn-sm'
                  onClick={() => deleteHandler(restaurant._id)}
                >
                  <FaTrash style={{ color: 'white' }} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default RestaurantListScreen;
