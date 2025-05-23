import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { Zap, Shield, TrendingUp, Users } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import FlipList from '../components/Flip/FlipList';
import Button from '../components/UI/Button';

const Home = () => {
  const { connected } = useWallet();

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'NFT Flipping',
      description: 'Create and participate in NFT flips with other collectors on Solana.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure & Fair',
      description: 'Smart contract escrow ensures fair play and automatic payouts.'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Skill-Based',
      description: 'Timing and strategy matter. Perfect your flipping technique.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Community',
      description: 'Join a thriving community of NFT collectors and gamers.'
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-20">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Crypto Flipz
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto">
            The ultimate NFT flipping game on Solana. Create flips, compete with skill, 
            and win big in this revolutionary gaming experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/create">
              <Button size="lg" className="px-8">
                Create Flip
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8">
              How It Works
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center space-y-4 hover:border-primary/50 transition-colors">
              <div className="text-primary mx-auto">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-white/60">
                {feature.description}
              </p>
            </div>
          ))}
        </section>

        {/* How It Works */}
        <section className="text-center space-y-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create Your Flip',
                description: 'Select an NFT from your wallet, set the price, and choose 3 or 5 rounds.',
                icon: '🎨'
              },
              {
                step: '02',
                title: 'Player Joins',
                description: 'Another player sees your flip and decides to challenge you.',
                icon: '⚔️'
              },
              {
                step: '03',
                title: 'Flip & Win',
                description: 'Take turns flipping coins with skill-based timing. Best of 3 or 5 wins!',
                icon: '🏆'
              }
            ].map((item, index) => (
              <div key={index} className="space-y-4">
                <div className="text-6xl">{item.icon}</div>
                <div className="text-primary font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="text-2xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Active Flips */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Active Flips
            </h2>
            <p className="text-xl text-white/70">
              Join an existing flip or create your own
            </p>
          </div>
          
          <FlipList />
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-8 py-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Ready to Start Flipping?
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            {connected
              ? "You're connected! Create your first flip or join an existing one."
              : "Connect your Phantom wallet to start playing."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {connected ? (
              <Link to="/create">
                <Button size="lg" className="px-8">
                  Create Your First Flip
                </Button>
              </Link>
            ) : (
              <div className="space-y-4">
                <div className="text-white/60">Connect your wallet to get started</div>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home; 