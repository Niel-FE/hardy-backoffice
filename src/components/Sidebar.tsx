'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  UsersIcon,
  BriefcaseIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

interface MenuItem {
  name: string;
  href: string;
  icon: any;
  children?: { name: string; href: string }[];
}

const menuItems: MenuItem[] = [
  {
    name: '공지사항',
    href: '/notices',
    icon: BellIcon,
    children: [
      { name: '공지사항 목록', href: '/notices' },
    ],
  },
  {
    name: '교육 관리',
    href: '/education',
    icon: AcademicCapIcon,
    children: [
      { name: 'VOD 세트 관리', href: '/education/vod-sets' },
      { name: 'KPI 관리', href: '/education/kpi' },
      { name: '과제 관리', href: '/education/assignment' },
      { name: '출석 관리', href: '/education/attendance' },
    ],
  },
  {
    name: '교육생/팀 관리',
    href: '/students',
    icon: UserGroupIcon,
    children: [
      { name: '교육생 관리', href: '/students/list' },
      { name: '팀 관리', href: '/students/teams' },
    ],
  },
  {
    name: '코치 관리',
    href: '/coaches',
    icon: UsersIcon,
    children: [
      { name: '코치 목록', href: '/coaches/list' },
    ],
  },
  {
    name: '프로그램 관리',
    href: '/programs',
    icon: BriefcaseIcon,
    children: [
      { name: '프로그램 목록', href: '/programs/planning' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-primary-400">UD Final Backoffice</h1>
        <p className="text-xs text-gray-400 mt-1">관리자 시스템</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>

            {/* Sub-menu */}
            {item.children && (
              <div className="ml-4 border-l border-gray-700">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`flex items-center px-6 py-2 text-sm transition-colors ${
                      pathname === child.href
                        ? 'bg-gray-800 text-primary-400 border-l-2 border-primary-400'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-gray-700">
        <p className="text-xs text-gray-500">v1.0.0 - 2025</p>
      </div>
    </aside>
  );
}
