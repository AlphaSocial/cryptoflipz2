import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { formatAddress } from '../../utils/helpers';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { publicKey, connected } = useWallet();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/create', label: 'Create Flip' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-background/90 backdrop-blur-lg border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Crypto Flipz
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-white/80 hover:text-white hover:bg-card'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Wallet Section */}
          <div className="hidden md:flex items-center space-x-4">
            {connected && publicKey && (
              <div className="text-sm">
                <div className="text-white/60">Connected</div>
                <div className="font-mono text-secondary">
                  {formatAddress(publicKey.toString())}
                </div>
              </div>
            )}
            <div className="wallet-button-container">
              <WalletMultiButton />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-card rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border">
            <nav className="flex flex-col space-y-3 mt-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-primary text-white'
                      : 'text-white/80 hover:text-white hover:bg-card'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            
            {/* Mobile Wallet */}
            <div className="mt-6 pt-4 border-t border-border">
              {connected && publicKey && (
                <div className="mb-4 text-sm">
                  <div className="text-white/60">Connected</div>
                  <div className="font-mono text-secondary">
                    {formatAddress(publicKey.toString())}
                  </div>
                </div>
              )}
              <div className="wallet-button-container">
                <WalletMultiButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 