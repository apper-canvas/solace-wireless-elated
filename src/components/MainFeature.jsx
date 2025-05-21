import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag, useDrop } from 'react-dnd';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';

import Confetti from 'react-confetti';
import soundManager from '../utils/soundUtils';
// Icons
const RefreshIcon = getIcon('refresh-cw');
const HelpCircleIcon = getIcon('help-circle');
const HomeIcon = getIcon('home');
const AwardIcon = getIcon('award');
const ClockIcon = getIcon('clock');
const ArrowRightIcon = getIcon('arrow-right');
const LightbulbIcon = getIcon('lightbulb');
const XIcon = getIcon('x');
const StarIcon = getIcon('star');
const TrophyIcon = getIcon('trophy');
const PartyPopperIcon = getIcon('party-popper');
const VolumeIcon = getIcon('volume-2');
const Volume1Icon = getIcon('volume-1');
const VolumeXIcon = getIcon('volume-x');
const SettingsIcon = getIcon('settings');

// Card Component
const Card = ({ card, index, pileIndex, onCardClick, isDraggable, isLast }) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [wasFlipped, setWasFlipped] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CARD',
    item: { card, fromPile: pileIndex, index },
    canDrag: () => isDraggable && card.faceUp,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    begin: () => isDraggable && card.faceUp && soundManager.play('cardDrag'),
    }
  }), [card, pileIndex, index, isDraggable]);

  const cardStyle = {
    transform: `translateY(${index * 25}px)`,
    zIndex: index,
    opacity: isDragging ? 0.5 : 1,
  };

  const suitColors = {
    hearts: 'text-red-500',
    diamonds: 'text-red-500',
    clubs: 'text-surface-900 dark:text-white',
    spades: 'text-surface-900 dark:text-white',
  };

  const suitSymbols = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };

  const valueMap = {
    1: 'A',
    11: 'J',
    12: 'Q',
    13: 'K',
  };

  const displayValue = valueMap[card.value] || card.value;

  // Effect to handle animation when card flips
  useEffect(() => {
    if (card.faceUp && !wasFlipped) {
      setIsFlipping(true);
      setWasFlipped(true);
      setTimeout(() => setIsFlipping(false), 500); // Match the CSS transition duration
    }
  }, [card.faceUp, wasFlipped]);

  // Effect to remove animation class after animation completes
  useEffect(() => {
    if (animationClass) {
      const timer = setTimeout(() => {
        setAnimationClass('');
      }, 500); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [animationClass]);

  return (
    <div
      ref={drag}
      className={`absolute playing-card card-flip ${isFlipping ? 'flipped' : ''} 
                 ${card.faceUp ? 'bg-white dark:bg-surface-800' : 'playing-card-face-down'} ${isDragging ? 'opacity-50' : 'opacity-100'} 
                 ${isLast && card.faceUp ? 'hover:shadow-lg' : ''}
                 ${isDraggable && card.faceUp ? 'cursor-grab' : 'cursor-default'}
                 ${animationClass}`}
      style={cardStyle}
      onClick={() => onCardClick(pileIndex, index)}
      onMouseDown={() => {
        if (card.faceUp) soundManager.play('cardSelect');
      }}
    >
      {card.faceUp ? (
        <div className={`h-full w-full p-2 flex flex-col justify-between rounded-lg border border-surface-200 dark:border-surface-700 ${isLast ? 'hover:ring-2 hover:ring-primary/50' : ''}`}>
          <div className={`flex items-center ${suitColors[card.suit]}`}>
            <span className="text-lg font-bold">{displayValue}</span>
            <span className="text-lg ml-1">{suitSymbols[card.suit]}</span>
          </div>
          <div className={`text-center flex-grow flex items-center justify-center text-3xl ${suitColors[card.suit]}`}>
            {suitSymbols[card.suit]}
          </div>
          <div className={`flex items-center justify-end ${suitColors[card.suit]}`}>
            <span className="text-lg ml-1">{suitSymbols[card.suit]}</span>
            <span className="text-lg font-bold">{displayValue}</span>
          </div>
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-white text-2xl font-bold">SolAce</div>
        </div>
      )}
    </div>
  );
};

// Pile Component
const Pile = ({ pile, pileIndex, cards, onCardClick, onCardDrop, type }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'CARD',
    drop: (item) => onCardDrop(item, pileIndex),
    canDrop: (item) => {
      if (type === 'foundation') {
        // For foundation piles
        const lastCard = cards.length > 0 ? cards[cards.length - 1] : null;
        const draggedCard = item.card;
        
        // If pile is empty, only accept Aces
        if (!lastCard) return draggedCard.value === 1;
        
        // Otherwise, must be same suit and next value
        return draggedCard.suit === lastCard.suit && draggedCard.value === lastCard.value + 1;
      } else if (type === 'tableau') {
        // For tableau piles
        const lastCard = cards.length > 0 ? cards[cards.length - 1] : null;
        const draggedCard = item.card;
        
        // If pile is empty, only accept Kings
        if (!lastCard) return draggedCard.value === 13;
        
        // Otherwise, must be alternate color and previous value
        const isAlternateColor = 
          (lastCard.color === 'red' && draggedCard.color === 'black') || 
          (lastCard.color === 'black' && draggedCard.color === 'red');
        
        return isAlternateColor && draggedCard.value === lastCard.value - 1;
      }
      
      return false;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [cards, pileIndex, type]);

  let pileClassName = "pile relative h-[180px]";
  
  if (isOver) {
    const dropClass = canDrop ? " valid-drop-target" : " invalid-drop-target";
    pileClassName += dropClass;
  }

  const emptyPileLabel = type === 'foundation' ? 'A-K' : 'K';

  return (
    <div ref={drop} className={pileClassName}>
      {cards.length === 0 ? (
        <div className="text-surface-400 dark:text-surface-500 font-medium">
          {emptyPileLabel}
        </div>
      ) : (
        cards.map((card, index) => (
          <Card 
            key={`${card.suit}-${card.value}`}
            card={card}
            index={index}
            pileIndex={pileIndex}
            onCardClick={onCardClick}
            isDraggable={index === cards.length - 1 || (card.faceUp && type === 'tableau')}
            isLast={index === cards.length - 1}
          />
        ))
      )}
    </div>
  );
};

// Deck Component
const Deck = ({ stock, waste, onDeckClick, onCardDrop, drawCount }) => {
  return (
    <div className="flex gap-4">
      <div 
        className="pile cursor-pointer flex items-center justify-center"
        onClick={onDeckClick}
      >
        {stock.length > 0 ? (
          <div className="playing-card playing-card-face-down flex items-center justify-center">
            <span className="text-white text-sm">{stock.length}</span>
          </div>
        ) : (
          <RefreshIcon className="h-10 w-10 text-surface-400 dark:text-surface-500" />
        )}
      </div>
      
      <div className="pile relative">
        {waste.length === 0 ? (
          <div className="text-surface-400 dark:text-surface-500 font-medium">
            Empty
          </div>
        ) : (
          waste.map((card, index) => {
          // Only show the last card (or last 3 depending on draw count)
          const shouldShow = drawCount === 1 
            ? index === waste.length - 1 
            : index >= waste.length - 3 && index < waste.length;
          
          if (!shouldShow) return null;
          
          const offset = drawCount === 1 ? 0 : (index - (waste.length - 3)) * 30;
          const isTopCard = index === waste.length - 1;
          
          return (
            <WasteCard 
              key={`${card.suit}-${card.value}`} 
              card={card}
              isTopCard={isTopCard}
              style={{ left: offset }}
              onCardDrop={onCardDrop}
            />
          );
        }))}
      </div>
    </div>
  );
};

// Waste Card Component with drag functionality
const WasteCard = ({ card, isTopCard, style, onCardDrop }) => {
  const [animationClass, setAnimationClass] = useState('');
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CARD',
    item: { card, fromPile: 'waste' },
    canDrag: () => isTopCard, // Only the top card can be dragged
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    begin: () => {
      if (isTopCard) {
        soundManager.play('cardDrag');
      }
    },
  }), [card, isTopCard]);
  
  // Effect to remove animation class after animation completes
  useEffect(() => {
    if (animationClass) {
      const timer = setTimeout(() => {
        setAnimationClass('');
      }, 500); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [animationClass]);

  const suitColors = {
    hearts: 'text-red-500',
    diamonds: 'text-red-500',
    clubs: 'text-surface-900 dark:text-white',
    spades: 'text-surface-900 dark:text-white',
  };

  const valueMap = {
    1: 'A',
    11: 'J',
    12: 'Q',
    13: 'K',
  };

  const displayValue = valueMap[card.value] || card.value;
          
  return (
    <div 
      ref={drag}
      className={`playing-card bg-white dark:bg-surface-800 absolute 
                ${isDragging ? 'opacity-50' : 'opacity-100'} 
                ${isTopCard ? 'hover:shadow-lg cursor-grab' : 'cursor-default'}
                ${animationClass}`}
      style={style}
      onMouseDown={() => soundManager.play('cardSelect')}
    >
      <div className="h-full w-full p-2 flex flex-col justify-between border border-surface-200 dark:border-surface-700 rounded-lg">
        <div className={`flex items-center ${suitColors[card.suit]}`}>
          <span className="text-lg font-bold">{displayValue}</span>
          <span className="text-lg ml-1">{card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠'}</span>
        </div>
        <div className={`text-center flex-grow flex items-center justify-center text-3xl ${suitColors[card.suit]}`}>
          {card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠'}
        </div>
        <div className={`flex items-center justify-end ${suitColors[card.suit]}`}>
          <span className="text-lg ml-1">{card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠'}</span>
          <span className="text-lg font-bold">{displayValue}</span>
        </div>
      </div>
    </div>
  );
};

// Game component
const MainFeature = ({ difficulty, onRestart }) => {
  // Game configuration based on difficulty
  const difficultySettings = {
    Easy: {
      drawCount: 1,
      timeLimit: null,
      scoringMultiplier: 1,
      hintsAllowed: 999,
      movesPenalty: false
    },
    Normal: {
      drawCount: 3,
      timeLimit: null,
      scoringMultiplier: 1.5,
      hintsAllowed: 3,
      movesPenalty: true
    },
    Hard: {
      drawCount: 3,
      timeLimit: 600, // 10 minutes
      scoringMultiplier: 2,
      hintsAllowed: 0,
      movesPenalty: true
    }
  };

  const settings = difficultySettings[difficulty];

  // Game state
  const [gameState, setGameState] = useState({
    score: 0,
    moves: 0,
    time: 0,
    isGameOver: false,
    isGameWon: false,
    hintsUsed: 0,
    hintsRemaining: settings.hintsAllowed
  });

  const [stock, setStock] = useState([]);
  const [waste, setWaste] = useState([]);
  const [foundation, setFoundation] = useState([[], [], [], []]);
  const [tableau, setTableau] = useState([[], [], [], [], [], [], []]);
  const [showRules, setShowRules] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [flyingCards, setFlyingCards] = useState([]);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [showGameOver, setShowGameOver] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [soundVolume, setSoundVolume] = useState(() => parseFloat(localStorage.getItem('soundVolume') || '0.5'));

  // Initialize game
  useEffect(() => {
    initializeGame();
    // Start timer
    const timerInterval = setInterval(() => {
      setGameState(prev => {
        // Check if time limit is reached
        if (settings.timeLimit && prev.time >= settings.timeLimit && !prev.isGameOver) {
          clearInterval(timerInterval);
          handleGameOver(false);
          return {...prev, isGameOver: true};
        }
        return {...prev, time: prev.time + 1};
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [difficulty]);

  // Initialize sound effects based on difficulty
  useEffect(() => {
    soundManager.initialize(difficulty);
    setSoundVolume(parseFloat(localStorage.getItem('soundVolume') || '0.5'));
  }, [difficulty]);

  // Check for win condition
  useEffect(() => {
    const totalFoundationCards = foundation.reduce((sum, pile) => sum + pile.length, 0);
    if (totalFoundationCards === 52 && !gameState.isGameWon) {
      handleGameOver(true);
    }
  }, [foundation]);

  // Initialize game
  const initializeGame = () => {
    // Create deck
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const deck = [];

    suits.forEach(suit => {
      const color = suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
      for (let value = 1; value <= 13; value++) {
        deck.push({
          suit,
          value,
          color,
          faceUp: false
        });
      }
    });

    // Shuffle deck
    const shuffledDeck = shuffleArray([...deck]);

    // Deal cards to tableau
    const newTableau = Array(7).fill().map(() => []);
    
    for (let i = 0; i < 7; i++) {
      for (let j = i; j < 7; j++) {
        const card = shuffledDeck.pop();
        if (i === j) {
          card.faceUp = true; // Flip the top card
        }
        newTableau[j].push(card);
      }
    }

    // Reset game state
    setStock(shuffledDeck);
    setWaste([]);
    setFoundation([[], [], [], []]);
    setTableau(newTableau);
    setGameState({
      score: 0,
      moves: 0,
      time: 0,
      isGameOver: false,
      isGameWon: false,
      hintsUsed: 0,
      hintsRemaining: settings.hintsAllowed
    });
  };

  // Shuffle array (Fisher-Yates algorithm)
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Handle deck click
  const handleDeckClick = () => {
    if (stock.length === 0) {
      // Reset stock from waste
      setStock([...waste].reverse().map(card => ({...card, faceUp: false})));
      setWaste([]);
      updateScore(-20); // Penalty for recycling
      return;
    }

    // Draw cards based on difficulty
    const cardsToMove = Math.min(settings.drawCount, stock.length);
    const newWaste = [...waste];
    const newStock = [...stock];

    for (let i = 0; i < cardsToMove; i++) {
      const card = newStock.pop();
      card.faceUp = true;
      newWaste.push(card);
    }

    setStock(newStock);
    setWaste(newWaste);
    incrementMoves();
  };

  // Handle card click in tableau
  const handleCardClick = (pileIndex, cardIndex) => {
    const pile = [...tableau[pileIndex]];
    
    // If clicking on a face-down card and it's the top card, flip it
    if (!pile[cardIndex].faceUp && cardIndex === pile.length - 1) {
      const newTableau = [...tableau];
      
      // Play flip sound
      soundManager.play('cardFlip');
      
      // Set the card to face up to trigger the animation
      pile[cardIndex] = {
        ...pile[cardIndex],
        faceUp: true
      };
      newTableau[pileIndex] = pile;
      setTableau(newTableau);
      updateScore(5); // Points for revealing a new card
      return;
    }

    // If it's a face-up card, try to move it to foundation automatically
    if (pile[cardIndex].faceUp) {
      // Only move single cards automatically
      if (cardIndex === pile.length - 1) {
        const card = pile[cardIndex];
        const foundationIndex = getValidFoundationMove(card);
        
        if (foundationIndex !== -1) {
          moveCardToFoundation(pileIndex, cardIndex, foundationIndex);
        }
      }
    }
  };

  // Get valid foundation move
  const getValidFoundationMove = (card) => {
    for (let i = 0; i < 4; i++) {
      const foundationPile = foundation[i];
      
      // If empty foundation, only accept Ace
      if (foundationPile.length === 0) {
        if (card.value === 1) return i;
      } 
      // If not empty, check for same suit and sequential value
      else {
        const topCard = foundationPile[foundationPile.length - 1];
        if (card.suit === topCard.suit && card.value === topCard.value + 1) {
          return i;
        }
      }
    }
    
    return -1;
  };

  // Move card to foundation
  const moveCardToFoundation = (sourcePileIndex, cardIndex, foundationIndex) => {
    // Source can be tableau or waste
    if (typeof sourcePileIndex === 'number') {
      // From tableau
      const newTableau = [...tableau];
      const newFoundation = [...foundation];
      
      const card = newTableau[sourcePileIndex][cardIndex];
      newTableau[sourcePileIndex].splice(cardIndex, 1);
      
      // Flip new top card if needed
      if (newTableau[sourcePileIndex].length > 0 && cardIndex > 0 && !newTableau[sourcePileIndex][cardIndex - 1].faceUp) {
        newTableau[sourcePileIndex][cardIndex - 1].faceUp = true;
        updateScore(5); // Points for revealing a new card
      }
      
      newFoundation[foundationIndex].push(card);
      
      setTableau(newTableau);
      setFoundation(newFoundation);
      
      updateScore(10); // Points for moving to foundation
    } else if (sourcePileIndex === 'waste') {
      // From waste
      if (waste.length === 0) {
        toast.error("No cards in waste pile!");
        return;
      }

      // Get the top card from waste
      const newWaste = [...waste].slice(0, -1); // Remove last card
      const newFoundation = [...foundation];
      
      // Add to foundation
      const card = waste[waste.length - 1];
      newFoundation[foundationIndex].push(card);
      
      setWaste(newWaste);
      setFoundation(newFoundation);
      
      updateScore(10); // Points for moving to foundation
    }
    
    incrementMoves();
  };

  // Handle card drop
  const handleCardDrop = (item, targetPileIndex) => {
    const { card, fromPile, index } = item;
    
    let validDrop = false;
    let cardToAnimate;
    // Check if moving to foundation
    if (targetPileIndex >= 100) {
      const foundationIndex = targetPileIndex - 100;
      const foundationPile = foundation[foundationIndex];
      
      let isValidMove = false;
      
      // Empty foundation accepts only Aces
      if (foundationPile.length === 0) {
        isValidMove = card.value === 1;
      } else {
        // Otherwise must be same suit and next value
        const topCard = foundationPile[foundationPile.length - 1];
        isValidMove = card.suit === topCard.suit && card.value === topCard.value + 1;
      }
      
      if (isValidMove) {
        if (typeof fromPile === 'number') {
          // Move from tableau to foundation
          moveCardToFoundation(fromPile, index, foundationIndex);
          validDrop = true;
        } else if (fromPile === 'waste') {
          if (waste.length === 0) {
            return;
          }
          // Move from waste to foundation
          moveCardToFoundation('waste', null, foundationIndex);
        }
        validDrop = true;
        
        // Find the card element to animate for foundation moves
        setTimeout(() => {
          const foundationPiles = document.querySelectorAll('.pile');
          if (foundationPiles && foundationPiles[foundationIndex + 4]) { // +4 to account for stock and tableau piles
            const lastCard = foundationPiles[foundationIndex + 4].querySelector('.playing-card:last-child');
            if (lastCard) {
              lastCard.classList.add('successful-move');
            }
          }
        }, 50);
        soundManager.play('cardDrop');
      } else {
        if (settings.movesPenalty) {
          updateScore(-5); // Penalty for invalid move
          toast.error("Invalid move!");
          soundManager.play('invalidDrop');
          validDrop = false;
        }
      }
      
      return;
    }
    
    // Moving to tableau
    const targetPile = tableau[targetPileIndex];
    let isValidMove = false;
    
    // Empty tableau piles accept only Kings
    if (targetPile.length === 0) {
      isValidMove = card.value === 13;
    } else {
      // Otherwise must be alternate color and descending value
      const topCard = targetPile[targetPile.length - 1];
      isValidMove = 
        topCard.faceUp && 
        topCard.color !== card.color && 
        topCard.value === card.value + 1;
    }
    
    if (isValidMove) {
      // Move cards between tableau piles
      const newTableau = [...tableau];
      let cardsToMove = [];
      
      if (typeof fromPile === 'number') {
        // From tableau - might be moving multiple cards
        cardsToMove = newTableau[fromPile].splice(index);
        
        // Flip new top card if needed
        if (newTableau[fromPile].length > 0 && !newTableau[fromPile][newTableau[fromPile].length - 1].faceUp) {
          newTableau[fromPile][newTableau[fromPile].length - 1].faceUp = true;
          updateScore(5); // Points for revealing a new card
        }
      } else if (fromPile === 'waste') {
        // From waste - just the top card
        cardsToMove = [waste[waste.length - 1]];
        setWaste(waste.slice(0, -1)); // Remove the top card
        validDrop = true;
      }
      
      // Add the cards to the target pile
      if (cardsToMove.length > 0) {
        newTableau[targetPileIndex] = [...newTableau[targetPileIndex], ...cardsToMove];
        
        setTableau(newTableau);
        soundManager.play('cardDrop');
        updateScore(5); // Points for a valid move
        incrementMoves();
        validDrop = true;

        // Find the card to animate after the DOM updates
        setTimeout(() => {
          const tableauPiles = document.querySelectorAll('.pile');
          if (tableauPiles && tableauPiles[targetPileIndex]) {
            const lastCard = tableauPiles[targetPileIndex].querySelector('.playing-card:last-child');
            if (lastCard) {
              lastCard.classList.add('successful-move');
            }
          }
        }, 50);
      
      }
    } else {
      if (settings.movesPenalty) {
        updateScore(-5); // Penalty for invalid move
        toast.error("Invalid move!");
        soundManager.play('invalidDrop');
        validDrop = false;
      }
    }
  };
  // Update score
  const updateScore = (points) => {
    setGameState(prev => ({
      ...prev,
      score: Math.max(0, prev.score + (points * settings.scoringMultiplier))
    }));
  };

  // Increment moves counter
  const incrementMoves = () => {
    setGameState(prev => ({
      ...prev,
      moves: prev.moves + 1
    }));
  };

  // Give hint
  const giveHint = () => {
    if (gameState.hintsRemaining <= 0) {
      toast.error("No hints remaining!");
      return;
    }

    // Look for possible moves
    let hint = null;

    // Check waste to foundation
    if (waste.length > 0) {
      const wasteCard = waste[waste.length - 1];
      const foundationIndex = getValidFoundationMove(wasteCard);
      if (foundationIndex !== -1) {
        hint = `Move ${formatCardName(wasteCard)} from waste to foundation pile ${foundationIndex + 1}`;
      }
    }

    // Check tableau to foundation
    if (!hint) {
      for (let i = 0; i < tableau.length; i++) {
        const pile = tableau[i];
        if (pile.length > 0) {
          const card = pile[pile.length - 1];
          if (card.faceUp) {
            const foundationIndex = getValidFoundationMove(card);
            if (foundationIndex !== -1) {
              hint = `Move ${formatCardName(card)} from tableau pile ${i + 1} to foundation pile ${foundationIndex + 1}`;
              break;
            }
          }
        }
      }
    }

    // Check tableau to tableau
    if (!hint) {
      for (let i = 0; i < tableau.length; i++) {
        const sourcePile = tableau[i];
        
        // Find first face-up card in source pile
        let firstFaceUpIndex = sourcePile.findIndex(card => card.faceUp);
        if (firstFaceUpIndex === -1) continue;
        
        // Try each face-up card
        for (let j = firstFaceUpIndex; j < sourcePile.length; j++) {
          const card = sourcePile[j];
          
          // Try each target pile
          for (let k = 0; k < tableau.length; k++) {
            if (i === k) continue; // Skip same pile
            
            const targetPile = tableau[k];
            
            // Check if move is valid
            if (targetPile.length === 0) {
              // Empty pile accepts King
              if (card.value === 13) {
                hint = `Move ${formatCardName(card)} from tableau pile ${i + 1} to empty tableau pile ${k + 1}`;
                break;
              }
            } else {
              // Non-empty pile
              const targetCard = targetPile[targetPile.length - 1];
              if (targetCard.faceUp && 
                  targetCard.color !== card.color && 
                  targetCard.value === card.value + 1) {
                hint = `Move ${formatCardName(card)} from tableau pile ${i + 1} to tableau pile ${k + 1}`;
                break;
              }
            }
          }
          
          if (hint) break;
        }
        
        if (hint) break;
      }
    }

    // Check stock
    if (!hint && stock.length > 0) {
      hint = "Draw new cards from the stock";
    }

    // If no hint found
    if (!hint) {
      hint = "No valid moves found. Try drawing cards or recycling the waste pile.";
    }

    // Show hint and decrement counter
    toast.info(hint);
    setGameState(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1,
      hintsRemaining: prev.hintsRemaining - 1
    }));
  };

  // Format card name for hints
  const formatCardName = (card) => {
    const valueNames = {
      1: 'Ace',
      11: 'Jack',
      12: 'Queen',
      13: 'King'
    };
    
    const valueName = valueNames[card.value] || card.value.toString();
    return `${valueName} of ${card.suit.charAt(0).toUpperCase() + card.suit.slice(1)}`;
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setSoundVolume(newVolume);
    soundManager.setVolume(newVolume);
    soundManager.play('cardSelect'); // Play a sound to demonstrate volume
  };
  
  // Create flying card animations
  const createFlyingCards = () => {
    const cards = [];
    for (let i = 0; i < 20; i++) {
      // Random position values
      const left = Math.random() * window.innerWidth;
      const top = Math.random() * window.innerHeight;
      
      // Random end position
      const tx = (Math.random() - 0.5) * window.innerWidth * 2;
      const ty = -window.innerHeight - Math.random() * 300;
      const rotate = (Math.random() - 0.5) * 720; // -360 to 360 degrees
      
      // Random card color (red or black)
      const isRed = Math.random() > 0.5;
      
      cards.push({
        id: i,
        left,
        top,
        style: {
          left: `${left}px`,
          top: `${top}px`,
          '--tx': `${tx}px`,
          '--ty': `${ty}px`,
          '--rotate': `${rotate}deg`,
          backgroundColor: isRed ? '#fef2f2' : '#ffffff',
          animationDelay: `${Math.random() * 1}s`,
          borderColor: isRed ? '#ef4444' : '#1e293b'
        }
      });
    }
    return cards;
  };
  
  // Play victory sound
  const playVictorySound = () => {
    const audio = new Audio();
    audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3';
    audio.volume = 0.5;
    if (soundManager.isMuted()) return; // Respect muted setting
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  // Handle game over 
  const handleGameOver = (isWin) => {
    setGameState(prev => ({
      ...prev,
      isGameOver: true,
      isGameWon: isWin
    }));
    
    setShowGameOver(true);

    if (isWin) {
      // Start victory celebrations
      setShowConfetti(true);
      playVictorySound();
      setFlyingCards(createFlyingCards());
      
      // Stop confetti after 7 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 7000);
      // Calculate final score based on time, moves, and difficulty
      const timeBonus = settings.timeLimit 
        ? Math.floor((settings.timeLimit - gameState.time) * 2) 
        : 0;
      
      const movesBonus = Math.max(0, 500 - (gameState.moves * 2));
      const difficultyBonus = {
        'Easy': 0,
        'Normal': 500,
        'Hard': 1000
      }[difficulty];

      const finalScore = gameState.score + timeBonus + movesBonus + difficultyBonus;
      
      setGameState(prev => ({
        ...prev,
        score: finalScore
      }));

      toast.success("You won! Congratulations!");
    } else {
      toast.error("Game over!");
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="relative">
      {/* Game Header */}
      <div className="mb-4 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <div className="card-neu px-4 py-2 flex items-center">
            <AwardIcon className="w-5 h-5 text-primary mr-2" />
            <span>Score: <strong>{Math.floor(gameState.score)}</strong></span>
          </div>
          
          <div className="card-neu px-4 py-2 flex items-center">
            <ClockIcon className="w-5 h-5 text-secondary mr-2" />
            <span>Time: <strong>
              {settings.timeLimit 
                ? `${formatTime(gameState.time)} / ${formatTime(settings.timeLimit)}`
                : formatTime(gameState.time)
              }
            </strong></span>
          </div>
          
          <div className="card-neu px-4 py-2 flex items-center">
            <ArrowRightIcon className="w-5 h-5 text-accent mr-2" />
            <span>Moves: <strong>{gameState.moves}</strong></span>
          </div>

          <div className="card-neu px-4 py-2 flex items-center cursor-pointer" onClick={() => setShowSettings(!showSettings)}>
            <button className="flex items-center">
              {soundManager.isMuted() ? <VolumeXIcon className="w-5 h-5 text-surface-500 mr-2" /> :
                soundVolume <= 0.5 ? <Volume1Icon className="w-5 h-5 text-secondary mr-2" /> :
                <VolumeIcon className="w-5 h-5 text-secondary mr-2" />}
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {settings.hintsAllowed > 0 && (
            <button 
              className="btn btn-outline flex items-center"
              onClick={giveHint}
              disabled={gameState.hintsRemaining <= 0 || gameState.isGameOver}
            >
              <LightbulbIcon className="w-4 h-4 mr-1" />
              Hint ({gameState.hintsRemaining})
            </button>
          )}
          
          <button 
            className="btn btn-outline flex items-center"
            onClick={() => setShowRules(true)}
          >
            <HelpCircleIcon className="w-4 h-4 mr-1" />
            Rules
          </button>
          
          <button 
            className="btn btn-primary flex items-center"
            onClick={initializeGame}
          >
            <RefreshIcon className="w-4 h-4 mr-1" />
            New Game
          </button>
          
          <button 
            className="btn btn-outline flex items-center"
            onClick={onRestart}
          >
            <HomeIcon className="w-4 h-4 mr-1" />
            Menu
          </button>
        </div>
      </div>

      {/* Sound Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 card p-4 bg-white dark:bg-surface-800 rounded-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <SettingsIcon className="w-5 h-5 mr-2 text-primary" />
                <h3 className="font-medium">Sound Settings</h3>
              </div>
              <button onClick={() => setShowSettings(false)} className="text-surface-500 hover:text-surface-700">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="settings-toggle" onClick={() => soundManager.toggleMute()}>
                  <div className={`settings-toggle-switch ${!soundManager.isMuted() ? 'bg-primary' : ''}`}>
                    <div className={!soundManager.isMuted() ? 'translate-x-5' : ''}></div>
                  </div>
                  <span>{soundManager.isMuted() ? 'Sound Off' : 'Sound On'}</span>
                </label>
              </div>

              <div className="space-y-2">
                <label className="flex items-center justify-between text-sm font-medium">
                  <span>Volume</span>
                  <span>{Math.round(soundVolume * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={soundVolume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                />
                <div className="flex justify-between text-xs text-surface-500">
                  <span>Quiet</span>
                  <span>Loud</span>
                </div>
              </div>

              <div className="text-sm text-surface-500">
                <p>Sound style is based on difficulty level.</p>
                <p className="mt-1"><strong>Easy:</strong> Muted, subtle sounds</p>
                <p><strong>Normal & Hard:</strong> More engaging sounds</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Difficulty Badge */}
      <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-secondary text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
        {difficulty} Mode
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-1 gap-6">
        {/* Foundation and Stock Area */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <div className="text-sm font-medium mb-1 text-surface-600 dark:text-surface-300">Draw Pile</div>
            <Deck 
              stock={stock} 
              waste={waste} 
              onDeckClick={handleDeckClick} 
              onCardDrop={handleCardDrop}
              drawCount={settings.drawCount}
            />
          </div>
          
          <div className="flex flex-col">
            <div className="text-sm font-medium mb-1 text-surface-600 dark:text-surface-300">Foundation Piles</div>
            <div className="grid grid-cols-4 gap-2">
              {foundation.map((pile, index) => (
                <Pile
                  key={`foundation-${index}`}
                  pile={pile}
                  pileIndex={index + 100} // Use index + 100 to distinguish from tableau
                  cards={pile}
                  onCardClick={() => {}}
                  onCardDrop={handleCardDrop}
                  type="foundation"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Tableau Area */}
        <div className="flex flex-col">
          <div className="text-sm font-medium mb-1 text-surface-600 dark:text-surface-300">Tableau</div>
          <div className="grid grid-cols-7 gap-2">
            {tableau.map((pile, index) => (
              <Pile
                key={`tableau-${index}`}
                pile={pile}
                pileIndex={index}
                cards={pile}
                onCardClick={handleCardClick}
                onCardDrop={handleCardDrop}
                type="tableau"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowRules(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-surface-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Game Rules</h2>
                <button onClick={() => setShowRules(false)} className="p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700">
                  <XIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Goal</h3>
                  <p>Move all cards to the foundation piles, building up from Ace to King in each suit.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Card Movement</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>In the <strong>tableau</strong>, cards must be placed in alternating colors (red/black) and descending order (King to Ace).</li>
                    <li>In the <strong>foundation</strong>, cards must be placed in the same suit and ascending order (Ace to King).</li>
                    <li>Only Kings can be placed on empty tableau piles.</li>
                    <li>Only Aces can be placed on empty foundation piles.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Difficulty: {difficulty}</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Draw count: <strong>{settings.drawCount} card{settings.drawCount > 1 ? 's' : ''}</strong> at a time</li>
                    <li>Time limit: <strong>{settings.timeLimit ? formatTime(settings.timeLimit) : 'None'}</strong></li>
                    <li>Scoring multiplier: <strong>x{settings.scoringMultiplier}</strong></li>
                    <li>Hints allowed: <strong>{settings.hintsAllowed === 999 ? 'Unlimited' : settings.hintsAllowed}</strong></li>
                    <li>Move penalties: <strong>{settings.movesPenalty ? 'Yes' : 'No'}</strong></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Controls</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Click on the draw pile to reveal new cards.</li>
                    <li>Drag cards to move them between piles.</li>
                    <li>Click on a face-down card to reveal it.</li>
                    <li>Click on a face-up card to automatically move it to a foundation pile (if possible).</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Scoring</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Move to foundation: <strong>+10 points</strong></li>
                    <li>Reveal card: <strong>+5 points</strong></li>
                    <li>Valid move: <strong>+5 points</strong></li>
                    <li>Recycling waste: <strong>-20 points</strong></li>
                    {settings.movesPenalty && (
                      <li>Invalid move: <strong>-5 points</strong></li>
                    )}
                    <li>All points are multiplied by the difficulty multiplier: <strong>x{settings.scoringMultiplier}</strong></li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {showGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: 0.3 } }}
            className={`fixed inset-0 ${gameState.isGameWon ? 'bg-black/30' : 'bg-black/50'} flex items-center justify-center p-4 z-50`}
          >
            {showConfetti && gameState.isGameWon && (
              <Confetti
                width={windowSize.width}
                height={windowSize.height}
                recycle={false}
                numberOfPieces={500}
                gravity={0.2}
              />
            )}
            
            {/* Flying cards animation */}
            {gameState.isGameWon && flyingCards.map(card => (
              <div 
                key={card.id} 
                className="flying-card" 
                style={card.style}
              ></div>
            ))}
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`bg-white dark:bg-surface-800 rounded-xl p-6 max-w-md w-full text-center shadow-xl ${gameState.isGameWon ? 'ring-4 ring-primary/20' : ''}`}
            >
              <div className="mb-4">
                {gameState.isGameWon ? (
                  <motion.div whileHover={{ rotate: 10 }} className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                    <TrophyIcon className="w-14 h-14 text-primary" />
                  </motion.div>
                ) : (
                  <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                    <ClockIcon className="w-12 h-12 text-red-500" />
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold mb-2">
                {gameState.isGameWon ? 'Congratulations!' : 'Game Over'}
              </h2>
              
              <h2 className={`${gameState.isGameWon ? 'text-3xl' : 'text-2xl'} font-bold mb-2 flex items-center justify-center`}>
                {gameState.isGameWon 
                  ? 'You successfully completed the game!' 
                  : 'Time\'s up! Better luck next time.'}
                {gameState.isGameWon && <StarIcon className="w-6 h-6 text-yellow-400 ml-2" />}
              </h2>
              
              {gameState.isGameWon && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-4"
                >
                  You mastered the challenge in <strong>{formatTime(gameState.time)}</strong> with <strong>{gameState.moves}</strong> moves!
                </motion.p>
              )}
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-100 dark:bg-surface-700 p-3 rounded-lg">
                  <div className="text-surface-500 text-sm">Score</div>
                  <div className="text-xl font-bold">{Math.floor(gameState.score)}</div>
                </div>
                <div className="bg-surface-100 dark:bg-surface-700 p-3 rounded-lg">
                  <div className="text-surface-500 text-sm">Time</div>
                  <div className="text-xl font-bold">{formatTime(gameState.time)}</div>
                </div>
                <div className="bg-surface-100 dark:bg-surface-700 p-3 rounded-lg">
                  <div className="text-surface-500 text-sm">Moves</div>
                  <div className="text-xl font-bold">{gameState.moves}</div>
                </div>
                <div className="bg-surface-100 dark:bg-surface-700 p-3 rounded-lg">
                  <div className="text-surface-500 text-sm">Difficulty</div>
                  <div className={`text-xl font-bold ${
                    difficulty === 'Easy' ? 'text-green-500' : 
                    difficulty === 'Normal' ? 'text-blue-500' : 
                    'text-purple-500'
                  }`}>{difficulty}</div>
                </div>
              </div>
              
              {gameState.isGameWon && (
                <motion.div 
                  className="mb-6 p-3 bg-primary/10 rounded-lg text-primary-dark"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <PartyPopperIcon className="w-5 h-5 mr-2" />
                    <span className="font-medium">Achievement Unlocked!</span>
                  </div>
                  <p className="text-sm">
                    {difficulty === 'Easy' ? 'Solitaire Novice' : 
                     difficulty === 'Normal' ? 'Solitaire Master' : 
                     'Solitaire Grandmaster'}
                  </p>
                </motion.div>
              )}

              <div className="flex space-x-4 justify-center">
                <button
                  className="btn btn-primary flex items-center"
                  onClick={() => {
                    setShowGameOver(false);
                    initializeGame();
                  }}
                >
                  <RefreshIcon className="w-4 h-4 mr-2" />
                  Play Again
                </button>
                <button
                  className="btn btn-outline flex items-center"
                  onClick={() => {
                    setShowGameOver(false);
                    onRestart();
                  }}
                >
                  <HomeIcon className="w-4 h-4 mr-2" />
                  Main Menu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainFeature;