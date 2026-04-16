import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ruler, LogOut, History, LayoutDashboard, User } from 'lucide-react';
import { authService } from '../api/apiService';
import { jwtDecode } from 'jwt-decode';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  let username = '';

  if (token) {
    try {
      const decoded = jwtDecode(token);
      username = decoded.sub;
    } catch (err) {
      console.error("Invalid token");
    }
  }

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 px-4 py-2.5 fixed w-full z-50">
      <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
        <Link to="/" className="flex items-center">
          <Ruler className="mr-3 h-8 w-8 text-primary-600" />
          <span className="self-center text-xl font-semibold whitespace-nowrap text-slate-900">
            Quantity Measurement
          </span>
        </Link>
        <div className="flex items-center lg:order-2">
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="text-slate-700 hover:text-primary-600 font-medium text-sm flex items-center"
            >
              <LayoutDashboard className="w-4 h-4 mr-1" />
              Dashboard
            </Link>
            {token ? (
              <>
                <div className="hidden md:flex items-center text-slate-500 text-sm font-medium border-r border-slate-200 pr-4">
                  <User className="w-4 h-4 mr-2" />
                  Hi, {username}
                </div>
                <Link
                  to="/history"
                  className="text-slate-700 hover:text-primary-600 font-medium text-sm flex items-center"
                >
                  <History className="w-4 h-4 mr-1" />
                  History
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-800 hover:bg-slate-50 focus:ring-4 focus:ring-slate-300 font-medium rounded-lg text-sm px-4 py-2"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
