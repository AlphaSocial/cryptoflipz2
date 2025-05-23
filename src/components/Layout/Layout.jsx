import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Coins, User, Plus } from 'lucide-react';

const Layout = ({ children }) => {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Coins className="h-8 w-8 text-purple-500" />
              <span className="text-xl font-bold">Crypto Flipz</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              {connected && (
                <>
                  <Link
                    to="/create"
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Flip</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </>
              )}
              <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-400 text-sm">
            © 2024 Crypto Flipz. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 