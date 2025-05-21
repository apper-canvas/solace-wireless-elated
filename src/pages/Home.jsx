import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';

// Icons
const InfoIcon = getIcon('info');
const ShuffleIcon = getIcon('shuffle');
const AwardIcon = getIcon('award');

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState(null);

  useEffect(() => {
    // Simulate loading game assets
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleDifficultySelect = (level) => {
    setDifficulty(level);
    setGameStarted(true);
    toast.success(`Starting new game in ${level} mode!`);
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 mb-4"
        >
          <ShuffleIcon className="w-20 h-20 text-primary" />
        </motion.div>
        <p className="text-xl font-medium">Shuffling cards...</p>
      </div>
    );
  }

  if (gameStarted) {
    return <MainFeature difficulty={difficulty} onRestart={() => setGameStarted(false)} />;
  }

  return (
    <section className="py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          SolAce Solitaire
        </h1>
        <p className="text-lg md:text-xl text-surface-600 dark:text-surface-300 max-w-2xl mx-auto">
          The classic card game with three difficulty levels to challenge your skills
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Difficulty</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Easy Difficulty */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="card-neu difficulty-option p-6"
            onClick={() => handleDifficultySelect('Easy')}
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <AwardIcon className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">Easy</h3>
            <ul className="space-y-2 text-surface-600 dark:text-surface-300 text-sm">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Draw 1 card at a time</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Unlimited time</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Move hints available</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>No penalties for moves</span>
              </li>
            </ul>
          </motion.div>

          {/* Normal Difficulty */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="card-neu difficulty-option p-6"
            onClick={() => handleDifficultySelect('Normal')}
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <AwardIcon className="w-8 h-8 text-secondary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">Normal</h3>
            <ul className="space-y-2 text-surface-600 dark:text-surface-300 text-sm">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Draw 3 cards at a time</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Time-based scoring</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Limited hints</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Standard scoring rules</span>
              </li>
            </ul>
          </motion.div>

          {/* Hard Difficulty */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="card-neu difficulty-option p-6"
            onClick={() => handleDifficultySelect('Hard')}
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <AwardIcon className="w-8 h-8 text-accent" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">Hard</h3>
            <ul className="space-y-2 text-surface-600 dark:text-surface-300 text-sm">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Draw 3 cards at a time</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Strict time limit</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>No hints available</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Penalties for incorrect moves</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-surface-100 dark:bg-surface-800 rounded-xl p-4 flex items-start"
        >
          <InfoIcon className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
          <div className="ml-3">
            <h3 className="font-semibold mb-1">How to Play</h3>
            <p className="text-surface-600 dark:text-surface-300 text-sm">
              The goal is to move all cards to the foundation piles, sorted by suit from Ace to King.
              In the tableau, cards must be placed in alternating colors and descending order (King to Ace).
              Drag cards between piles to make valid moves, and click the deck to draw new cards.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Home;