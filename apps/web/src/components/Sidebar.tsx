import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  FileText,
  CheckSquare,
  Share2,
  Users,
  User,
  FileSignature,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useDidSiwe } from '@/hooks/use-did-siwe';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/utils/cn';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from './ui/button';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  description?: string;
  show?: boolean;
  badge?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { isAdmin, isIssuer, isVerifier } = useDidSiwe();
  const { signOut } = useAuth();

  // Desktop collapse state (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Hover state for auto-expand when collapsed
  const [isHovered, setIsHovered] = useState(false);

  const userRole = {
    isAdmin: !!isAdmin,
    isIssuer: !!isIssuer,
    isVerifier: !!isVerifier,
  };

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      description: 'Overview and analytics',
    },
    {
      name: 'My Documents',
      href: '/documents',
      icon: FileText,
      description: 'Manage your documents',
    },
    {
      name: 'Register Document',
      href: '/register-document',
      icon: FileSignature,
      description: 'Upload new documents',
      show: userRole.isIssuer,
    },
    {
      name: 'Verify Documents',
      href: '/verify-document',
      icon: CheckSquare,
      description: 'Verify document authenticity',
      show: userRole.isVerifier,
    },
    {
      name: 'Shared With Me',
      href: '/shared',
      icon: Share2,
      description: 'Documents shared with you',
    },
    {
      name: 'User Management',
      href: '/users-management',
      icon: Users,
      description: 'Manage users and roles',
      show: userRole.isAdmin,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      description: 'Your account settings',
    },
  ];

  const filteredNavItems = navItems.filter((item) => item.show === undefined || item.show === true);

  // Auto-expand on hover when collapsed (desktop only)
  const shouldExpand = isCollapsed && isHovered && window.innerWidth >= 1024;

  // Toggle collapse state
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
  };

  // Reset hover state when mobile menu closes
  useEffect(() => {
    if (!isOpen && window.innerWidth < 1024) {
      setIsHovered(false);
    }
  }, [isOpen]);

  return (
    <TooltipProvider>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950',
          'border-r border-slate-200 dark:border-slate-800 shadow-xl',
          'transition-all duration-300 ease-in-out',
          isCollapsed && !shouldExpand ? 'w-20' : 'w-72',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col h-full">
          {/* Header with Logo and Collapse Button */}
          <div className="relative flex items-center h-20 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div
              className={cn(
                'flex items-center transition-all duration-300',
                isCollapsed && !shouldExpand ? 'justify-center w-full' : 'flex-1'
              )}
            >
              <div className="relative">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-indigo-600 shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>

              {(!isCollapsed || shouldExpand) && (
                <div className="ml-3 flex flex-col">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-indigo-600 dark:from-primary/80 dark:to-indigo-400 bg-clip-text text-transparent">
                    DocuVault
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Secure Document Manager</p>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle Button */}
            <button
              className={cn(
                'hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2',
                'w-8 h-8 items-center justify-center rounded-full',
                'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
                'shadow-md hover:shadow-lg transition-all duration-200',
                'hover:bg-slate-50 dark:hover:bg-slate-700',
                isCollapsed && !shouldExpand && 'right-1/2 translate-x-1/2'
              )}
              onClick={toggleCollapse}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              )}
            </button>

            {/* Mobile Close Button */}
            <Button
              className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => {
              const navContent = (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
                      isCollapsed && !shouldExpand ? 'px-3 py-3 justify-center' : 'px-4 py-3'
                    )
                  }
                  onClick={() => setIsOpen(false)}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={cn(
                          'flex-shrink-0 w-5 h-5 transition-transform duration-200',
                          !isActive && 'group-hover:scale-110',
                          (!isCollapsed || shouldExpand) && 'mr-3'
                        )}
                      />

                      {(!isCollapsed || shouldExpand) && (
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          {!isActive && item.description && (
                            <p className="text-xs opacity-75 truncate mt-0.5">{item.description}</p>
                          )}
                        </div>
                      )}

                      {item.badge && (!isCollapsed || shouldExpand) && (
                        <span
                          className={cn(
                            'ml-auto px-2 py-0.5 text-xs font-medium rounded-full',
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Active indicator for collapsed state */}
                      {isActive && isCollapsed && !shouldExpand && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                      )}
                    </>
                  )}
                </NavLink>
              );

              // Wrap in tooltip when collapsed
              if (isCollapsed && !shouldExpand) {
                return (
                  <Tooltip key={item.name} delayDuration={0}>
                    <TooltipTrigger asChild>{navContent}</TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                      <p className="font-medium">{item.name}</p>
                      {item.description && <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return navContent;
            })}
          </nav>

          {/* Footer with Logout */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
            {!isCollapsed || shouldExpand ? (
              <button
                onClick={async () => {
                  await signOut();
                }}
                className={cn(
                  'flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl',
                  'text-slate-700 dark:text-slate-300',
                  'hover:bg-red-50 dark:hover:bg-red-950/30',
                  'hover:text-red-600 dark:hover:text-red-400',
                  'transition-all duration-200'
                )}
              >
                <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>Disconnect Wallet</span>
              </button>
            ) : (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      await signOut();
                    }}
                    className={cn(
                      'flex items-center justify-center w-full py-3 rounded-xl',
                      'text-slate-700 dark:text-slate-300',
                      'hover:bg-red-50 dark:hover:bg-red-950/30',
                      'hover:text-red-600 dark:hover:text-red-400',
                      'transition-all duration-200'
                    )}
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Disconnect Wallet</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;
