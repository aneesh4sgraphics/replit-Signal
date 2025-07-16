import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Heart, Star, Trophy, ThumbsUp, Zap, CheckCircle, Send } from 'lucide-react';

interface EmailCelebrationAnimationProps {
  customerName: string;
  onComplete: () => void;
}

const celebrationMessages = [
  "Excellent work! Your quote has been sent successfully!",
  "Great job! Another quote on its way to your customer!",
  "Outstanding! Your professional quote is now in their inbox!",
  "Well done! You're building stronger customer relationships!",
  "Fantastic! Your quote shows true professionalism!",
  "Superb! Another step closer to closing the deal!",
  "Amazing! Your detailed quote will impress the customer!",
  "Perfect! Your quote reflects quality and expertise!",
  "Brilliant! You're making great progress today!",
  "Excellent! Your customer will appreciate this quick response!"
];

const followUpMotivations = [
  "Follow up in 2-3 days to show your commitment!",
  "A quick follow-up call can make all the difference!",
  "Stay connected - follow up to build trust!",
  "Great salespeople always follow up professionally!",
  "Your follow-up shows you care about their business!",
  "Follow up with confidence - you've got this!",
  "Persistence pays off - follow up to win the deal!",
  "A thoughtful follow-up sets you apart from competitors!",
  "Your follow-up could be the key to closing this sale!",
  "Follow up with enthusiasm - success is within reach!"
];

const EmailCelebrationAnimation: React.FC<EmailCelebrationAnimationProps> = ({ customerName, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showParticles, setShowParticles] = useState(false);
  
  const celebrationMessage = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
  const followUpMessage = followUpMotivations[Math.floor(Math.random() * followUpMotivations.length)];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 600);
    const timer2 = setTimeout(() => setShowParticles(true), 1000);
    const timer3 = setTimeout(() => setCurrentStep(2), 2500);
    const timer4 = setTimeout(() => setCurrentStep(3), 4500);
    const timer5 = setTimeout(() => onComplete(), 6500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete]);

  const floatingIcons = [
    { icon: Mail, color: "text-blue-500", delay: 0 },
    { icon: Heart, color: "text-red-500", delay: 0.2 },
    { icon: Star, color: "text-yellow-500", delay: 0.4 },
    { icon: Trophy, color: "text-orange-500", delay: 0.6 },
    { icon: ThumbsUp, color: "text-green-500", delay: 0.8 },
    { icon: Zap, color: "text-purple-500", delay: 1.0 },
    { icon: CheckCircle, color: "text-teal-500", delay: 1.2 },
    { icon: Send, color: "text-indigo-500", delay: 1.4 }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center z-50"
      >
        <div className="text-center text-white relative">
          
          {/* Floating celebration icons */}
          {showParticles && (
            <div className="absolute inset-0 pointer-events-none">
              {floatingIcons.map((item, index) => (
                <motion.div
                  key={index}
                  className={`absolute ${item.color}`}
                  initial={{ 
                    opacity: 0, 
                    scale: 0, 
                    x: Math.random() * 800 - 400,
                    y: Math.random() * 600 - 300
                  }}
                  animate={{ 
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1.5, 1.5, 0],
                    y: [0, -50, -100, -150],
                    rotate: [0, 360, 720, 1080]
                  }}
                  transition={{ 
                    duration: 3,
                    delay: item.delay,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                >
                  <item.icon size={40} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Step 1: Success Message */}
          {currentStep >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-5xl mb-4"
              >
                🎉
              </motion.div>
              <h1 className="text-3xl font-bold mb-4 text-shadow-lg">
                Quote Sent Successfully!
              </h1>
              <p className="text-xl font-medium opacity-90">
                {celebrationMessage}
              </p>
            </motion.div>
          )}

          {/* Step 2: Customer specific celebration */}
          {currentStep >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 border border-white/30">
                <h2 className="text-2xl font-semibold mb-3">
                  Your quote is now with {customerName}!
                </h2>
                <p className="text-lg opacity-90">
                  They'll be impressed by your professionalism and attention to detail.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Follow-up motivation */}
          {currentStep >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 backdrop-blur-sm rounded-lg p-6 border border-yellow-300/30">
                <div className="flex items-center justify-center mb-3">
                  <Trophy className="w-8 h-8 text-yellow-300 mr-2" />
                  <h3 className="text-xl font-bold">Pro Tip</h3>
                </div>
                <p className="text-lg font-medium">
                  {followUpMessage}
                </p>
              </div>
            </motion.div>
          )}

          {/* Success checkmark animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: currentStep >= 1 ? 1 : 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="absolute -top-10 left-1/2 transform -translate-x-1/2"
          >
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </motion.div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmailCelebrationAnimation;