import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button, Row, Col } from 'react-bootstrap';
import { FaEdit, FaPlus, FaTrash, FaCheck, FaMinusCircle } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import Paginate from '../../components/Paginate';
import {
  useDeleteProductMutation,
  useCreateProductMutation,
  useGetRestaurantProductQuery,
} from '../../slices/productsApiSlice';
import { toast } from 'react-toastify';

const RestaurantProductListScreen = () => {
  const { pageNumber } = useParams();

  const { data, isLoading, error, refetch } = useGetRestaurantProductQuery();

  const [deleteProduct, { isLoading: loadingDelete }] =
    useDeleteProductMutation();

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure')) {
      try {
        await deleteProduct(id).unwrap();
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const [createProduct, { isLoading: loadingCreate }] =
    useCreateProductMutation();

  const createProductHandler = async () => {
    if (window.confirm('Are you sure you want to create a new product?')) {
      try {
        await createProduct().unwrap();
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.err);
      }
    }
  };
  

  return (
    <>
      <Row className='align-items-center'>
        <Col>
          <h1>Products</h1>
        </Col>
        <Col className='text-end'>
          <Button className='my-3' onClick={createProductHandler}>
            <FaPlus /> Create Product
          </Button>
        </Col>
      </Row>

      {loadingCreate && <Loader />}
      {loadingDelete && <Loader />}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error.data.message}</Message>
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
              </tr>
            </thead>
            <tbody>
              {data?.product?.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>R{product.price}</td>
                  <td>{product.productIsAvailable ? <FaCheck /> : < FaMinusCircle/>}</td>
                  <td>{product.category}</td>
                  <td>{product.IsFood ? <FaCheck /> : < FaMinusCircle/>}</td>
                  <td>
                    <LinkContainer to={`/restaurant/restaurantproduct/${product._id}/edit`}>
                      <Button variant='light' className='btn-sm mx-2 py-4'>
                        <FaEdit />
                      </Button>
                    </LinkContainer>
                    <Button
                      variant='danger'
                      className='btn-sm'
                      onClick={() => deleteHandler(product._id)}
                    >
                      <FaTrash style={{ color: 'white' }} />
                    </Button>
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
