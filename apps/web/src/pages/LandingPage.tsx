import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Zap, 
  Users, 
  FileCheck, 
  Globe, 
  ChevronRight, 
  ArrowRight,
  CheckCircle,
  Star,
  Menu,
  X,
  Sparkles,
  Database,
  Fingerprint
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import FloatingShapes from '../components/ui/floating-shapes';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [titleText, setTitleText] = useState('');
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 100]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  const fullTitle = 'Secure Document Verification';

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullTitle.length) {
        setTitleText(fullTitle.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const features = [
    {
      icon: Shield,
      title: "Zero-Knowledge Verification",
      description: "Verify document authenticity without revealing sensitive information using advanced ZKP technology.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Lock,
      title: "Decentralized Security",
      description: "Built on blockchain technology ensuring immutable records and transparent verification processes.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Zap,
      title: "Instant Verification",
      description: "Get verification results in seconds with our optimized smart contract infrastructure.",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Users,
      title: "Multi-Party Trust",
      description: "Enable secure document sharing between issuers, holders, and verifiers with granular permissions.",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: Database,
      title: "IPFS Storage",
      description: "Decentralized file storage ensuring your documents are always accessible and tamper-proof.",
      color: "from-rose-500 to-pink-500"
    },
    {
      icon: Fingerprint,
      title: "Digital Identity",
      description: "Manage and verify digital identities with our comprehensive DID (Decentralized Identity) system.",
      color: "from-violet-500 to-purple-500"
    }
  ];

  const stats = [
    { value: "99.9%", label: "Uptime" },
    { value: "10,000+", label: "Documents Verified" },
    { value: "500+", label: "Organizations" },
    { value: "24/7", label: "Support" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Healthcare Administrator",
      company: "MedTech Solutions",
      content: "Docu has revolutionized how we handle medical certifications. The zero-knowledge proofs ensure patient privacy while maintaining verification integrity.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "HR Director",
      company: "Global Corp",
      content: "The seamless integration and instant verification have streamlined our employee onboarding process significantly.",
      rating: 5
    },
    {
      name: "Dr. Emily Watson",
      role: "Research Director",
      company: "University Labs",
      content: "Perfect for academic credential verification. The blockchain-based approach gives us complete confidence in document authenticity.",
      rating: 5
    }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-white/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Docu
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors">How It Works</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors">Testimonials</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">Pricing</a>
              <Link to="/auth">
                <Button variant="outline" className="mr-2">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth/siwe">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
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
              <a href="#features" className="block text-gray-700 hover:text-blue-600">Features</a>
              <a href="#how-it-works" className="block text-gray-700 hover:text-blue-600">How It Works</a>
              <a href="#testimonials" className="block text-gray-700 hover:text-blue-600">Testimonials</a>
              <a href="#pricing" className="block text-gray-700 hover:text-blue-600">Pricing</a>
              <div className="pt-4 space-y-2">
                <Link to="/auth" className="block">
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/siwe" className="block">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
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
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"
          style={{ y: y1 }}
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [360, 270, 180, 90, 0]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        {/* Premium Floating Elements */}
        <motion.div 
          className="absolute top-32 right-1/4 w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-60 shadow-lg"
          animate={{ 
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-32 left-1/4 w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-40 shadow-lg"
          animate={{ 
            y: [20, -20, 20],
            x: [10, -10, 10],
            scale: [1, 1.3, 1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/3 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-50 shadow-lg"
          animate={{ 
            scale: [1, 1.5, 1],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
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
              <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200">
                🚀 Now Live on Sepolia Testnet
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {titleText.split(' ').map((word, index) => (
                <span key={index}>
                  {index >= 2 ? (
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {word}
                    </span>
                  ) : (
                    word
                  )}
                  {index < titleText.split(' ').length - 1 && 
                    (index === 1 ? <br /> : ' ')
                  }
                </span>
              ))}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-blue-600"
              >
                |
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Revolutionary blockchain-based platform using zero-knowledge proofs to verify document authenticity 
              while preserving privacy and ensuring trust.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Link to="/auth/siwe">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg group"
                >
                  Start Verifying Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-4 text-lg border-2 hover:bg-gray-50"
              >
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                className="text-center"
                variants={fadeInUp}
              >
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
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
              Powerful Features for Modern Verification
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with cutting-edge technology to ensure security, privacy, and trust in document verification.
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
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-500 group border-0 bg-white/80 backdrop-blur-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-6 relative z-10">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
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
              How Docu Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, secure, and efficient document verification in three easy steps.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload Document",
                description: "Securely upload your documents to IPFS and register them on the blockchain with cryptographic hashing."
              },
              {
                step: "02",
                title: "Generate Proof",
                description: "Create zero-knowledge proofs that verify document authenticity without revealing sensitive information."
              },
              {
                step: "03",
                title: "Verify Instantly",
                description: "Instant verification through smart contracts ensures trust and transparency across all parties."
              }
            ].map((step, index) => (
              <motion.div 
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="text-center p-8 h-full bg-white border-0 shadow-lg">
                  <div className="text-4xl font-bold text-blue-600 mb-4">{step.step}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </Card>
                {index < 2 && (
                  <ChevronRight className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 w-8 h-8 text-blue-600" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Organizations Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our customers are saying about their experience with Docu.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="p-6 h-full bg-white border-0 shadow-lg">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                    <div className="text-sm text-blue-600">{testimonial.company}</div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Secure Your Documents?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of organizations already using Docu for secure document verification.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/siwe">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
                >
                  Get Started Now
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg"
              >
                Contact Sales
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Docu</span>
              </div>
              <p className="text-gray-400 mb-4">
                Secure document verification powered by blockchain and zero-knowledge proofs.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
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