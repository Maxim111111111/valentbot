import React, { useState, useEffect, useRef } from 'react';
import '../App.css';

export default function GameScreen({ cardId, onComplete, onCancel }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [gameActive, setGameActive] = useState(true);
  const [hearts, setHearts] = useState([]);
  const gameContainerRef = useRef(null);
  const heartIdRef = useRef(0);

  useEffect(() => {
    if (timeLeft <= 0) {
      setGameActive(false);
      saveResult();
      return;
    }

    if (!gameActive) return;

    const timer = setTimeout(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, gameActive]);

  useEffect(() => {
    if (!gameActive) return;

    const spawnHeart = () => {
      const id = heartIdRef.current++;
      const isGolden = Math.random() < 0.1; // 10% шанс золотого сердца
      const heart = {
        id,
        left: Math.random() * 80 + 10,
        top: Math.random() * 60 + 10,
        isGolden,
        clicked: false,
      };
      setHearts(prev => [...prev, heart]);

      // Удаляем сердце через 2 секунды
      const timeout = setTimeout(() => {
        setHearts(prev => prev.filter(h => h.id !== id));
      }, 2000);

      return () => clearTimeout(timeout);
    };

    const interval = setInterval(spawnHeart, 300);
    return () => clearInterval(interval);
  }, [gameActive]);

  const handleHeartClick = (id, isGolden) => {
    setHearts(prev => prev.filter(h => h.id !== id));
    setScore(prev => prev + (isGolden ? 3 : 1));
  };

  const saveResult = async () => {
    try {
      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      const response = await fetch('/api/game-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_id: cardId,
          score: score,
          initData: window.Telegram?.WebApp?.initData,
          telegramUserId: tgUser?.id,
          username: tgUser?.username,
          firstName: tgUser?.first_name,
        }),
      });

      const data = await response.json();
      onComplete(data.score);
    } catch (err) {
      console.error(err);
      onComplete(score);
    }
  };

  return (
    <div className="screen" style={{ backgroundColor: '#667eea' }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          color: 'white'
        }}>
          <div className="score-display" style={{ margin: 0 }}>
            ⭐ {score}
          </div>
          <div className="timer">
            ⏱ {timeLeft}s
          </div>
        </div>

        <div
          ref={gameContainerRef}
          className="game-canvas"
          style={{ position: 'relative', overflow: 'hidden' }}
        >
          {hearts.map(heart => (
            <button
              key={heart.id}
              onClick={() => handleHeartClick(heart.id, heart.isGolden)}
              style={{
                position: 'absolute',
                left: heart.left + '%',
                top: heart.top + '%',
                width: '50px',
                height: '50px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: heart.isGolden ? '40px' : '30px',
                animation: 'pulse 0.5s ease-in-out',
              }}
            >
              {heart.isGolden ? '💛' : '❤️'}
            </button>
          ))}

          {!gameActive && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
            }}>
              Время вышло! 🎉
            </div>
          )}
        </div>

        {!gameActive && (
          <div style={{
            marginTop: '20px',
            textAlign: 'center',
            color: 'white',
          }}>
            <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>
              Итог: {score} очков! 🎊
            </h2>
            <p>Загрузка результатов...</p>
          </div>
        )}

        <button 
          className="btn-secondary" 
          onClick={onCancel}
          style={{ marginTop: '20px' }}
          disabled={!gameActive}
        >
          ← Отмена
        </button>
      </div>
    </div>
  );
}
