import { Link, useLocation } from 'react-router-dom';
import { ReactNode, useState } from 'react';

interface NavItemProps {
  to: string;
  isActive: boolean;
  icon: ReactNode;
  label: string;
  children?: {
    label: string;
    to: string;
    children?: {
      label: string;
      to: string;
    }[];
  }[];
}

const SubMenuItem = ({ item, index }: { item: { label: string; to: string; children?: { label: string; to: string; }[] }, index: number }) => {
  const [isSubOpen, setIsSubOpen] = useState(false);
  const location = useLocation();

  if (item.children) {
    return (
      <div key={index}>
        <button
          onClick={() => setIsSubOpen(!isSubOpen)}
          className={`w-full text-left px-3 ml-2 border border-blue-600 border-dashed py-2 text-sm rounded-lg flex items-center justify-between ${
            location.pathname.includes(item.to)
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {item.label}
          <svg
            className={`w-3 h-3 transform transition-transform duration-200 ${isSubOpen ? 'rotate-90' : ''}`}
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
        </button>
        <div 
          className={`transform transition-all duration-200 ease-in-out origin-top ${
            isSubOpen 
              ? 'h-auto opacity-100 scale-y-100' 
              : 'h-0 opacity-0 scale-y-0'
          }`}
        >
          <div className="ml-4 mt-2 space-y-2">
            {item.children.map((subItem, subIndex) => (
              <Link
                key={subIndex}
                to={subItem.to}
                className={`block px-3 py-2 text-xs rounded-lg ${
                  location.pathname === subItem.to
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {subItem.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      key={index}
      to={item.to}
      className={`block px-3 ml-2 border border-blue-600 border-dashed py-2 text-sm rounded-lg ${
        location.pathname === item.to
          ? 'text-blue-600 bg-blue-50'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {item.label}
    </Link>
  );
};

const NavItem = ({ to, isActive, icon, label, children }: NavItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const isButtonActive = isActive || isOpen;
  
  const commonClasses = `w-full flex items-center px-6 py-2 rounded-2xl  cursor-pointer ${
    isButtonActive
      ? 'bg-blue-900 text-white'
      : 'text-gray-700 hover:bg-gray-50'
  }`;

  return (
    <div className='p-2'>
      {children ? (
        <>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={commonClasses}
          >
            {icon}
            <span className="ml-4 text-base font-medium">{label}</span>
            <svg
              className={`w-4 h-4 ml-auto transform transition-transform duration-200 ${isButtonActive ? 'text-white' : 'text-gray-600'} ${isOpen ? 'rotate-90' : ''}`}
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
          </button>
          
          <div 
            className={`transform transition-all duration-200 ease-in-out origin-top cursor-pointer ${
              isOpen 
                ? 'h-auto opacity-100 scale-y-100' 
                : 'h-0 opacity-0 scale-y-0'
            }`}
          >
            <div className="ml-8 mt-2 space-y-2 border-l-2 border-blue-600 pr-2">
              {children.map((item, index) => (
                <SubMenuItem key={index} item={item} index={index} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <Link
          to={to}
          className={commonClasses}
        >
          {icon}
          <span className="ml-4 text-base font-medium">{label}</span>
          <svg
            className={`w-4 h-4 ml-auto ${isActive ? 'text-white' : 'text-gray-600'}`}
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
      )}
    </div>
  );
};

export default NavItem; 