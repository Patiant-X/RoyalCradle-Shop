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
import PrivateRoute, {
  PremiumUserPrivateRoute,
} from './components/PrivateRoute';
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
import OrdersScreen from './screens/Orders';
import PrivacyPolicy from './screens/Legal/PrivacyPolicy';
import TermsAndConditions from './screens/Legal/TermsAndConditions';
import Error from './screens/Error';
import { SocketContextProvider } from './context/SocketContext';
import RestaurantProductsListScreen from './screens/RestaurantProductsListScreen';
import RestaurantProductEditScreen from './screens/restaurant/RestaurantProductEditScreen';
import CreateRestaurantScreen from './screens/admin/RestaurantEditScreen';
import RestaurantListScreen from './screens/admin/RestaurantListScreen';
import RestaurantItemsListScreen from './screens/admin/RestaurantItemsListScreen';
import RestaurantItemEditScreen from './screens/admin/RestaurantItemEditScreen';
import RestaurantOnboardingScreen from './screens/Legal/RestaurantOnboardingScreen';
import EveryWhereServiceScreen from './screens/premiumUser/EveryWhereServiceScreen';
import AdminEveryWhereService from './screens/admin/AdminEveryWhereService';
import RestaurantChatScreen from './screens/restaurant/RestaurantChatScreen';
import RoyalCradleBlogScreen from './screens/premiumUser/royalCradleBlog/RoyalCradleBlogScreen';
import AboutUsScreen from './screens/AboutUsScreen';

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
      <Route
        path='/search/:keyword/page/:pageNumber/restaurantProductList/:id/:restaurantId'
        element={<RestaurantProductsListScreen />}
      />
      <Route
        path='/page/:pageNumber/restaurantProductList/:id/:restaurantId'
        element={<RestaurantProductListScreen />}
      />
      <Route
        path='/search/:keyword/restaurantProductList/:id/:restaurantId'
        element={<RestaurantProductsListScreen />}
      />

      <Route
        path='/restaurantProductList/:id/:restaurantId'
        element={<RestaurantProductsListScreen />}
      />
      <Route path='/privacy-policy' element={<PrivacyPolicy />} />
      <Route path='/terms-and-conditions' element={<TermsAndConditions />} />
      <Route
        path='/restaurant-onboarding'
        element={<RestaurantOnboardingScreen />}
      />
      <Route path='/product/:id/:image/:restaurantId' element={<ProductScreen />} />
      <Route path='/cart' element={<CartScreen />} />
      <Route path='/forgot-password' element={<ForgotPasswordScreen />} />
      <Route path='/login' element={<LoginScreen />} />
      <Route path='/register' element={<RegisterScreen />} />
      <Route
        path='/reset-password/:id/:token'
        element={<ResetPasswordScreen />}
      />
      <Route
        path='/premium-member/royal-cradle/blog'
        element={<RoyalCradleBlogScreen />}
      />
      <Route
        path='/about-us'
        element={<AboutUsScreen />}
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

      {/* Premium Users */}
      <Route path='' element={<PremiumUserPrivateRoute />}>
        <Route path='/everywhere' element={<EveryWhereServiceScreen />} />
      </Route>

      {/* Admin users */}
      <Route path='' element={<AdminRoute />}>
      <Route path='/admineverywhereservice' element={<AdminEveryWhereService />} />
        <Route path='/admin/orderlist' element={<OrderListScreen />} />
        <Route path='/admin/productlist' element={<ProductListScreen />} />
        <Route
          path='/admin/productlist/:pageNumber'
          element={<ProductListScreen />}
        />
        <Route path='/admin/userlist' element={<UserListScreen />} />
        <Route path='/admin/product/:id/edit' element={<ProductEditScreen />} />
        <Route path='/admin/user/:id/edit' element={<UserEditScreen />} />
        <Route
          path='/admin/restaurant/:id/edit'
          element={<CreateRestaurantScreen />}
        />
        <Route path='/admin/restaurant' element={<RestaurantListScreen />} />
        <Route
          path='/admin/restaurantitemslist/:id'
          element={<RestaurantItemsListScreen />}
        />
        <Route
          path='/admin/restaurantitems/:id/edit'
          element={<RestaurantItemEditScreen />}
        />
      </Route>

      {/*restaurant user */}
      <Route path='' element={<RestaurantRoute />}>
        <Route
          path='/restaurant/restaurantorderlist'
          element={<RestaurantOrderListScreen />}
        />
        <Route
          path='/restaurantchat'
          element={<RestaurantChatScreen />}
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
      <Route path='/*' exact element={<Error />} />
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <SocketContextProvider>
          <RouterProvider router={router} />
        </SocketContextProvider>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>
);

reportWebVitals();
