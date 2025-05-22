import { createContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPermissionData } from '../redux/actions/commonAction';

export const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { permissionData, punchData, smtpData, locationMaster, loadingPermissions } = useSelector((state) => state.common);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token && (!permissionData || permissionData.length === 0)) {
      dispatch(fetchPermissionData(token));
    }
  }, [token, dispatch, permissionData]);

  return (
    <PermissionContext.Provider value={{ permissionData, punchData, smtpData, locationMaster, loadingPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
};