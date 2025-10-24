import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/telegram/${TOKEN}`;
const WEBHOOK_URL = `https://flockmanager.onrender.com${URI}`; // adapte si ton nom Render change

// === 🎛 Menus ===

// Bouton principal
const mainMenu = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "📜 Commandes disponibles", callback_data: "menu_commandes" }]
    ]
  }
};

// Boutons du sous-menu
const commandesMenu = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "🎯 Fonctionnalités", callback_data: "fonctionnalites" }],
      [{ text: "🎛 Tutoriel d'installation", callback_data: "installation" }],
      [{ text: "📖 Mode d'emploi", callback_data: "mode_emploi" }],
      [{ text: "🔑 Système de licence", callback_data: "licence" }],
      [{ text: "🛒 Achat de l'EA", callback_data: "achat" }]
