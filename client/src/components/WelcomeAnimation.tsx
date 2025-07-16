import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Heart, Coffee, Sun, Zap, Clock, Snail } from 'lucide-react';
import { User } from '@shared/schema';

interface WelcomeAnimationProps {
  userName: string;
  user: User;
  onComplete: () => void;
}

const welcomeMessages = [
  "Welcome back, superstar! ✨",
  "Ready to create amazing quotes? 🚀",
  "Your pricing tools await! 💪",
  "Time to make magic happen! ⚡",
  "Let's build something great today! 🌟"
];

const motivationalQuotes = [
  "Great things never come from comfort zones!",
  "Every expert was once a beginner!",
  "Success is the sum of small efforts!",
  "Make today amazing!",
  "You've got this! 🔥"
];

const sarcasticMessages = [
  "Oh, look who's back! 😏",
  "Did you miss us? We certainly missed you... 🙄",
  "Welcome back, stranger! 👋",
  "Finally decided to return? 😅",
  "We were starting to think you forgot about us! 🤔"
];

const sarcasticQuotes = [
  "Better late than never, right?",
  "Good things come to those who... eventually show up!",
  "Time flies when you're having fun elsewhere!",
  "Absence makes the heart grow fonder... or forgetful!",
  "We kept the lights on for you! 💡"
];

const FloatingIcon = ({ icon: Icon, delay = 0 }: { icon: any; delay?: number }) => (
  <motion.div
    className="absolute text-4xl"
    initial={{ 
      opacity: 0, 
      scale: 0,
      rotate: -180,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50
    }}
    animate={{ 
      opacity: [0, 1, 0],
      scale: [0, 1.2, 0],
      rotate: [0, 360],
      y: [0, -100]
    }}
    transition={{ 
      duration: 3,
      delay: delay,
      ease: "easeOut"
    }}
    style={{
      left: `${Math.random() * 80 + 10}%`,
      top: `${Math.random() * 80 + 10}%`,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    }}
  >
    <Icon />
  </motion.div>
);

const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({ userName, user, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);
  const [animationType, setAnimationType] = useState<'normal' | 'sarcastic'>('normal');
  
  // Skip animation entirely after 100 logins
  const loginCount = user.loginCount || 0;
  if (loginCount >= 100) {
    // Store current activity time and go straight to dashboard
    localStorage.setItem('lastActivity', Date.now().toString());
    onComplete();
    return null;
  }
  
  // Check if user has been away for too long (more than 30 minutes)
  const lastActivity = localStorage.getItem('lastActivity');
  const isReturningUser = lastActivity && (Date.now() - parseInt(lastActivity)) > 30 * 60 * 1000;
  
  // Determine animation speed based on login count
  const isNewUser = loginCount <= 10;
  const speedMultiplier = isNewUser ? 1 : 0.6; // Slower for new users, faster for experienced users
  
  const message = isReturningUser 
    ? sarcasticMessages[Math.floor(Math.random() * sarcasticMessages.length)]
    : welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    
  const quote = isReturningUser
    ? sarcasticQuotes[Math.floor(Math.random() * sarcasticQuotes.length)]
    : motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  useEffect(() => {
    if (isReturningUser) {
      setAnimationType('sarcastic');
    }
    
    // Adaptive timing based on login count
    const timer1 = setTimeout(() => setCurrentStep(1), 800 * speedMultiplier);
    const timer2 = setTimeout(() => setCurrentStep(2), 3000 * speedMultiplier);
    const timer3 = setTimeout(() => setShowFireworks(true), 3500 * speedMultiplier);
    const timer4 = setTimeout(() => setCurrentStep(3), 5000 * speedMultiplier);
    const timer5 = setTimeout(() => {
      // Store current activity time
      localStorage.setItem('lastActivity', Date.now().toString());
      onComplete();
    }, 7000 * speedMultiplier);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete, speedMultiplier, isReturningUser]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.5,
        ease: "easeIn"
      }
    }
  };

  const textVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center z-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="relative text-center text-white max-w-2xl mx-auto px-8">
        {/* Login Count Indicator for New Users */}
        {isNewUser && (
          <motion.div
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-yellow-300 text-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Snail className="w-4 h-4" />
            <span>Login #{user.loginCount || 1} - Taking it slow for readability</span>
          </motion.div>
        )}

        {/* Sarcastic Indicator for Returning Users */}
        {isReturningUser && (
          <motion.div
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-orange-300 text-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Clock className="w-4 h-4" />
            <span>Long time no see! 😏</span>
          </motion.div>
        )}

        {/* Welcome Message */}
        <AnimatePresence mode="wait">
          {currentStep >= 0 && (
            <motion.div
              key="welcome"
              variants={textVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="mb-8"
            >
              <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
                {userName}
              </h1>
              <p className={`text-2xl ${animationType === 'sarcastic' ? 'text-orange-300' : 'text-blue-300'}`}>
                {message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Motivational Message */}
        <AnimatePresence mode="wait">
          {currentStep >= 1 && (
            <motion.div
              key="motivation"
              variants={textVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="mb-8"
            >
              <div className={`p-6 rounded-2xl ${animationType === 'sarcastic' ? 'bg-orange-500/20 border-orange-400/30' : 'bg-blue-500/20 border-blue-400/30'} border backdrop-blur-sm`}>
                <p className="text-xl text-white/90 font-medium">
                  {quote}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Daily Quote */}
        <AnimatePresence mode="wait">
          {currentStep >= 2 && (
            <motion.div
              key="quote"
              variants={textVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="mb-8"
            >
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-sm">
                <p className="text-lg text-purple-200 italic">
                  {animationType === 'sarcastic' 
                    ? `"Productivity tip: Actually using the app helps with productivity!" 😉`
                    : `"Today's productivity starts with the first click!" ⚡`
                  }
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fireworks Effect */}
        {showFireworks && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <FloatingIcon
                key={i}
                icon={animationType === 'sarcastic' ? Clock : [Sparkles, Star, Heart, Coffee, Sun, Zap][i % 6]}
                delay={i * 0.3}
              />
            ))}
          </div>
        )}

        {/* Loading Indicator */}
        <AnimatePresence mode="wait">
          {currentStep >= 3 && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mt-12"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 bg-white rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 1,
                        delay: i * 0.2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>
                <p className="text-white/70">
                  {animationType === 'sarcastic' 
                    ? "Dusting off your workspace..."
                    : "Preparing your workspace..."
                  }
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default WelcomeAnimation;