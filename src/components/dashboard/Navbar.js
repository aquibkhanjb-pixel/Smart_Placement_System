'use client';

import { useAuth } from '../../lib/auth/context.js';
import { Button } from '../ui/index.js';
import { USER_ROLES } from '../../types/index.js';

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 w-full">
          {/* Left Side Content */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              {/* Logo/Icon */}
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">🎓</span>
              </div>

              <div>
                <h1 className="text-xl font-bold text-white">
                  Smart Placement System
                </h1>
                <p className="text-blue-100 text-xs">
                  Campus Recruitment Management
                </p>
              </div>
            </div>

            {user && (
              <div className="flex items-center">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  user.role === USER_ROLES.COORDINATOR
                    ? 'bg-yellow-400 text-yellow-900'
                    : 'bg-green-400 text-green-900'
                }`}>
                  {user.role === USER_ROLES.COORDINATOR ? '👨‍💼 Coordinator' : '👨‍🎓 Student'}
                </span>
              </div>
            )}
          </div>

          {/* Right Side Content */}
          <div className="flex items-center space-x-4 ml-auto">
            {user && (
              <>
                <div className="hidden md:block text-right">
                  <div className="text-sm font-medium text-white">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-blue-200">
                    {user.email}
                  </div>
                </div>

                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="bg-white text-blue-600 border-white hover:bg-blue-50 hover:text-blue-700"
                >
                  <span className="hidden sm:inline">Logout</span>
                  <span className="sm:hidden">🚪</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;