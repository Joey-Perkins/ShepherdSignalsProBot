import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = `https://shepherdsignalsprobot.onrender.com${URI}`;

const mainMenu = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "🎛️ Installation", callback_data: "installation" }],
      [{ text: "🔑 Licences", callback_data: "licences" }],
      [{ text: "🛒 Acheter l’EA", callback_data: "achat" }],
      [{ text: "💬 Support / Contact", callback_data: "contact" }],
      [{ text: "📖 À propos", callback_data: "about" }]
    ]
  }
};

const backButton = {
  reply_markup: {
    inline_keyboard: [[{ text: "↩️ Retour", callback_data: "back" }]]
  }
};

app.post(URI, async (req, res) => {
  const message = req.body.message;
  const callback = req.body.callback_query;

  try {
    // --- Démarrage du bot ---
    if (message && message.text === "/start") {
      const name = message.from.first_name || "trader";
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: message.chat.id,
        text: `👋 Bonjour ${name} !\nBienvenue sur *Shepherd Signals Professional Bot*.\n\nJe suis ton assistant pour découvrir, installer et gérer ton EA.`,
        parse_mode: "Markdown",
        ...mainMenu,
      });
    }

    // --- Gestion des boutons ---
    if (callback) {
      const chatId = callback.message.chat.id;
      const data = callback.data;

      let text = "";
      let markup = backButton;

      switch (data) {
        case "installation":
          text = "🧩 *Installation de l’EA*\n\n1️⃣ Ouvre MetaTrader5\n2️⃣ Clique sur *Fichier → Ouvrir le dossier de données*\n3️⃣ Colle le fichier `.ex5` dans `MQL5/Experts`\n4️⃣ Recharge MetaTrader et glisse l’EA sur un graphique.\n\n✅ N’oublie pas d’autoriser les *WebRequests* pour :\nhttps://api.telegram.org\nhttps://script.google.com";
          break;

        case "licences":
          text = "🔑 *Types de licences*\n\n- 🧪 *Démo*: valide 7 jours\n- 💼 *Standard*: 1 compte, renouvelable\n- 👑 *Pro*: multi-compte + alertes premium\n\n👉 Contacte le support pour obtenir ta clé.";
          break;

        case "achat":
          text = "🛒 *Acheter l’EA*\n\nPrix actuel : 49€ (offre limitée)\nModes de paiement : *PayPal, Binance, MTN Mobile Money*\n\n📩 Contacte-nous pour acheter ta licence : @ShepherdSignalsProfessional";
          break;

        case "contact":
          text = "💬 *Support et Contact*\n\n📧 Email : lesbonnesaffaires2025@gmail.com\n📱 Telegram : @ShepherdSignalsProfessional\n🌐 Site web : bientôt disponible.";
          break;

        case "about":
          text = "📖 *À propos*\n\nShepherd Signals Professional est un EA conçu pour le *suivi automatisé des performances*, avec alertes Telegram en temps réel et gestion intelligente des risques.\n\n© 2025 Joey Perkins DJ.";
          break;

        case "back":
          text = "⬅️ Retour au menu principal.";
          markup = mainMenu;
          break;
      }

      await axios.post(`${TELEGRAM_API}/editMessageText`, {
        chat_id: chatId,
        message_id: callback.message.message_id,
        text,
        parse_mode: "Markdown",
        ...markup
      });
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Erreur :", error.message);
    res.sendStatus(500);
  }
});

app.listen(3000, async () => {
  console.log("Bot Shepherd Signals Pro démarré sur Render");
  await axios.post(`${TELEGRAM_API}/setWebhook`, {
    url: WEBHOOK_URL,
  });
});
