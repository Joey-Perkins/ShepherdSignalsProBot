import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = `https://flockmanager.onrender.com${URI}`;

// === Images (à personnaliser) ===
const IMAGES = {
  intro: "https://raw.githubusercontent.com/Joey-Perkins/ShepherdSignalsProBot/main/Logo.png",
  features: "https://raw.githubusercontent.com/Joey-Perkins/ShepherdSignalsProBot/main/Features.png",
  install: "https://raw.githubusercontent.com/Joey-Perkins/ShepherdSignalsProBot/main/Install.png",
  mode: "https://raw.githubusercontent.com/Joey-Perkins/ShepherdSignalsProBot/main/Mode.png",
  licence: "https://raw.githubusercontent.com/Joey-Perkins/ShepherdSignalsProBot/main/Licence.png",
  achat: "https://raw.githubusercontent.com/Joey-Perkins/ShepherdSignalsProBot/main/Achat.png",
  faq: "https://raw.githubusercontent.com/Joey-Perkins/ShepherdSignalsProBot/main/Faq.png",
  contact: "https://raw.githubusercontent.com/Joey-Perkins/ShepherdSignalsProBot/main/Contact.png",
  about: "https://raw.githubusercontent.com/Joey-Perkins/ShepherdSignalsProBot/main/About.png"
};

// === Menus ===
const mainMenu = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "📜 Commandes disponibles", callback_data: "menu_commandes" }]
    ]
  }
};

const commandesMenu = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "🎯 Fonctionnalités", callback_data: "fonctionnalites" }],
      [{ text: "🎛 Tutoriel d'installation", callback_data: "installation" }],
      [{ text: "📖 Mode d'emploi", callback_data: "mode_emploi" }],
      [{ text: "🔑 Système de licence", callback_data: "licence" }],
      [{ text: "🛒 Achat de l'EA", callback_data: "achat" }],
      [{ text: "❔ FAQ", callback_data: "faq" }],
      [{ text: "👥 Support / Contact", callback_data: "contact" }],
      [{ text: "💡 À propos", callback_data: "apropos" }],
      [{ text: "⬅️ Menu principal", callback_data: "back_main" }]
    ]
  }
};

// === Webhook principal ===
app.post(URI, async (req, res) => {
  const msg = req.body.message;
  const cb = req.body.callback_query;

  try {
    // === /start ===
    if (msg && msg.text === "/start") {
      const name = msg.from.first_name || "cher trader";
      const text = `
👋 *Bonjour et bienvenue ${name}\\!*  

Je suis *Flock Manager*, ton bot assistant pour *Shepherd Signals Professional* 🚀  

🌟 *Shepherd Signals Professional* transforme ton trading sur *MetaTrader 5* grâce à une intégration Telegram en temps réel\.  

📲 *Compatible* : MetaTrader 5  
🔗 *Communauté* : @ShepherdSignalsProfessional  
📩 *Support* : lesbonnesaffaires2025@gmail\\.com  

👇 Clique sur *Commandes disponibles* pour explorer mes rubriques 👇`;

      await axios.post(`${TELEGRAM_API}/sendPhoto`, {
        chat_id: msg.chat.id,
        photo: IMAGES.intro,
        caption: text,
        parse_mode: "MarkdownV2",
        ...mainMenu
      });
    }

    // === Boutons ===
    if (cb) {
      const id = cb.message.chat.id;
      const data = cb.data;
      let caption = "";
      let photo = IMAGES.intro;
      let markup = commandesMenu;

      switch (data) {
        case "menu_commandes":
          caption = "🧭 *Commandes disponibles* – choisis une section ci-dessous 👇";
          break;

        case "fonctionnalites":
          photo = IMAGES.features;
          caption = `🎯 *Fonctionnalités principales*  

• 🚀 Copie automatique des signaux  
• 📩 Notifications instantanées  
• 📸 Captures automatiques  
• ⚖️ Gestion du risque  
• 🔔 Alertes en temps réel  
• 🖥 Interface multilingue 🇫🇷 🇬🇧 🇪🇸  

🔐 *Licence vérifiée en temps réel*`;
          break;

        case "installation":
          photo = IMAGES.install;
          caption = `🎛 *Tutoriel d'installation*  

1️⃣ Télécharge \`ShepherdSignalsProfessional.ex5\`  
2️⃣ Colle-le dans *MQL5/Experts/*  
3️⃣ Active *Allow WebRequest*  
4️⃣ Ajoute :  
• https://api\\.telegram\\.org  
• https://script\\.google\\.com  
• https://script\\.googleusercontent\\.com  
5️⃣ Glisse l’EA sur un graphique et configure tes paramètres`;
          break;

        case "mode_emploi":
          photo = IMAGES.mode;
          caption = `📖 *Mode d'emploi*  

• ON/OFF → activer/désactiver  
• BUY/SELL → signaux manuels  
• BRIEFING → résumé quotidien  
• SCREENSHOT → capture immédiate  

🔔 *Alertes et surveillances automatiques incluses*`;
          break;

        case "licence":
          photo = IMAGES.licence;
          caption = `🔑 *Système de licence*  

Activation automatique ✅  
Anti-fraude 🔒  
Multi-comptes 💼  

Licences : DEMO • STARTER • PREMIUM • ULTIMATE • INFINITY`;
          break;

        case "achat":
          photo = IMAGES.achat;
          caption = `🛒 *Achat de l’EA*  

💰 STARTER – 15 €/mois  
💰 PREMIUM – 40 €/3 mois  
💰 ULTIMATE – 120 €/an  
💰 INFINITY – 197 € unique  

💳 PayPal | Binance | MTN | VISA  
📩 Contact : @JoeyPerkins`;
          break;

        case "faq":
          photo = IMAGES.faq;
          caption = `❔ *FAQ*  

• L’EA n’envoie pas de messages ? → Vérifie WebRequest  
• Obtenir mon Chat ID ? → @userinfobot  
• Screenshots ? → Vérifie MQL5/Files  

📩 Support : lesbonnesaffaires2025@gmail\\.com`;
          break;

        case "contact":
          photo = IMAGES.contact;
          caption = `👥 *Support & Contact*  

📧 lesbonnesaffaires2025@gmail\\.com  
📢 https://t\\.me/ShepherdSignalsProfessional  

🕘 Lun-Ven 9h-18h GMT  
🌍 FR / EN – Assistance complète`;
          break;

        case "apropos":
          photo = IMAGES.about;
          caption = `💡 *À propos*  

*Shepherd Signals Professional* suit tes performances MT5, envoie des alertes Telegram et optimise la gestion du risque\.  

© 2025 Joey Perkins DJOMOL JOSEPH`;
          break;

        case "back_main":
          caption = "⬅️ *Retour au menu principal*";
          markup = mainMenu;
          break;
      }

      // Mise à jour avec image
      await axios.post(`${TELEGRAM_API}/editMessageMedia`, {
        chat_id: id,
        message_id: cb.message.message_id,
        media: {
          type: "photo",
          media: photo,
          caption,
          parse_mode: "MarkdownV2"
        },
        ...markup
      });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Erreur :", err.message);
    res.sendStatus(500);
  }
});

// === Lancement ===
app.listen(3000, async () => {
  console.log("🤖 Flock Manager – Interactive Pro prêt !");
  await axios.post(`${TELEGRAM_API}/setWebhook`, { url: WEBHOOK_URL });
});
