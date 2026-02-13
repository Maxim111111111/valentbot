import React, { useState, useEffect } from 'react';
import '../App.css';

export default function ResultsScreen({ result, onNewCard }) {
  const [playerRank, setPlayerRank] = useState(null);
  const [topPlayers, setTopPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Конфетти эффект
    createConfetti();

    // Загружаем рейтинг и топ
    Promise.all([
      fetch('/api/rank')
        .then(r => r.json())
        .then(setPlayerRank),
      fetch('/api/top')
        .then(r => r.json())
        .then(setTopPlayers),
    ]).finally(() => setLoading(false));
  }, []);

  const createConfetti = () => {
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.textContent = ['🎉', '💝', '✨', '💕'][Math.floor(Math.random() * 4)];
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.top = '-10px';
      confetti.style.setProperty('--tx', (Math.random() - 0.5) * 200 + 'px');
      confetti.style.setProperty('--ty', window.innerHeight + 'px');
      confetti.style.fontSize = (Math.random() * 20 + 20) + 'px';
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 3000);
    }
  };

  const handleShare = () => {
    const text = `🎮 Я набрал ${result.score} очков в Valentine Game! Попробуй побить мой рекорд!`;
    if (navigator.share) {
      navigator.share({
        title: 'Valentine Game',
        text: text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Результат скопирован!');
    }
  };

  const getMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <div className="screen">
      <div className="container">
        <div className="success-icon">🎊</div>
        <h1>Результат: {result.score} очков!</h1>

        {!loading && playerRank && (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
              {playerRank.rank ? `Место: #${playerRank.rank}` : 'Ты в рейтинге!'}
            </div>
          </div>
        )}

        <h2 style={{ marginTop: '30px', marginBottom: '15px', textAlign: 'center' }}>
          🏆 Топ 10 игроков
        </h2>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#999' }}>Загрузка рейтинга...</p>
        ) : (
          <div className="top-list">
            {topPlayers.map((player, idx) => (
              <div
                key={idx}
                className="rank-item"
                style={{
                  background: idx < 3 ? '#f5f0ff' : 'transparent',
                  borderRadius: '8px',
                  paddingLeft: '15px',
                }}
              >
                <span className="medal">
                  {getMedal(idx + 1)}
                </span>
                <div className="rank-name">
                  {player.player_name || 'Аноним'}
                </div>
                <span className="rank-score">
                  {player.score} 🎯
                </span>
              </div>
            ))}
          </div>
        )}

        <button 
          className="btn-primary" 
          onClick={handleShare}
          style={{ marginTop: '30px' }}
        >
          📤 Поделиться результатом
        </button>

        <button 
          className="btn-secondary" 
          onClick={onNewCard}
        >
          💌 Создать свою валентинку
        </button>
      </div>
    </div>
  );
}
