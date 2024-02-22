import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

function RestaurantRoute() {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo && (userInfo.role === "restaurant") ? (
    <Outlet />
  ) : (
     <Navigate to='/login' replace />
  );
}
export default RestaurantRoute;
