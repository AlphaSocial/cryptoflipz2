import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Github, Discord } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: <Twitter className="w-5 h-5" />,
      href: 'https://twitter.com/cryptoflipz',
      label: 'Twitter'
    },
    {
      icon: <Discord className="w-5 h-5" />,
      href: 'https://discord.gg/cryptoflipz',
      label: 'Discord'
    },
    {
      icon: <Github className="w-5 h-5" />,
      href: 'https://github.com/cryptoflipz',
      label: 'GitHub'
    }
  ];

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/create', label: 'Create Flip' },
    { path: '/about', label: 'About' },
    { path: '/faq', label: 'FAQ' }
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-block">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Crypto Flipz
              </h2>
            </Link>
            <p className="mt-4 text-white/60 max-w-md">
              The ultimate NFT flipping game on Solana. Challenge your friends, win NFTs, and become the ultimate flipper!
            </p>
            <div className="mt-6 flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Navigation</h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://docs.cryptoflipz.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://status.cryptoflipz.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Status
                </a>
              </li>
              <li>
                <a
                  href="https://support.cryptoflipz.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-center text-white/40 text-sm">
            © {currentYear} Crypto Flipz. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 