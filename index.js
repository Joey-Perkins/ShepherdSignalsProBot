import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/telegram/${TOKEN}`;
const WEBHOOK_URL = `https://shepherdsignalsprobot.onrender.com${URI}`;

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
👋 <b>Bonjour et bienvenue ${name} !</b><br><br>
Je suis <b>Flock Manager</b>, ton bot assistant pour <b>Shepherd Signals Professional</b> 🚀<br><br>

<b>Shepherd Signals Professional</b> est un EA avancé pour <b>MetaTrader 5</b> qui transforme ton trading grâce à une intégration <i>Telegram</i> en temps réel.<br><br>

📲 <b>Compatible :</b> MetaTrader 5<br>
🔗 <b>Communauté :</b> @ShepherdSignalsProfessional<br>
📩 <b>Support :</b> lesbonnesaffaires2025@gmail.com<br><br>

👇 Découvre les <b>commandes disponibles</b> ci-dessous 👇`;

      await axios.post(`${TELEGRAM_API}/sendPhoto`, {
        chat_id: msg.chat.id,
        photo: IMAGES.intro,
        caption: text,
        parse_mode: "HTML",
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
          caption = "🧭 <b>Commandes disponibles</b><br>Choisis une section ci-dessous 👇";
          break;

        case "fonctionnalites":
          photo = IMAGES.features;
          caption = `🎯 <b>Fonctionnalités principales</b><br><br>
🚀 Copie automatique des signaux<br>
📩 Notifications instantanées<br>
📸 Captures automatiques<br>
⚖️ Gestion du risque<br>
🔔 Alertes en temps réel<br>
🖥 Interface multilingue 🇫🇷 🇬🇧 🇪🇸<br><br>
🔐 <i>Licence vérifiée en temps réel</i>`;
          break;

        case "installation":
          photo = IMAGES.install;
          caption = `🎛 <b>Tutoriel d'installation</b><br><br>
<b>1️⃣ Téléchargement :</b> ShepherdSignalsProfessional.ex5<br>
<b>2️⃣ Installation :</b> Copie le fichier dans <i>MQL5/Experts/</i><br>
<b>3️⃣ Active :</b> "Allow WebRequest"<br>
<b>4️⃣ Ajoute les URLs :</b><br>
&nbsp;&nbsp;• https://api.telegram.org<br>
&nbsp;&nbsp;• https://script.google.com<br>
&nbsp;&nbsp;• https://script.googleusercontent.com<br>
<b>5️⃣ Active l’EA</b> sur un graphique et configure ton token, chat ID et licence.`;
          break;

        case "mode_emploi":
          photo = IMAGES.mode;
          caption = `📖 <b>Mode d'emploi</b><br><br>
🧭 <b>Commandes principales :</b><br>
• ON/OFF → activer/désactiver<br>
• BUY/SELL → signaux manuels<br>
• BRIEFING → résumé quotidien<br>
• SCREENSHOT → capture immédiate<br><br>
🔔 <i>Alertes et surveillance automatiques incluses</i>`;
          break;

        case "licence":
          photo = IMAGES.licence;
          caption = `🔑 <b>Système de licence</b><br><br>
Activation automatique ✅<br>
Détection anti-fraude 🔒<br>
Multi-comptes 💼<br><br>
<b>Types :</b> DEMO • STARTER • PREMIUM • ULTIMATE • INFINITY`;
          break;

        case "achat":
          photo = IMAGES.achat;
          caption = `🛒 <b>Achat de l’EA</b><br><br>
💰 <b>STARTER</b> – 15 €/mois<br>
💰 <b>PREMIUM</b> – 40 €/3 mois<br>
💰 <b>ULTIMATE</b> – 120 €/an<br>
💰 <b>INFINITY</b> – 197 € unique<br><br>
💳 PayPal | Binance | MTN | VISA<br>
📩 <i>Contact :</i> @JoeyPerkins`;
          break;

        case "faq":
          photo = IMAGES.faq;
          caption = `❔ <b>FAQ</b><br><br>
<b>Q :</b> L’EA n’envoie pas de messages ?<br>
<b>R :</b> Vérifie WebRequest.<br><br>
<b>Q :</b> Comment obtenir mon Chat ID ?<br>
<b>R :</b> Envoie un message à @userinfobot.<br><br>
<b>Q :</b> Screenshots ne fonctionnent pas ?<br>
<b>R :</b> Vérifie le dossier MQL5/Files.<br><br>
📩 <i>Support :</i> lesbonnesaffaires2025@gmail.com`;
          break;

        case "contact":
          photo = IMAGES.contact;
          caption = `👥 <b>Support & Contact</b><br><br>
📧 lesbonnesaffaires2025@gmail.com<br>
📢 <a href="https://t.me/ShepherdSignalsProfessional">Canal Telegram</a><br><br>
🕘 Lun–Ven 9h–18h GMT<br>
🌍 FR / EN – Assistance complète`;
          break;

        case "apropos":
          photo = IMAGES.about;
          caption = `💡 <b>À propos</b><br><br>
<b>Shepherd Signals Professional</b> est un Expert Advisor conçu pour le suivi automatisé des performances avec alertes Telegram en temps réel et gestion intelligente du risque.<br><br>
<i>Version 1.0 – © 2025 Joey Perkins DJOMOL JOSEPH</i>`;
          break;

        case "back_main":
          caption = "⬅️ <b>Retour au menu principal</b>";
          markup = mainMenu;
          break;
      }

      await axios.post(`${TELEGRAM_API}/editMessageMedia`, {
        chat_id: id,
        message_id: cb.message.message_id,
        media: {
          type: "photo",
          media: photo,
          caption,
          parse_mode: "HTML"
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
