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

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 20 * 1024 * 1024) {
      setMedia(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview({
          src: e.target.result,
          type: file.type.split("/")[0],
        });
      };
      reader.readAsDataURL(file);
    } else {
      alert("Файл должен быть не больше 20MB");
    }
  };

  const handleNextStep = () => {
    if (!recipientName.trim()) {
      alert("Введите имя получателя");
      return;
    }
    if (!isAnonymous && !senderName.trim()) {
      alert("Введите ваше имя или отметьте анонимную отправку");
      return;
    }
    if (!messageText.trim()) {
      alert("Введите текст поздравления");
      return;
    }
    setStep(2);
  };

  const handleCreateCard = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("recipient_name", recipientName);
      formData.append("sender_name", senderName);
      formData.append("is_anonymous", isAnonymous);
      formData.append("message_text", messageText);
      if (media) {
        formData.append("media", media);
      }

      const response = await fetch("/api/cards", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Ошибка создания валентинки");
      const data = await response.json();
      onCardCreated(data.id);
    } catch (err) {
      console.error(err);
      alert("Ошибка создания валентинки");
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="screen">
        <div className="container">
          <h1>💌 Создать валентинку</h1>

          <div className="form-group">
            <label>Имя получателя *</label>
            <input
              type="text"
              placeholder="Введите имя..."
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Ваше имя *</label>
            <input
              type="text"
              placeholder="Введите имя..."
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              disabled={isAnonymous}
            />
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            <label htmlFor="anonymous">Отправить анонимно</label>
          </div>

          <div className="form-group">
            <label>Текст поздравления *</label>
            <textarea
              placeholder="Напишите ваше поздравление..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            ></textarea>
          </div>

          <button className="btn-primary" onClick={handleNextStep}>
            Далее →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="container">
        <h1>📸 Добавить медиа</h1>
        <p>Фото, GIF или видео (до 20MB)</p>

        <div className="form-group file-input">
          <label htmlFor="media" className="file-label">
            {mediaPreview ? "✓ Файл загружен" : "📁 Выберите файл"}
          </label>
          <input
            id="media"
            type="file"
            accept="image/jpeg,image/png,image/gif,video/mp4"
            onChange={handleMediaChange}
          />
        </div>

        {mediaPreview && (
          <div className="file-preview">
            {mediaPreview.type === "image" ? (
              <img src={mediaPreview.src} alt="preview" />
            ) : (
              <video src={mediaPreview.src} controls />
            )}
          </div>
        )}

        <button
          className="btn-primary"
          onClick={handleCreateCard}
          disabled={loading}
        >
          {loading ? "Создание..." : "🎉 Создать"}
        </button>

        <button className="btn-secondary" onClick={() => setStep(1)}>
          ← Назад
        </button>
      </div>
    </div>
  );
}
