import React, { useState } from "react";
import "../App.css";

export default function CreateCard({ onCardCreated, onViewCard }) {
  const [step, setStep] = useState(1);
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cardType, setCardType] = useState("romantic");
  const [theme, setTheme] = useState("pink");
  const [fontStyle, setFontStyle] = useState("sans");
  const [effects, setEffects] = useState({
    hearts: true,
    confetti: true,
    animatedBg: "none",
    music: "none",
  });
  const [gameType, setGameType] = useState("catch_hearts");

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 20 * 1024 * 1024) {
      setMedia(file);
      const reader = new FileReader();
      reader.onload = (ev) => setMediaPreview({ src: ev.target.result, type: file.type.split("/")[0] });
      reader.readAsDataURL(file);
    } else {
      alert("Файл должен быть не больше 20MB");
    }
  };

  const handleNextStep = () => {
    if (!recipientName.trim()) return alert("Введите имя получателя");
    if (!isAnonymous && !senderName.trim()) return alert("Введите ваше имя или отметьте анонимную отправку");
    if (!messageText.trim()) return alert("Введите текст поздравления");
    setStep(3);
  };

  const handleCreateCard = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("recipient_name", recipientName);
      formData.append("sender_name", senderName);
      formData.append("is_anonymous", isAnonymous);
      formData.append("message_text", messageText);
      if (media) formData.append("media", media);
      formData.append("card_type", cardType);
      formData.append("theme", theme);
      formData.append("font_style", fontStyle);
      formData.append("effects", JSON.stringify(effects));
      formData.append("game_type", gameType);

      const res = await fetch("/api/cards", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Ошибка создания");
      const data = await res.json();
      onCardCreated?.(data.id);
    } catch (e) {
      console.error(e);
      alert("Ошибка создания валентинки");
    } finally {
      setLoading(false);
    }
  };

  // Step 1
  if (step === 1) {
    return (
      <div className="screen">
        <div className="container">
          <h1>💌 Создать валентинку</h1>

          <div className="form-group">
            <label>Тип валентинки</label>
            <div className="type-grid">
              {["romantic", "funny", "friend", "anonymous", "challenge"].map((t) => (
                <button
                  key={t}
                  className={`type-item ${cardType === t ? "active" : ""}`}
                  onClick={() => setCardType(t)}
                >
                  {t === "romantic" ? "💌 Романтическая" : t === "funny" ? "😎 Прикольная" : t === "friend" ? "🫂 Дружеская" : t === "anonymous" ? "🎭 Анонимный" : "🔥 Челлендж"}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Имя получателя *</label>
            <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Введите имя..." />
          </div>

          <div className="form-group">
            <label>Ваше имя *</label>
            <input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Введите имя..." disabled={isAnonymous} />
          </div>

          <div className="form-group checkbox-group">
            <input id="anonymous" type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
            <label htmlFor="anonymous">Отправить анонимно</label>
          </div>

          <div className="form-group">
            <label>Текст поздравления *</label>
            <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Напишите ваше поздравление..." />
          </div>

          <button className="btn-primary" onClick={handleNextStep}>Далее →</button>
        </div>
      </div>
    );
  }

  // Step 2 - media upload
  if (step === 2) {
    return (
      <div className="screen">
        <div className="container">
          <h1>📸 Добавить медиа</h1>
          <p>Фото, GIF или видео (до 20MB)</p>

          <div className="form-group file-input">
            <label htmlFor="media" className="file-label">{mediaPreview ? "✓ Файл загружен" : "📁 Выберите файл"}</label>
            <input id="media" type="file" accept="image/*,video/*" onChange={handleMediaChange} />
          </div>

          {mediaPreview && (
            <div className="file-preview">{mediaPreview.type === "image" ? <img src={mediaPreview.src} alt="preview" /> : <video src={mediaPreview.src} controls />}</div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" onClick={() => setStep(3)}>Далее →</button>
            <button className="btn-secondary" onClick={() => setStep(1)}>← Назад</button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3 - personalization
  if (step === 3) {
    return (
      <div className="screen">
        <div className="container">
          <h1>🎨 Персонализация</h1>

          <div className="form-group">
            <label>Тема</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="pink">Розовая</option>
              <option value="neon">Неон</option>
              <option value="dark">Тёмная</option>
            </select>
          </div>

          <div className="form-group">
            <label>Шрифт</label>
            <select value={fontStyle} onChange={(e) => setFontStyle(e.target.value)}>
              <option value="sans">Обычный</option>
              <option value="hand">Рукописный</option>
              <option value="serif">Элегантный</option>
            </select>
          </div>

          <div className="form-group">
            <label>Эффекты</label>
            <label><input type="checkbox" checked={effects.hearts} onChange={(e) => setEffects({ ...effects, hearts: e.target.checked })} /> Взрыв сердечек</label>
            <label><input type="checkbox" checked={effects.confetti} onChange={(e) => setEffects({ ...effects, confetti: e.target.checked })} /> Конфетти</label>

            <div style={{ marginTop: 12 }}>
              <label>Анимированный фон</label>
              <select value={effects.animatedBg} onChange={(e) => setEffects({ ...effects, animatedBg: e.target.value })}>
                <option value="none">Нет</option>
                <option value="stars">Звёзды</option>
                <option value="hearts">Падающие сердца</option>
                <option value="neon">Неон</option>
                <option value="fire">Огонь</option>
              </select>
            </div>

            <div style={{ marginTop: 8 }}>
              <label>Музыка при открытии</label>
              <select value={effects.music} onChange={(e) => setEffects({ ...effects, music: e.target.value })}>
                <option value="none">Нет</option>
                <option value="short_chime">Короткий звон</option>
                <option value="soft_bell">Мягкий звон</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" onClick={() => setStep(4)}>Далее →</button>
            <button className="btn-secondary" onClick={() => setStep(2)}>← Назад</button>
          </div>
        </div>
      </div>
    );
  }

  // Step 4 - game selection
  if (step === 4) {
    return (
      <div className="screen">
        <div className="container">
          <h1>Выбор игры</h1>
          <div className="form-group">
            <label>Игровой режим</label>
            <select value={gameType} onChange={(e) => setGameType(e.target.value)}>
              <option value="catch_hearts">Лови сердечки</option>
              <option value="reaction">Реакция</option>
              <option value="precision">Точный клик</option>
              <option value="hunt">Охота за редкими</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" onClick={() => setStep(5)}>Далее →</button>
            <button className="btn-secondary" onClick={() => setStep(3)}>← Назад</button>
          </div>
        </div>
      </div>
    );
  }

  // Step 5 - review
  if (step === 5) {
    return (
      <div className="screen">
        <div className="container">
          <h1>🔎 Просмотр</h1>
          <p><strong>Тип:</strong> {cardType}</p>
          <p><strong>Тема:</strong> {theme}</p>
          <p><strong>Шрифт:</strong> {fontStyle}</p>
          <p><strong>Эффекты:</strong> {Object.keys(effects).filter((k) => effects[k]).join(", ")}</p>
          <p><strong>Игра:</strong> {gameType}</p>

          {mediaPreview && (
            <div className="file-preview">{mediaPreview.type === "image" ? <img src={mediaPreview.src} alt="preview" /> : <video src={mediaPreview.src} controls />}</div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" onClick={handleCreateCard} disabled={loading}>{loading ? "Создание..." : "🎉 Создать"}</button>
            <button className="btn-secondary" onClick={() => setStep(4)}>← Назад</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
