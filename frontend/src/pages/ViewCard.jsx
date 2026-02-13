import React, { useState, useEffect } from "react";
import "../App.css";

export default function ViewCard({ cardId, onPlayGame, onBack }) {
  const [screen, setScreen] = useState("greeting");
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/cards/${cardId}`)
      .then((r) => r.json())
      .then((data) => {
        setCard(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [cardId]);

  useEffect(() => {
    // Падающие сердечки на экране приветствия
    if (screen === "greeting") {
      const interval = setInterval(() => {
        const heart = document.createElement("div");
        heart.className = "falling-heart";
        heart.textContent = "❤️";
        heart.style.left = Math.random() * 100 + "%";
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 3000);
      }, 300);
      return () => clearInterval(interval);
    }
  }, [screen]);

  if (loading) {
    return (
      <div className="screen">
        <div className="container">
          <h1>Загрузка...</h1>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="screen">
        <div className="container">
          <h1>❌ Валентинка не найдена</h1>
          <button className="btn-primary" onClick={onBack}>
            ← Назад
          </button>
        </div>
      </div>
    );
  }

  if (screen === "greeting") {
    return (
      <div className="screen greeting-screen">
        <div className="greeting-content">
          <h1>💌 Тебе пришла валентинка!</h1>
          <div className="hearts-container">
            <div className="heart" style={{ left: "10%", top: "20%" }}>
              ❤️
            </div>
            <div className="heart" style={{ left: "30%", top: "50%" }}>
              💕
            </div>
            <div className="heart" style={{ left: "70%", top: "30%" }}>
              💖
            </div>
            <div className="heart" style={{ left: "90%", top: "60%" }}>
              💗
            </div>
          </div>
          <button
            className="btn-primary pulse"
            onClick={() => setScreen("card")}
            style={{ fontSize: "18px", padding: "20px" }}
          >
            🎁 Открыть
          </button>
        </div>
      </div>
    );
  }

  if (screen === "card") {
    return (
      <div className="screen">
        <div className="container">
          {card.media_url && (
            <div className="file-preview" style={{ marginBottom: "20px" }}>
              {card.media_type === "image" ? (
                <img src={card.media_url} alt="Valentine" />
              ) : (
                <video
                  src={card.media_url}
                  controls
                  style={{ width: "100%" }}
                />
              )}
            </div>
          )}

          <div className="card-content">
            <h2>Привет, {card.recipient_name}! 👋</h2>
            <p style={{ marginTop: "20px", fontSize: "16px" }}>
              {card.message_text}
            </p>
            <p className="sender">
              От: {card.is_anonymous ? "Аноним 😊" : card.sender_name}
            </p>
          </div>

          <button
            className="btn-primary"
            onClick={() => {
              onPlayGame();
              setScreen("card");
            }}
          >
            🎮 Сыграть
          </button>

          <button
            className="btn-secondary"
            onClick={() => setScreen("greeting")}
          >
            ← Назад
          </button>
        </div>
      </div>
    );
  }
}
