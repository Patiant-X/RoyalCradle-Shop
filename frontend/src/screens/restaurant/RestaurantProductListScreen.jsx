import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button, Row, Col } from 'react-bootstrap';
import { FaEdit, FaCheck, FaMinusCircle } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import Paginate from '../../components/Paginate';
import { useGetRestaurantProductQuery } from '../../slices/productsApiSlice';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

const RestaurantProductListScreen = () => {
  const { pageNumber } = useParams();

  const { userInfo } = useSelector((state) => state.auth);

  const { data, isLoading, error, refetch } = useGetRestaurantProductQuery({
    id: userInfo._id,
  });
  useEffect(() => {
    refetch();
  }, []);

  return (
    <>
      <Row className='align-items-center'>
        <Col>
          <h1>Products</h1>
        </Col>
      </Row>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error?.data?.error}</Message>
      ) : (
        <>
          <Table striped bordered hover responsive className='table-sm'>
            <thead>
              <tr>
                <th>NAME</th>
                <th>PRICE</th>
                <th>Available</th>
                <th>CATEGORY</th>
                <th>IsFood</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {data?.products?.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>R{product.price}</td>
                  <td>
                    {product.productIsAvailable ? (
                      <FaCheck />
                    ) : (
                      <FaMinusCircle />
                    )}
                  </td>
                  <td>{product.category}</td>
                  <td>{product.IsFood ? <FaCheck /> : <FaMinusCircle />}</td>
                  <td>
                    <LinkContainer
                      to={`/restaurant/restaurantproduct/${product._id}/edit`}
                    >
                      <Button variant='light' className='btn-sm mx-2 py-4'>
                        <FaEdit />
                      </Button>
                    </LinkContainer>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Paginate pages={data.pages} page={data.page} isAdmin={true} />
        </>
      )}
    </>
  );
};

export default RestaurantProductListScreen;
