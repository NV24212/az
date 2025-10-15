const Sidebar = () => {
  return (
    <aside className="z-20 hidden w-64 overflow-y-auto bg-white dark:bg-gray-800 md:block flex-shrink-0">
      <div className="py-4 text-gray-500 dark:text-gray-400">
        <a className="ml-6 text-lg font-bold text-gray-800 dark:text-gray-200" href="#">
          AzharStore
        </a>
        <ul className="mt-6">
          <li className="relative px-6 py-3">
            <a
              className="inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
              href="/admin"
            >
              <span className="ml-4">Dashboard</span>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
