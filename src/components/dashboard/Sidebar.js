'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth/context.js';
import { USER_ROLES } from '../../types/index.js';
import clsx from 'clsx';

const Sidebar = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  const studentNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Profile', href: '/dashboard/profile', icon: '👤' },
    { name: 'Resumes', href: '/dashboard/resumes', icon: '📄' },
    { name: 'Companies', href: '/dashboard/companies', icon: '🏢' },
    { name: 'Applications', href: '/dashboard/applications', icon: '📝' },
    { name: 'Eligibility Check', href: '/dashboard/eligibility', icon: '✅' },
  ];

  const coordinatorNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Students', href: '/dashboard/students', icon: '👥' },
    { name: 'Demerit Management', href: '/dashboard/students/demerits', icon: '⚠️' },
    { name: 'Companies', href: '/dashboard/companies', icon: '🏢' },
    { name: 'Applications', href: '/dashboard/applications', icon: '📝' },
    { name: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
    { name: 'Notifications', href: '/dashboard/notifications', icon: '📧' },
    { name: 'Add Coordinator', href: '/dashboard/coordinators/add', icon: '👨‍💼' },
  ];

  const navItems = user?.role === USER_ROLES.COORDINATOR ? coordinatorNavItems : studentNavItems;

  return (
    <div className="bg-gray-50 border-r border-gray-200 w-64 min-h-screen">
      <div className="p-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  {
                    'bg-blue-100 text-blue-700': isActive,
                    'text-gray-700 hover:bg-gray-100 hover:text-gray-900': !isActive,
                  }
                )}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;