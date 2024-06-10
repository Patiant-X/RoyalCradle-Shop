import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaHouseUser, FaBell } from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../slices/usersApiSlice';
import {
  logout,
  resetUserMessageCount,
  updateUserMessageCount,
} from '../slices/authSlice';
import { resetCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { useSocketContext } from '../context/SocketContext';
import useWebRTC from '../hooks/useWebRTC';

const Header = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { socket } = useSocketContext();
  const { userInfo, selectedUser } = useSelector((state) => state.auth);
  const onlineUsers = useSelector((state) => state.auth.onlineUsers);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      dispatch(resetCart());
      navigate('/login');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const [hasNewMessages, setHasNewMessages] = useState(false);

  useEffect(() => {
    const hasMessages = onlineUsers.some((user) => user.messageCount > 0);
    setHasNewMessages(hasMessages);
  }, [onlineUsers]);

  useWebRTC()

  useEffect(() => {
    if (socket && userInfo?._id) {
      socket.on('notification', (data) => {
        if (selectedUser === '') {
          const mes = (
            <div style={{ fontSize: '12px', padding: '0px' }}>
              <h2
                style={{
                  fontSize: '14px',
                  margin: '0 0 0px 0',
                  fontWeight: 'bold',
                }}
              >
                {data.name}
              </h2>
              <p style={{ margin: '0' }}> {data.message} </p>
            </div>
          );
          toast(mes, {
            position: 'top-right',
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light',
          });
        }
      });
      socket.on('message', (data) => {
        const lastMessage = data[data.length - 1];
        if (
          (lastMessage?.msgByNonUserId === selectedUser &&
            lastMessage?.msgByUserId === userInfo?._id) ||
          (lastMessage?.msgByNonUserId === userInfo?._id &&
            lastMessage?.msgByUserId === selectedUser)
        ) {
          dispatch(resetUserMessageCount(selectedUser));
        } else {
          dispatch(updateUserMessageCount(lastMessage?.msgByUserId));
          setHasNewMessages(true);
        }
      });
      return () => {
        socket.off('notification');
        socket.off('message');
      };
    }
  }, [socket, dispatch, userInfo?._id, selectedUser]);

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar-custom');
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  return (
    <header>
      <Navbar
        bg='primary'
        variant='dark'
        expand='lg'
        className='navbar-custom'
        collapseOnSelect
      >
        <Container>
          <LinkContainer to='/'>
            <Navbar.Brand>
              <span className='italic' style={{ fontFamily: 'serif' }}>
                5TygaEats
              </span>
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls='basic-navbar-nav'>
            <div style={{ position: 'relative' }}>
              {hasNewMessages ? (
                <FaBell
                  style={{
                    position: 'absolute',
                    top: '25px',
                    right: '40px',
                    color: 'green',
                    fontSize: '10px',
                  }}
                />
              ) : (
                <FaBell
                  style={{
                    position: 'absolute',
                    top: '25px',
                    right: '40px',
                    color: '',
                    fontSize: '7px',
                  }}
                />
              )}
              <span className='navbar-toggler-icon'></span>
            </div>
          </Navbar.Toggle>
          <Navbar.Collapse id='basic-navbar-nav'>
            <FaHouseUser
              size={30}
              onClick={() => navigate('/')}
              style={{ color: '#9b9b9b' }}
              className='fa-house-user'
            />
            <Nav className='ms-auto'>
              <LinkContainer to='/cart'>
                <Nav.Link>
                  <FaShoppingCart /> Cart
                  {cartItems.length > 0 && (
                    <Badge pill bg='success' style={{ marginLeft: '5px' }}>
                      {cartItems.reduce((a, c) => a + c.qty, 0)}
                    </Badge>
                  )}
                </Nav.Link>
              </LinkContainer>
              {userInfo ? (
                <>
                  <NavDropdown title={userInfo.name} id='username'>
                    <LinkContainer to='/orders'>
                      <NavDropdown.Item>Orders</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to='/profile'>
                      <NavDropdown.Item>Profile</NavDropdown.Item>
                    </LinkContainer>
                    <NavDropdown.Item onClick={logoutHandler}>
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <LinkContainer to='/login'>
                  <Nav.Link>
                    <FaUser /> Sign In
                  </Nav.Link>
                </LinkContainer>
              )}

              {userInfo && userInfo.role === 'admin' && (
                <NavDropdown title='Admin' id='adminmenu'>
                  <LinkContainer to='/admin/productlist'>
                    <NavDropdown.Item>Products</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/admin/orderlist'>
                    <NavDropdown.Item>Orders</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/admin/userlist'>
                    <NavDropdown.Item>Users</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/admin/restaurant'>
                    <NavDropdown.Item>Restaurants</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/admineverywhereservice'>
                    <NavDropdown.Item>EveryWhere</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}

              {userInfo && userInfo.role === 'restaurant' && (
                <NavDropdown title='Store' id='storemenu'>
                  <LinkContainer to='/restaurantchat'>
                    <NavDropdown.Item>Chat Orders</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/restaurant/restaurantorderlist'>
                    <NavDropdown.Item>Online Orders</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/restaurant/restaurantproductlist'>
                    <NavDropdown.Item>Products</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}

              {userInfo && userInfo.role === 'driver' && (
                <LinkContainer to='/driver/driverorderlist'>
                  <Nav.Link>Orders</Nav.Link>
                </LinkContainer>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <style jsx>{`
        .navbar-custom {
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 1000;
          background: rgba(0, 0, 0, 0.8);
          transition: opacity 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
        }

        .navbar-custom.scrolled {
          opacity: 0.9;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          padding: 6px 0;
        }
      `}</style>
    </header>
  );
};

export default Header;
