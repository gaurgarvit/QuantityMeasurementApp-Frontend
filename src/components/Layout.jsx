import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-20 px-4 pb-12 max-w-screen-xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
