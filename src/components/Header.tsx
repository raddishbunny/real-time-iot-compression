
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300",
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="w-5 h-5 text-white"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h1 className="text-xl font-medium">IoT Compression</h1>
        </div>
        
        <nav className="hidden md:flex space-x-8">
          <a href="#" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Dashboard</a>
          <a href="#" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Devices</a>
          <a href="#" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Algorithms</a>
          <a href="#" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Settings</a>
        </nav>
        
        <div className="flex items-center space-x-4">
          <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            Documentation
          </button>
          <button className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Connect Device
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
