import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  ListGroup,
  Image,
  Form,
  Button,
  Card,
} from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import Message from '../components/Message';
import { addToCart, removeFromCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';

const CartScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const restaurantList = useSelector(
    (state) => state.restaurant.restaurantList
  );
  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;
  let restaurantId;
  if (cartItems.length > 0) {
    const restaurantItemWithProduct = restaurantList.find((restaurant) =>
      cartItems.some((item) => item.user === restaurant.user._id)
    );
    restaurantId = restaurantItemWithProduct?._id;
    if (!restaurantItemWithProduct) {
      toast.error('Restaurant information not found. Please try again.');
      navigate('/');
      return null;
    }
  }

  // NOTE: no need for an async function here as we are not awaiting the
  // resolution of a Promise
  const addToCartHandler = (product, qty, additionalInfo) => {
    if (maxItemsInCart(cartItems, product._id, qty)) {
      return;
    }
    dispatch(addToCart({ ...product, qty, additionalInfo }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=/shipping');
  };
  return (
    <Row>
      <Col md={8}>
        <h1 className='mb-3'>Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <Message>
            Your cart is empty <Link to='/'>Go Back</Link>
          </Message>
        ) : (
          <>
            {' '}
            <ListGroup variant='flush'>
              {cartItems.map((item) => (
                <ListGroup.Item key={item._id}>
                  <Row>
                    <Col md={2}>
                      <Image src={item.image} alt={item.name} fluid rounded />
                    </Col>
                    <Col md={3} className='mt-2 mt-md-0'>
                      <Link
                        to={`/product/${item._id}/${encodeURIComponent(
                          JSON.stringify(item.image)
                        )}/${restaurantId}`}
                      >
                        {item.name}
                      </Link>
                    </Col>
                    <Col md={2} className='mt-2 mt-md-0'>
                      R{item.price}
                    </Col>
                    <Col md={2} className='mt-2 mt-md-0'>
                      <Form.Control
                        as='select'
                        value={item.qty}
                        onChange={(e) =>
                          addToCartHandler(
                            item,
                            Number(e.target.value),
                            item.additionalInfo
                          )
                        }
                      >
                        {[...Array(5).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </Form.Control>
                    </Col>
                    <Col md={2} className='mt-2 mt-md-0'>
                      <Button
                        type='button'
                        variant='light'
                        onClick={() => removeFromCartHandler(item._id)}
                      >
                        <FaTrash />
                      </Button>
                    </Col>
                  </Row>
                  <Row className='my-3 mb-md-0'>
                    <Col>
                      <Form.Group controlId='customerNote'>
                        <Form.Control
                          as='textarea'
                          rows={1}
                          defaultValue={
                            item.additionalInfo || 'Add a note (optional)'
                          }
                          onChange={(e) =>
                            addToCartHandler(item, item.qty, e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
        )}
      </Col>

      <Col md={4}>
        <Card>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>
                Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)})
                items
              </h2>
              R
              {cartItems
                .reduce((acc, item) => acc + item.qty * item.price, 0)
                .toFixed(2)}
            </ListGroup.Item>
            <ListGroup.Item>
              <Button
                type='button'
                className='btn-block'
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
              >
                Proceed To Checkout
              </Button>
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </Col>
    </Row>
  );
};

const maxItemsInCart = (cartItems, productId, qty) => {
  let totalQty = 0;

  for (let product of cartItems) {
    if (product._id === productId) {
      totalQty += qty; // Add the new quantity for the specified product
    } else {
      totalQty += product.qty; // Add the existing quantity for other products
    }
  }

  if (totalQty > 5) {
    toast.error(`Maximum of 5 items per order.`);
    return true;
  } else {
    return false;
  }
};

export default CartScreen;
