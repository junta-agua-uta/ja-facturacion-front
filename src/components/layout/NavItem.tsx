import { Link } from 'react-router-dom';
import { ReactNode } from 'react';

interface NavItemProps {
  to: string;
  isActive: boolean;
  icon: ReactNode;
  label: string;
}

const NavItem = ({ to, isActive, icon, label }: NavItemProps) => {
  return (
    <div className='p-2'>
      <Link
        to={to}
        className={`flex items-center px-6 py-2 rounded-2xl ${
          isActive
            ? 'bg-blue-900 text-white'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        {icon}
        <span className="ml-4 text-base font-medium">{label}</span>
        <svg
          className={`w-4 h-4 ml-auto ${isActive ? 'text-white' : 'text-gray-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>
    </div>
  );
};

export default NavItem; 