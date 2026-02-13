import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "../App.css";

export default function ViewCard({ cardId, onPlayGame, onBack }) {
  // screens: intro -> reveal -> engage -> card -> game
  const [screen, setScreen] = useState("intro");
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taps, setTaps] = useState(0);
  const audioCtxRef = useRef(null);

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
    // readiness for Telegram WebApp
    if (screen === "intro" && window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.ready();
      } catch (e) {}
    }
  }, [screen]);

  const triggerConfetti = () => {
    // returns a function that plays a short tone for the given type
    return (type = "default") => {
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (
            window.AudioContext || window.webkitAudioContext
          )();
        }
        const ctx = audioCtxRef.current;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        if (type === "short_chime") o.frequency.value = 880;
        else if (type === "soft_bell") o.frequency.value = 440;
        else o.frequency.value = 520;
        g.gain.value = 0.001;
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        g.gain.exponentialRampToValueAtTime(
          type === "soft_bell" ? 0.18 : 0.28,
          ctx.currentTime + 0.02,
        );
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
        setTimeout(() => {
          try {
            o.stop();
          } catch (e) {}
        }, 600);
      } catch (e) {
        // ignore
      }
    };
  };

  // When we reach the card screen, trigger confetti/hearts based on effects
  useEffect(() => {
    if (!card) return;
    if (screen === "card") {
      // confetti
      if (card.effects?.confetti) triggerConfetti()();

      // spawn a few falling hearts if enabled
      if (card.effects?.hearts) {
        const heartsCount = 12;
        const hearts = [];
        for (let i = 0; i < heartsCount; i++) {
          const el = document.createElement("div");
          el.className = "falling-heart";
          el.textContent = "❤️";
          el.style.left = `${Math.random() * 100}%`;
          el.style.fontSize = `${16 + Math.random() * 24}px`;
          document.body.appendChild(el);
          hearts.push(el);
        }
        setTimeout(() => hearts.forEach((h) => h.remove()), 4000);
      }
    }
  }, [screen, card]);

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

  // --- Intro screen (Screen 1) ---
  if (screen === "intro") {
    return (
      <div className={`screen intro-screen theme-${card.theme || "pink"}`}>
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            ✨ Тебе пришла особенная валентинка...
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Нажми «Открыть», чтобы увидеть сюрприз
          </motion.p>

          <motion.button
            className="btn-primary"
            onClick={() => setScreen("reveal")}
            whileTap={{ scale: 0.96 }}
          >
            🎁 Открыть
          </motion.button>

          <div style={{ marginTop: 12 }}>
            <button className="btn-secondary" onClick={onBack}>
              ← Назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Reveal animation (Screen 2) ---
  if (screen === "reveal") {
    // play short sound + vibrate
    // play short sound + vibrate (use selected music if any)
    const soundFn = playOpenSound();
    soundFn(card.effects?.music || "default");
    try {
      if (navigator.vibrate) navigator.vibrate([40, 20, 30]);
    } catch (e) {}

    return (
      <div className={`screen reveal-screen theme-${card.theme || "pink"}`}>
        <div className="container">
          <motion.div
            className="reveal-frame"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            onAnimationComplete={() => setScreen("engage")}
          >
            <div className="reveal-center">💖</div>
          </motion.div>
        </div>
      </div>
    );
  }

  // --- Engage (Screen 3): require simple interaction before showing card ---
  if (screen === "engage") {
    return (
      <div className={`screen engage-screen theme-${card.theme || "pink"}`}>
        <div className="container">
          <h2>Немного магии — нажми на 3 сердца</h2>

          <div className="engage-row">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="engage-heart"
                onClick={() => setTaps((t) => t + 1)}
                whileTap={{ scale: 0.9 }}
              >
                ❤️
              </motion.div>
            ))}
          </div>

          <p>Нажато: {taps || 0}/3</p>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" onClick={() => setScreen("card")}>
              Пропустить
            </button>
            <button className="btn-secondary" onClick={onBack}>
              ← Назад
            </button>
          </div>

          {taps >= 3 &&
            (() => {
              setTimeout(() => setScreen("card"), 150);
              return null;
            })()}
        </div>
      </div>
    );
  }

  // --- Card display (Screen 4) ---
  if (screen === "card") {
    return (
      <div
        className={`screen card-screen theme-${card.theme || "pink"} font-${card.font_style || "sans"}`}
      >
        <div id="bg-layer" className="bg-layer" />
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
              setScreen("game");
              onPlayGame();
            }}
            whileTap={{ scale: 0.96 }}
          >
            🎮 Сыграть
          </motion.button>

          <motion.button
            className="btn-secondary"
            onClick={() => setScreen("intro")}
            whileTap={{ scale: 0.98 }}
          >
            ← Назад
          </motion.button>
        </div>
      </div>
    );
  }

  // --- Game screen (delegated to existing game component/state in App) ---
  if (screen === "game") {
    // Let parent handle game screen — just render a placeholder
    return (
      <div className="screen">
        <div className="container">
          <h1>Игра...</h1>
          <p>Если игра должна запуститься — вернитесь в карточку</p>
          <button className="btn-secondary" onClick={() => setScreen("card")}>
            ← Назад
          </button>
        </div>
      </div>
    );
  }

  return null;
}
