import { Link, useRouterState } from '@tanstack/react-router';
import { useEffect } from "react";

const NotFound = () => {
  const location = useRouterState({ select: (state) => state.location });

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600 text-white">
      <div className="text-center bg-white/20 backdrop-blur-sm p-10 rounded-xl shadow-2xl border border-white/30">
        <h1 className="text-6xl font-extrabold mb-4 text-red-400">404</h1>
        <p className="text-2xl text-white mb-6">Oops! Page not found</p>
        <Link to="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;