import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', animated = true }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const LogoSVG = (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClasses[size]} ${className}`}
    >
      {/* Background gradient circle */}
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        
        <linearGradient id="docGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E0E7FF" />
        </linearGradient>
        
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Main background circle */}
      <circle
        cx="50"
        cy="50"
        r="48"
        fill="url(#bgGradient)"
        filter="url(#glow)"
      />

      {/* Blockchain network pattern (subtle background) */}
      <g opacity="0.2">
        <circle cx="25" cy="25" r="2" fill="white" />
        <circle cx="75" cy="25" r="2" fill="white" />
        <circle cx="25" cy="75" r="2" fill="white" />
        <circle cx="75" cy="75" r="2" fill="white" />
        <line x1="25" y1="25" x2="75" y2="25" stroke="white" strokeWidth="1" opacity="0.5" />
        <line x1="75" y1="25" x2="75" y2="75" stroke="white" strokeWidth="1" opacity="0.5" />
        <line x1="75" y1="75" x2="25" y2="75" stroke="white" strokeWidth="1" opacity="0.5" />
        <line x1="25" y1="75" x2="25" y2="25" stroke="white" strokeWidth="1" opacity="0.5" />
      </g>

      {/* Document icon */}
      <rect
        x="30"
        y="25"
        width="25"
        height="32"
        rx="3"
        fill="url(#docGradient)"
        stroke="#E5E7EB"
        strokeWidth="1"
      />
      
      {/* Document fold corner */}
      <path
        d="M 47 25 L 55 25 L 55 33 Z"
        fill="#D1D5DB"
      />
      
      {/* Document lines */}
      <line x1="34" y1="35" x2="47" y2="35" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="34" y1="40" x2="51" y2="40" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="34" y1="45" x2="48" y2="45" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="34" y1="50" x2="51" y2="50" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />

      {/* Shield overlay (security element) */}
      <path
        d="M 50 35 
           C 48 35, 45 37, 45 40
           C 45 45, 48 50, 50 52
           C 52 50, 55 45, 55 40
           C 55 37, 52 35, 50 35 Z"
        fill="url(#shieldGradient)"
        opacity="0.9"
      />
      
      {/* Shield checkmark */}
      <path
        d="M 47.5 42 L 49.5 44 L 52.5 40"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Vault lock element */}
      <circle
        cx="42"
        cy="62"
        r="8"
        fill="rgba(59, 130, 246, 0.8)"
        stroke="white"
        strokeWidth="2"
      />
      
      {/* Lock keyhole */}
      <circle
        cx="42"
        cy="60"
        r="2"
        fill="white"
      />
      <rect
        x="41"
        y="60"
        width="2"
        height="4"
        fill="white"
        rx="1"
      />

      {/* Blockchain dots pattern */}
      <g opacity="0.7">
        <circle cx="65" cy="40" r="2.5" fill="white" />
        <circle cx="72" cy="50" r="2.5" fill="white" />
        <circle cx="65" cy="60" r="2.5" fill="white" />
        <line x1="65" y1="40" x2="72" y2="50" stroke="white" strokeWidth="1.5" opacity="0.6" />
        <line x1="72" y1="50" x2="65" y2="60" stroke="white" strokeWidth="1.5" opacity="0.6" />
      </g>
    </svg>
  );

  if (!animated) {
    return LogoSVG;
  }

  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {LogoSVG}
    </motion.div>
  );
};

export default Logo;