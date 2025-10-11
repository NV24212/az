import React from 'react';
import { Outlet } from 'react-router-dom';

const StudentLayout = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold">Student Dashboard</h1>
      <Outlet />
    </div>
  );
};

export default StudentLayout;
