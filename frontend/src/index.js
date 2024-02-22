import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/styles/bootstrap.custom.css';
import './assets/styles/index.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ShippingScreen from './screens/ShippingScreen';
import PaymentScreen from './screens/PaymentScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import ProfileScreen from './screens/ProfileScreen';
import OrderListScreen from './screens/admin/OrderListScreen';
import ProductListScreen from './screens/admin/ProductListScreen';
import ProductEditScreen from './screens/admin/ProductEditScreen';
import UserListScreen from './screens/admin/UserListScreen';
import UserEditScreen from './screens/admin/UserEditScreen';
import store from './store';
import { Provider } from 'react-redux';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPassword';
import DriverRoute from './components/DriverRoute';
import RestaurantRoute from './components/RestaurantRoute';
import DriverOrderListScreen from './screens/driver/DriverOrderListScreen';
import RestaurantOrderListScreen from './screens/restaurant/RestaurantOrderListScreen';
import RestaurantProductListScreen from './screens/restaurant/RestaurantProductListScreen';
import RestaurantProductEditScreen from './screens/restaurant/RestaurantProductEditScreen';
import OrdersScreen from './screens/Orders';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      {/* Public Routes */}
      <Route index={true} path='/' element={<HomeScreen />} />
      <Route path='/search/:keyword' element={<HomeScreen />} />
      <Route path='/page/:pageNumber' element={<HomeScreen />} />
      <Route
        path='/search/:keyword/page/:pageNumber'
        element={<HomeScreen />}
      />
      <Route path='/product/:id' element={<ProductScreen />} />
      <Route path='/cart' element={<CartScreen />} />
      <Route path='/forgot-password' element={<ForgotPasswordScreen />} />
      <Route path='/login' element={<LoginScreen />} />
      <Route path='/register' element={<RegisterScreen />} />
      <Route
        path='/reset-password/:id/:token'
        element={<ResetPasswordScreen />}
      />

      {/* Registered users */}
      <Route path='' element={<PrivateRoute />}>
        <Route path='/shipping' element={<ShippingScreen />} />
        <Route path='/payment' element={<PaymentScreen />} />
        <Route path='/placeorder' element={<PlaceOrderScreen />} />
        <Route path='/order/:id' element={<OrderScreen />} />
        <Route path='/profile' element={<ProfileScreen />} />
        <Route path='/orders' element={<OrdersScreen />} />
      </Route>

      {/* Admin users */}
      <Route path='' element={<AdminRoute />}>
        <Route path='/admin/orderlist' element={<OrderListScreen />} />
        <Route path='/admin/productlist' element={<ProductListScreen />} />
        <Route
          path='/admin/productlist/:pageNumber'
          element={<ProductListScreen />}
        />
        <Route path='/admin/userlist' element={<UserListScreen />} />
        <Route path='/admin/product/:id/edit' element={<ProductEditScreen />} />
        <Route path='/admin/user/:id/edit' element={<UserEditScreen />} />
      </Route>

      {/*restaurant user */}
      <Route path='' element={<RestaurantRoute />}>
        <Route
          path='/restaurant/restaurantorderlist'
          element={<RestaurantOrderListScreen />}
        />
        <Route
          path='/restaurant/restaurantproductlist'
          element={<RestaurantProductListScreen />}
        />
        <Route
          path='/restaurant/restaurantproductlist/:pageNumber'
          element={<RestaurantProductListScreen />}
        />
        <Route
          path='/restaurant/restaurantproduct/:id/edit'
          element={<RestaurantProductEditScreen />}
        />
      </Route>

      {/*Driver user */}
      <Route path='' element={<DriverRoute />}>
        <Route
          path='/driver/driverorderlist'
          element={<DriverOrderListScreen />}
        />
      </Route>
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </HelmetProvider>
  </React.StrictMode>
);

reportWebVitals();
