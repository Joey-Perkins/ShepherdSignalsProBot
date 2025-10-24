import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = `https://shepherdsignalsprobot.onrender.com/${URI}`; // adapte à ton nom Render

// === 🎛 Menus ===
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

// === 🧭 ROUTE WEBHOOK ===
app.post(URI, async (req, res) => {
  const message = req.body.message;
  const callback = req.body.callback_query;

  try {
    // === Message de démarrage ===
    if (message && message.text === "/start") {
      const name = message.from.first_name || "cher trader";

      const welcomeMessage = `
👋 *Bonjour et bienvenue ${name}\\!*  

Je suis *Flock Manager*, ton bot assistant officiel pour *Shepherd Signals Professional* 🚀  

🌟 *Shepherd Signals Professional* est un Expert Advisor (EA) avancé pour *MetaTrader 5*, combinant performance, sécurité et alertes Telegram en temps réel\.  

📲 *Compatible* : MetaTrader 5  
🔗 *Communauté Telegram* : @ShepherdSignalsProfessional  
📩 *Support* : lesbonnesaffaires2025@gmail\\.com  

👇 Clique sur *Commandes disponibles* pour explorer mes fonctionnalités 👇
      `;

      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: message.chat.id,
        text: welcomeMessage,
        parse_mode: "MarkdownV2",
        ...mainMenu,
      });
    }

    // === Gestion des boutons ===
    if (callback) {
      const chatId = callback.message.chat.id;
      const data = callback.data;

      let text = "";
      let markup = commandesMenu;

      switch (data) {
        case "menu_commandes":
          text = `🧭 *Commandes disponibles*  

Découvre ci\-dessous les principales rubriques du bot 👇`;
          break;

        case "fonctionnalites":
          text = `🎯 *Fonctionnalités principales*  

• 🚀 Copie automatique des signaux  
• 📩 Notifications instantanées Telegram  
• 📸 Captures de graphiques  
• 🧠 Briefing quotidien \(manuel & automatique\)  
• ⚖️ Gestion intelligente du risque  
• 🔔 Alertes en temps réel  
• 🖥 Interface intuitive et multilingue 🇫🇷 🇬🇧 🇪🇸  

🔐 *Sécurisé par licence en ligne vérifiée en temps réel*`;
          break;

        case "installation":
          text = `🎛 *Tutoriel d'installation*  

*Étape 1* \- Téléchargement  
• Fichier : \`Shepherd Signals Professional\\.ex5\`  

*Étape 2* \- Installation  
• Ouvre MetaTrader 5  
• Menu : *File → Open Data Folder*  
• Colle le fichier dans *MQL5/Experts/*  

*Étape 3* \- Configuration MT5  
• Menu : *Tools → Options → Expert Advisors*  
• Coche : *Allow WebRequest*  
• Ajoute :  
  • https://api\\.telegram\\.org  
  • https://script\\.google\\.com  
  • https://script\\.googleusercontent\\.com  

*Étape 4* \- Activation  
• Glisse l’EA sur un graphique  
• Remplis *botToken*, *chatID* et *clé licence*  
• Active *trading algorithmique*  

⏳ *Patiente quelques secondes pour l’activation complète*`;
          break;

        case "mode_emploi":
          text = `📖 *Mode d'emploi*  

1️⃣ *Configuration initiale*  
• Ajoute ton token et chat ID  
• Vérifie la licence  
• Active WebRequest  

2️⃣ *Boutons de contrôle*  
• ON/OFF → activer/désactiver  
• BUY/SELL → signaux manuels  
• PENDING → ordres différés  
• BRIEFING → résumé journalier  
• SCREENSHOT → capture instantanée  

3️⃣ *Alertes automatiques*  
• Envoi automatique des signaux  
• Briefings programmés  

4️⃣ *Surveillance du compte*  
• Équité en temps réel  
• Alertes sur marge et drawdown`;
          break;

        case "licence":
          text = `🔑 *Système de licence*  

💡 *Activation automatique en ligne*  
✅ Support multi\-comptes  
✅ Détection anti\-fraude  

*Types de licences* :  
• DEMO \- 10 jours  
• STARTER \- 30 jours  
• PREMIUM \- 90 jours  
• ULTIMATE \- 365 jours  
• INFINITY \- Illimitée  

🛡 *Fiabilité garantie et sécurité renforcée*`;
          break;

        case "achat":
          text = `🛒 *Achat de l'EA*  

💰 DEMO (10 jours) – 0 €
💰 STARTER – 15 €/mois  
💰 PREMIUM – 40 €/3 mois  
💰 ULTIMATE – 120 €/an  
💰 INFINITY – 197 € unique

💳 *Paiements acceptés* : PayPal, Binance, MTN, Orange Money, VISA ... etc 

📩 Contact direct : @JoeyPerkins`;
          break;

        case "faq":
          text = `❔ *Foire aux questions \(FAQ\)*  

*Q:* L’EA n’envoie pas de messages ?  
*A:* Vérifie les WebRequest et tokens\.  

*Q:* Comment obtenir mon Chat ID ?  
*A:* Écris à @userinfobot\.  

*Q:* Les captures ne fonctionnent pas ?  
*A:* Vérifie les permissions dans MQL5/Files\.  

*Q:* Compatible VPS ?  
*A:* Oui, 100\\% compatible\.  

📩 *Contact support* : lesbonnesaffaires2025@gmail\\.com`;
          break;

        case "contact":
          text = `👥 *Support & Contact*  

📧 Email : lesbonnesaffaires2025@gmail\\.com  
📢 Canal : https://t\\.me/ShepherdSignalsProfessional  
💬 Groupe privé : via le canal officiel  

🕘 Lun\-Ven, 9h\-18h GMT  
🌍 FR / EN  
🔧 Assistance installation & personnalisation`;
          break;

        case "apropos":
          text = `💡 *À propos de Shepherd Signals Professional*  

Un *Expert Advisor MQL5* pour le suivi automatisé des performances, les alertes Telegram et la gestion proactive du risque\.  

📦 Version : 1\\.0  
© 2025 *Joey Perkins DJOMOL JOSEPH*  
Tous droits réservés\.`;
          break;

        case "back_main":
          text = "⬅️ *Retour au menu principal*";
          markup = mainMenu;
          break;
      }

      await axios.post(`${TELEGRAM_API}/editMessageText`, {
        chat_id: chatId,
        message_id: callback.message.message_id,
        text,
        parse_mode: "MarkdownV2",
        ...markup,
      });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Erreur :", err.message);
    res.sendStatus(500);
  }
});

// === Démarrage serveur ===
app.listen(3000, async () => {
  console.log("🤖 Flock Manager (version Premium) est en ligne !");
  await axios.post(`${TELEGRAM_API}/setWebhook`, { url: WEBHOOK_URL });
});
