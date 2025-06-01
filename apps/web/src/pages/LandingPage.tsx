import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Shield,
  Lock,
  Users,
  FileCheck,
  ChevronRight,
  ArrowRight,
  Menu,
  X,
  Database,
  Fingerprint,
  Sparkles,
  Star,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import FloatingShapes from '../components/ui/floating-shapes';
import Logo from '../components/ui/logo';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 100]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const features = [
    {
      icon: Lock,
      title: 'Decentralized Security',
      description: 'Built on blockchain technology ensuring immutable records and transparent verification processes.',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Users,
      title: 'Multi-Party Trust',
      description: 'Enable secure document sharing between issuers, holders, and verifiers with granular permissions.',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Database,
      title: 'IPFS Storage',
      description: 'Decentralized file storage ensuring your documents are always accessible and tamper-proof.',
      color: 'from-rose-500 to-pink-500',
    },
    {
      icon: Fingerprint,
      title: 'Digital Identity',
      description: 'Manage and verify digital identities with our comprehensive DID (Decentralized Identity) system.',
      color: 'from-violet-500 to-purple-500',
    },
    {
      icon: Shield,
      title: 'Document Verification',
      description: 'Verify document authenticity and integrity through cryptographic proofs and blockchain records.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FileCheck,
      title: 'Access Control',
      description: 'Grant and revoke document access with fine-grained permissions and audit trails.',
      color: 'from-amber-500 to-orange-500',
    },
  ];

  const stats = [
    { value: 'Beta', label: 'Phase' },
    { value: 'Sepolia', label: 'Testnet' },
    { value: 'Open', label: 'Source' },
    { value: 'Web3', label: 'Native' },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Modern background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(59,130,246,0.05),transparent_30%,rgba(139,92,246,0.05),transparent_60%,rgba(59,130,246,0.05))] pointer-events-none" />
      {/* Navigation */}
      <motion.nav
        className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-white/30 shadow-lg shadow-blue-500/5"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div className="flex items-center space-x-3" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Logo size="md" animated={true} />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                DocuVault
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium hover:scale-105"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium hover:scale-105"
              >
                How It Works
              </a>
              <Link to="/dashboard">
                <Button
                  variant="outline"
                  className="mr-2 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 backdrop-blur-sm font-medium"
                >
                  Dashboard
                </Button>
              </Link>
              <Link to="/auth/siwe">
                <Button className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 relative overflow-hidden group font-medium">
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  <Sparkles className="w-4 h-4 ml-1 relative z-10" />
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-white border-t"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-gray-700 hover:text-blue-600">
                Features
              </a>
              <a href="#how-it-works" className="block text-gray-700 hover:text-blue-600">
                How It Works
              </a>
              <div className="pt-4 space-y-2">
                <Link to="/dashboard" className="block">
                  <Button
                    variant="outline"
                    className="w-full border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 font-medium"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link to="/auth/siwe" className="block">
                  <Button className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-blue-500/25 relative overflow-hidden group font-medium">
                    <span className="relative z-10">Get Started</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-32 overflow-hidden">
        <FloatingShapes />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"
          style={{ y: y1, opacity }}
        />
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"
          style={{ y: y2 }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"
          style={{ y: y1 }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [360, 270, 180, 90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        {/* Premium Floating Elements */}
        <motion.div
          className="absolute top-32 right-1/4 w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-60 shadow-lg"
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            rotate: [0, 360],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-32 left-1/4 w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-40 shadow-lg"
          animate={{
            y: [20, -20, 20],
            x: [10, -10, 10],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-50 shadow-lg"
          animate={{
            scale: [1, 1.5, 1],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 hover:from-blue-200 hover:to-indigo-200 border border-blue-200/50 shadow-lg shadow-blue-500/10 backdrop-blur-sm px-4 py-2 text-sm font-medium">
                <Star className="w-4 h-4 mr-2 text-blue-600" />
                🚀 Now Live on Sepolia Testnet
              </Badge>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Secure Document
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent relative ml-8 md:ml-16 lg:ml-24">
                Sharing
                <motion.div
                  className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 1 }}
                />
              </span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Next-generation blockchain platform for
              <span className="font-medium text-gray-800"> secure document sharing </span>
              with privacy-preserving verification and decentralized storage.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Link to="/auth/siwe">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-12 py-7 text-xl group shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-500 relative overflow-hidden border-0 font-semibold"
                >
                  <span className="relative z-10">Manage Your Data</span>
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-purple-400/20"
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="px-12 py-7 text-xl border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 backdrop-blur-sm transition-all duration-300 font-semibold hover:shadow-lg hover:shadow-gray-500/10 group text-gray-700"
              >
                <span className="group-hover:text-blue-600 transition-colors">Watch Demo</span>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/70 backdrop-blur-xl relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center group"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-gray-500/10 border border-white/30 group-hover:shadow-xl group-hover:shadow-blue-500/10 transition-all duration-300">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium text-sm uppercase tracking-wider">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Modern Verification
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
              Built with cutting-edge technology to ensure
              <span className="font-medium text-gray-800">security, privacy, and trust</span>
              in document verification.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -15, scale: 1.02 }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-700 group border-0 bg-white/90 backdrop-blur-xl relative overflow-hidden shadow-lg shadow-gray-500/10">
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />

                  <CardContent className="p-8 relative z-10">
                    <div
                      className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-xl shadow-blue-500/20 relative overflow-hidden`}
                    >
                      <feature.icon className="w-7 h-7 text-white relative z-10" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm font-light group-hover:text-gray-700 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </CardContent>

                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                DocuVault
              </span>{' '}
              Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
              Get started with secure document sharing in
              <span className="font-medium text-gray-800">four simple steps</span>.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Connect Wallet',
                description: 'Connect your Web3 wallet and create your decentralized identity (DID) to get started.',
                icon: '💳',
              },
              {
                step: '02',
                title: 'Upload Documents',
                description: 'Securely upload documents to IPFS storage and register them on the blockchain.',
                icon: '📄',
              },
              {
                step: '03',
                title: 'Manage Access',
                description: 'Grant or revoke document access to specific parties with granular permissions.',
                icon: '🔐',
              },
              {
                step: '04',
                title: 'Track Activity',
                description: 'Monitor document access, verification requests, and sharing history in real-time.',
                icon: '📊',
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                whileHover={{ y: -5 }}
              >
                <Card className="text-center p-8 h-full bg-white/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />

                  <div className="relative z-10">
                    <div className="text-4xl mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                      {step.icon}
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
                      <span className="text-white font-bold text-lg">{step.step}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm font-light">{step.description}</p>
                  </div>

                  {/* Corner decoration */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Card>
                {index < 3 && (
                  <ChevronRight className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 w-6 h-6 text-blue-600 opacity-60" />
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Link to="/auth/siwe">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white py-7 px-16 text-lg group shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-500 relative overflow-hidden border-0 font-semibold"
              >
                <span className="relative z-10">Start Your Journey</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                <Sparkles className="absolute top-1 right-1 w-4 h-4 text-white/50 animate-pulse" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.05),transparent_70%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Try
              <span className="text-blue-100">DocuVault</span>?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
              Experience the future of document sharing on our testnet.
              <span className="text-white font-medium">Your feedback helps us build better</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/auth/siwe">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-5 text-lg font-semibold shadow-2xl shadow-black/20 hover:shadow-black/30 transition-all duration-300 relative overflow-hidden group border-0"
                >
                  <span className="relative z-10">Try Beta Version</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/30 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  <Sparkles className="ml-2 w-5 h-5 relative z-10" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-gray-200 text-primary hover:bg-white/10 backdrop-blur-sm px-10 py-5 text-lg font-semibold transition-all duration-300 hover:border-white/70 hover:shadow-lg"
                onClick={() => window.open('https://github.com/your-repo', '_blank')}
              >
                <span className="">View on GitHub</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05),transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Logo size="md" animated={false} />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  DocuVault
                </span>
              </div>
              <p className="text-gray-400 mb-4 font-light">
                Next-generation secure document sharing platform powered by blockchain technology.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Roadmap
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Status
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Docu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
