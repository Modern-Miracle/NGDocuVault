
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './Button';
import { User, LogOut, Settings, Shield } from 'lucide-react';

export interface UserProfileProps {
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  className?: string;
}

export function UserProfile({
  onProfileClick,
  onSettingsClick,
  className,
}: UserProfileProps) {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return null;
  }

  const displayAddress = `${user.address.slice(0, 6)}...${user.address.slice(-4)}`;
  const initials = user.address.slice(2, 4).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative h-10 w-10 rounded-full p-0 ${className}`}
      >
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-medium">{initials}</span>
        </div>
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium">Account</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {displayAddress}
              </p>
            </div>
            
            {user.did && (
              <div className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400 flex items-center">
                <Shield className="mr-2 h-3 w-3" />
                DID Active
              </div>
            )}
            
            {user.role && (
              <div className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400 flex items-center">
                <User className="mr-2 h-3 w-3" />
                Role: {user.role}
              </div>
            )}
            
            <div className="border-t border-gray-200 dark:border-gray-700">
              {onProfileClick && (
                <button
                  onClick={() => {
                    onProfileClick();
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </button>
              )}
              
              {onSettingsClick && (
                <button
                  onClick={() => {
                    onSettingsClick();
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </button>
              )}
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  signOut();
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}