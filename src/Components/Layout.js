import React, { useContext, useState, useEffect } from 'react';
import { PermissionContext } from '../Context/PermissionContext';

import Header from './Header';
import Sidebar from './Sidebar';
import Punch from './Punch';
import TimeTracker from './TimeTracker';

const Layout = ({ children }) => {
  const { permissionData } = useContext(PermissionContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openSubNav, setOpenSubNav] = useState("");

  const toggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  // Watch for screen resize
  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);

      // Always show sidebar on desktop
      if (!isMobileView) {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {permissionData?.attendance?.canAddAttendance &&
        <Punch />
      }
      <TimeTracker />
      <div className="main-wrapper">
        <Header toggleSidebar={toggleSidebar} isMobile={isMobile} />
        <div className="sidebar-container">
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            openSubNav={openSubNav}
            setOpenSubNav={setOpenSubNav} // This is crucial
          />
        </div>
        <main
          id="main"
          className="main"
          style={{
            marginLeft: isMobile ? '0px' : `${isSidebarOpen ? (openSubNav ? 320 : 120) : 0}px`,
            marginTop: isMobile ? '70px' : ''
          }}
        >
          <div className='card'>
            <div className="card-body p-2 p-md-4">
              {children}

            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Layout;