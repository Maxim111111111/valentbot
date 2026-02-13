#!/usr/bin/env bash

# Скрипт для инициализации и запуска приложения

# Сборка фронтенда
echo "🔨 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Запуск сервера
echo "🚀 Starting server..."
npm start
