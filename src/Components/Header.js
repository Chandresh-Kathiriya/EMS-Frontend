// src/Components/Header.js

// Import core module
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { toast } from 'react-toastify';

// Import Company's logo
import img_jiyantech from '../Images/jiyantech.logo.svg';
import img_small_jiyantech from '../Images/JiyanTech.png';

function Header({ toggleSidebar, isMobile }) {
  const userName = localStorage.getItem('userName')
  const userRole = localStorage.getItem('role')
  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userName');
      localStorage.removeItem('empCode');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('id');
      localStorage.removeItem('view');
      // Optionally, you can show a toast notification
      toast.success('You have been logged out successfully.');
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred while logging out.');
    }
  };
  return (
    <>
      <header className="header fixed-top d-flex align-items-center">
        {isMobile && (
          <div className="mobile-only">
            <i className="fas fa-bars toggle-sidebar-btn" onClick={toggleSidebar} style={{ color: '#274295' }}></i>
          </div>
        )}
        <div className="d-flex align-items-center justify-content-center">
          <Link to="/" className="logo d-flex align-items-center justify-content-left mx-2 my-0">
            <img src={img_jiyantech} alt="Logo" />
          </Link>
        </div>
        <nav className="header-nav ms-auto">
          <ul className="d-flex align-items-center">

            {/* <li className="nav-item dropdown">
              <Link className="nav-link nav-icon" to="#" >
                <i className="fa-regular fa-bell"></i>
                <span className="badge bg-secondary badge-number">0</span>
              </Link>
              <ul className="dropdown-menu dropdown-menu-end">
              </ul>
            </li> */}
            <li className="nav-item dropdown px-4">
              <Link className="nav-link nav-profile d-flex align-items-center pe-0" to="#" data-bs-toggle="dropdown" style={{ borderRadius: '20px', border: '1px solid' }}>
                <img src={img_small_jiyantech} alt="Profile" className="rounded-circle" />
                <span className="d-none d-md-block dropdown-toggle px-2">{userName}</span>
              </Link>

              <ul
                className="dropdown-menu dropdown-menu-end profile p-0"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                <li className="dropdown-header p-0 pt-3" style={{
                  marginBottom: '8px'
                }}>
                  <h6 style={{
                    color: '#27479A',
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}>
                    {userName}
                  </h6>
                  <span style={{
                    color: '#7f8c8d',
                    fontSize: '0.85rem',
                  }}>
                    {userRole}
                  </span>
                </li>

                <hr className="dropdown-divider m-0" style={{ borderColor: '#eaeaea' }} />

                <li>
                  <Link
                    className="dropdown-item d-flex align-items-center py-2 px-3"
                    to="/profile"
                    style={{
                      color: '#2c3e50',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f2f2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <i
                      className="fas fa-user-gear me-3"
                      style={{ width: '20px', color: '#7f8c8d' }}
                    ></i>
                    <span>My Profile</span>
                  </Link>
                </li>

                <hr className="dropdown-divider m-0" style={{ borderColor: '#eaeaea' }} />

                <li>
                  <Link
                    className="dropdown-item d-flex align-items-center py-2 px-3"
                    onClick={handleLogout}
                    style={{
                      color: '#e74c3c',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fdf2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <i
                      className="fas fa-arrow-right-from-bracket me-3"
                      style={{ width: '20px' }}
                    ></i>
                    <span>Logout</span>
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}

export default Header;