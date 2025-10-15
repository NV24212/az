import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* <Sidebar /> */}
      <div className="flex flex-col flex-1 w-full">
        {/* <Header /> */}
        <main className="h-full overflow-y-auto">
          <div className="container grid px-6 mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
