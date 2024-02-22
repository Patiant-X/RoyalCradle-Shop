import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const DriverRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo && (userInfo.role === 'driver') ? (
    <Outlet />
  ) : (
    <Navigate to='/login' replace />
  );
};
export default DriverRoute;
