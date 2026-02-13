import React, { useState, useEffect } from "react";
import "./App.css";
import CreateCard from "./pages/CreateCard";
import ViewCard from "./pages/ViewCard";
import GameScreen from "./pages/GameScreen";
import ResultsScreen from "./pages/ResultsScreen";

function App() {
  const [screen, setScreen] = useState("home");
  const [cardId, setCardId] = useState(null);
  const [gameResult, setGameResult] = useState(null);

  useEffect(() => {
    // Инициализация Telegram Web App
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setBackgroundColor("#ffffff");
    }

    // Проверяем URL параметры для загрузки карточки
    const params = new URLSearchParams(window.location.search);
    let startParam = params.get("startapp");

    // Fallback: try Telegram WebApp init data (start parameter may be passed there)
    try {
      const tg = window.Telegram && window.Telegram.WebApp;
      if (!startParam && tg && tg.initDataUnsafe) {
        const unsafe = tg.initDataUnsafe;
        startParam =
          unsafe.start_param ||
          unsafe.startPayload ||
          unsafe.start_payload ||
          unsafe.start ||
          startParam;
      }
    } catch (e) {
      // ignore
    }

    // Fallback: check path like /card/:id or trailing id
    if (!startParam) {
      const pathMatch = window.location.pathname.match(
        /card\/(.+)|\/([0-9a-fA-F-]{6,})$/,
      );
      if (pathMatch) startParam = pathMatch[1] || pathMatch[2];
    }

    if (startParam) {
      setCardId(startParam);
      setScreen("view");
    }
  }, []);

  const handleCreateCard = (id) => {
    setCardId(id);
    setScreen("share");
  };

  const handleStartGame = () => {
    setScreen("game");
  };

  const handleGameComplete = (score) => {
    setGameResult({ score, cardId });
    setScreen("results");
  };

  const handleBackHome = () => {
    setScreen("home");
    setCardId(null);
    setGameResult(null);
  };

  return (
    <div className="app">
      {screen === "home" && (
        <CreateCard
          onCardCreated={handleCreateCard}
          onViewCard={() => setScreen("view")}
        />
      )}
      {screen === "view" && cardId && (
        <ViewCard
          cardId={cardId}
          onPlayGame={handleStartGame}
          onBack={handleBackHome}
        />
      )}
      {screen === "game" && cardId && (
        <GameScreen
          cardId={cardId}
          onComplete={handleGameComplete}
          onCancel={() => setScreen("view")}
        />
      )}
      {screen === "results" && gameResult && (
        <ResultsScreen result={gameResult} onNewCard={handleBackHome} />
      )}
      {screen === "share" && cardId && (
        <ShareCard cardId={cardId} onBack={handleBackHome} />
      )}
    </div>
  );
}

// Компонент для поделиться
function ShareCard({ cardId, onBack }) {
  const [card, setCard] = useState(null);

  useEffect(() => {
    fetch(`/api/cards/${cardId}`)
      .then((r) => r.json())
      .then(setCard)
      .catch((err) => console.error(err));
  }, [cardId]);

  // Use Telegram deep link `start` so bot receives payload and can send web_app button
  const shareUrl = `https://t.me/valentinmvbot?start=${cardId}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "💌 Valentine Game",
        text: `${card?.sender_name} отправил(а) тебе валентинку!`,
        url: shareUrl,
      });
    } else {
      // Fallback для копирования в буфер обмена
      navigator.clipboard.writeText(shareUrl);
      alert("Ссылка скопирована!");
    }
  };

  return (
    <div className="screen share-screen">
      <div className="container">
        <div className="success-icon">✨</div>
        <h1>Валентинка создана!</h1>
        <p>Поделись ссылкой с {card?.recipient_name}</p>

        <div className="share-url">
          <input type="text" value={shareUrl} readOnly />
          <button onClick={handleShare}>📤 Поделиться</button>
        </div>

        <button className="btn-secondary" onClick={onBack}>
          ← Назад
        </button>
      </div>
    </div>
  );
}

export default App;
