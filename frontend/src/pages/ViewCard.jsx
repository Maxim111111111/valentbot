import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
          <motion.button
            className="btn-primary pulse"
            onClick={() => {
              setScreen("card");
              triggerConfetti();
            }}
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            style={{ fontSize: "18px", padding: "20px" }}
          >
            🎁 Открыть
          </motion.button>
        </div>
      </div>
    );
  }

  if (screen === "card") {
    return (
      <div className="screen">
        <div className="container">
          {card.media_url && (
            <motion.div
              className="file-preview"
              style={{ marginBottom: "20px" }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
            >
              {card.media_type === "image" ? (
                <motion.img
                  src={card.media_url}
                  alt="Valentine"
                  initial={{ scale: 0.98 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6 }}
                  style={{ width: "100%", borderRadius: "12px" }}
                />
              ) : (
                <video
                  src={card.media_url}
                  controls
                  style={{ width: "100%" }}
                />
              )}
            </motion.div>
          )}

          <motion.div
            className="card-content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <h2>Привет, {card.recipient_name}! 👋</h2>
            <p style={{ marginTop: "20px", fontSize: "16px" }}>
              {card.message_text}
            </p>
            <p className="sender">
              От: {card.is_anonymous ? "Аноним 😊" : card.sender_name}
            </p>
          </motion.div>

          <motion.button
            className="btn-primary"
            onClick={() => {
              onPlayGame();
              setScreen("card");
            }}
            whileTap={{ scale: 0.96 }}
          >
            🎮 Сыграть
          </motion.button>

          <motion.button
            className="btn-secondary"
            onClick={() => setScreen("greeting")}
            whileTap={{ scale: 0.98 }}
          >
            ← Назад
          </motion.button>
        </div>
      </div>
    );
  }
}

// Simple confetti using emoji elements
function triggerConfetti() {
  const colors = ["#ff4d4f", "#ffb366", "#ffd666", "#ff85c0", "#b3f0ff"];
  const count = 24;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "confetti";
    el.style.left = `${Math.random() * 100}%`;
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.transform = `rotate(${Math.random() * 360}deg)`;
    el.textContent = ["✨", "🎉", "💖", "💌"][Math.floor(Math.random() * 4)];
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500 + Math.random() * 1000);
  }
}
