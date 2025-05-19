'use client';

import Link from 'next/link';
import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-gray-800 backdrop-blur-sm z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link 
            href="/" 
            className="text-xl font-semibold text-white-900"
          >
            Co-Op Compass
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/about"
              className="text-white-600 hover:text-blue-600 transition-colors"
            >
              About
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4">
            <Link 
              href="/about"
              className="block py-2 text-gray-600 hover:text-blue-600"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <div className="py-2">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}