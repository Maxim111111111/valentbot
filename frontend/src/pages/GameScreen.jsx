import React, { useState, useEffect, useRef } from "react";
import "../App.css";

export default function GameScreen({ cardId, onComplete, onCancel }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(true);
  const [hearts, setHearts] = useState([]);
  const [card, setCard] = useState(null);
  const [multiplier, setMultiplier] = useState(1);
  const [multiplierUntil, setMultiplierUntil] = useState(null);
  const [spawnIntervalMs, setSpawnIntervalMs] = useState(600);
  const gameContainerRef = useRef(null);
  const heartIdRef = useRef(0);
  const savedRef = useRef(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setGameActive(false);
      if (!savedRef.current) saveResult();
      return;
    }

    if (!gameActive) return;

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, gameActive]);

  // Spawn hearts with dynamic interval and types
  useEffect(() => {
    if (!gameActive) return;
    let intervalId = null;

    const spawnHeart = () => {
      const id = heartIdRef.current++;
      // Decide heart type
      const roll = Math.random();
      let type = "normal"; // normal, golden, bomb, slow, multiplier
      if (roll < 0.06)
        type = "bomb"; // 6%
      else if (roll < 0.14)
        type = "golden"; // 8%
      else if (roll < 0.18)
        type = "slow"; // 4%
      else if (roll < 0.22) type = "mult"; // 4%

      const heart = {
        id,
        left: Math.random() * 80 + 10,
        top: Math.random() * 60 + 10,
        type,
      };
      setHearts((prev) => [...prev, heart]);

      // remove after duration
      const life = card?.game_duration_ms || 2000 || 2000;
      const timeout = setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== id));
      }, life);
      return () => clearTimeout(timeout);
    };

    intervalId = setInterval(spawnHeart, spawnIntervalMs);
    return () => clearInterval(intervalId);
  }, [gameActive, spawnIntervalMs, card]);

  const handleHeartClick = (id, type) => {
    setHearts((prev) => prev.filter((h) => h.id !== id));
    if (type === "bomb") {
      setScore((prev) => Math.max(0, prev - 2));
      return;
    }

    if (type === "slow") {
      // slow spawning temporarily
      setSpawnIntervalMs((s) => s + 400);
      setTimeout(() => setSpawnIntervalMs((s) => Math.max(250, s - 400)), 4000);
      setScore((prev) => prev + 1 * multiplier);
      return;
    }

    if (type === "mult") {
      setMultiplier(2);
      setMultiplierUntil(Date.now() + 5000);
      setTimeout(() => setMultiplier(1), 5000);
      setScore((prev) => prev + 1 * multiplier);
      return;
    }

    // golden or normal
    if (type === "golden") setScore((prev) => prev + 3 * multiplier);
    else setScore((prev) => prev + 1 * multiplier);
  };

  const saveResult = async () => {
    try {
      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      const response = await fetch("/api/game-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      savedRef.current = true;
      onComplete(data.score);
    } catch (err) {
      console.error(err);
      savedRef.current = true;
      onComplete(score);
    }
  };

  // fetch card data (to get game_type / effects)
  useEffect(() => {
    fetch(`/api/cards/${cardId}`)
      .then((r) => r.json())
      .then((c) => {
        setCard(c);
        // map game type to difficulty
        const g = c.game_type || "catch_hearts";
        if (g === "catch_hearts") {
          setTimeLeft(30);
          setSpawnIntervalMs(600);
        } else if (g === "reaction") {
          setTimeLeft(20);
          setSpawnIntervalMs(450);
        } else if (g === "precision") {
          setTimeLeft(25);
          setSpawnIntervalMs(700);
        } else if (g === "hunt") {
          setTimeLeft(35);
          setSpawnIntervalMs(500);
        }
      })
      .catch((e) => console.error(e));
  }, [cardId]);

  return (
    <div className="screen" style={{ backgroundColor: "#667eea" }}>
      <div style={{ width: "100%", maxWidth: "600px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            color: "white",
          }}
        >
          <div className="score-display" style={{ margin: 0 }}>
            ⭐ {score}
          </div>
          <div className="timer">⏱ {timeLeft}s</div>
        </div>

        <div
          ref={gameContainerRef}
          className="game-canvas"
          style={{ position: "relative", overflow: "hidden" }}
        >
          {hearts.map((heart) => (
            <button
              key={heart.id}
              onClick={() => handleHeartClick(heart.id, heart.isGolden)}
              style={{
                position: "absolute",
                left: heart.left + "%",
                top: heart.top + "%",
                width: "50px",
                height: "50px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: heart.isGolden ? "40px" : "30px",
                animation: "pulse 0.5s ease-in-out",
              }}
            >
              {heart.isGolden ? "💛" : "❤️"}
            </button>
          ))}

          {!gameActive && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "24px",
              }}
            >
              Время вышло! 🎉
            </div>
          )}
        </div>

        {!gameActive && (
          <div
            style={{
              marginTop: "20px",
              textAlign: "center",
              color: "white",
            }}
          >
            <h2 style={{ fontSize: "32px", marginBottom: "20px" }}>
              Итог: {score} очков! 🎊
            </h2>
            <p>Загрузка результатов...</p>
          </div>
        )}

        <button
          className="btn-secondary"
          onClick={onCancel}
          style={{ marginTop: "20px" }}
          disabled={!gameActive}
        >
          ← Отмена
        </button>
      </div>
    </div>
  );
}
