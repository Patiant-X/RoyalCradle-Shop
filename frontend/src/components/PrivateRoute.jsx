import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo ? <Outlet /> : <Navigate to='/login' replace />;
};
export const PremiumUserPrivateRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo &&
    (userInfo?.isPremiumCustomer || userInfo?.role === 'admin' || true) ? (
    <Outlet />
  ) : (
    <Navigate to='/' replace />
  );
};

export default PrivateRoute;
