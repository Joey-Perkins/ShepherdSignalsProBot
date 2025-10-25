import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = `https://shepherdsignalsprobot.onrender.com${URI}`; // adapte si ton nom Render change

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
      [{ text: "🛒 Achat de l'EA", callback_data: "achat" }],
      [{ text: "❔ FAQ", callback_data: "faq" }],
      [{ text: "👥 Support / Contact", callback_data: "contact" }],
      [{ text: "💡 À propos", callback_data: "apropos" }],
      [{ text: "⬅️ Menu principal", callback_data: "back_main" }]
    ]
  }
};

// === 🧭 Routes Webhook ===
app.post(URI, async (req, res) => {
  const message = req.body.message;
  const callback = req.body.callback_query;

  try {
    // === Démarrage du bot ===
    if (message && message.text === "/start") {
      const name = message.from.first_name || "cher trader";

      const welcomeMessage = `
👋 *Bonjour et bienvenue ${name} !*  

Je suis *Flock Manager*, ton assistant virtuel pour découvrir, installer, paramétrer et exploiter ton EA *Shepherd Signals Professional*.  

*Shepherd Signals Professional* est un Expert Advisor avancé pour *MetaTrader 5* qui transforme ton expérience de trading grâce à l’intégration Telegram en temps réel.  

📲 *Fonctionne sur MetaTrader 5*  
🔗 *Communauté Telegram* : @ShepherdSignalsProfessional  
📩 *Support* : lesbonnesaffaires2025@gmail.com  

👇 Clique sur *Commandes disponibles* pour en savoir plus :
      `;

      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: message.chat.id,
        text: welcomeMessage,
        parse_mode: "Markdown",
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
        // --- Sous-menus ---
        case "menu_commandes":
          text = "🧭 *Commandes disponibles* :\n\nChoisis une section ci-dessous pour découvrir les différentes fonctionnalités de Shepherd Signals Professional 👇";
          break;

        case "fonctionnalites":
          text = `🎯 *Fonctionnalités principales* :  

- Copie automatique de signaux vers Telegram  
- Notifications instantanées 📩  
- Capture d’écran automatique 📸  
- Briefing quotidien (manuel & auto)  
- Gestion proactive du risque ⚖️  
- Alertes en temps réel 🔔  
- Interface simple avec boutons intégrés  
- Multi-langues 🇫🇷 🇬🇧 🇪🇸  

🔐 *Sécurisé avec clé de licence vérifiée en temps réel.*`;
          break;

        case "installation":
          text = `🎛 *Tutoriel d'installation* :  

1️⃣ **Télécharge** le fichier \`Shepherd Signals Professional.ex5\`  
2️⃣ **Installe** dans *MQL5/Experts/*  
3️⃣ **Configure MT5** :  
   - Tools → Options → Expert Advisors  
   - Coche *Allow WebRequest*  
   - Ajoute ces URLs :  
     \`https://api.telegram.org\`  
     \`https://script.google.com\`  
     \`https://script.googleusercontent.com\`  
4️⃣ **Active l’EA** sur un graphique et remplis :  
   - botToken, chatID, clé licence  
   - paramètres souhaités  
5️⃣ **Autorise le trading algorithmique**  

⏳ *Patiente quelques secondes pour l’activation.*`;
          break;

        case "mode_emploi":
          text = `📖 *Mode d'emploi* :  

1️⃣ *Configuration initiale* 📝  
- Token + chat ID Telegram  
- Licence valide  
- WebRequest autorisé  

2️⃣ *Boutons EA* 🖱  
- ON/OFF → active/désactive  
- BUY/SELL → signaux manuels  
- PENDING → ordres en attente  
- BRIEFING → rapport quotidien  
- SCREENSHOT → capture manuelle  

3️⃣ *Alertes automatiques* 🔔  
- Signaux temps réel  
- Briefing programmé  

4️⃣ *Surveillance du compte* 📊  
- Équité & marges  
- Margin call détecté`;
          break;

        case "licence":
          text = `🔑 *Système de licence* :  

*Activation* : clé fournie à l’achat, vérifiée en ligne.  
*Fonctionnalités* : support multi-comptes, détection anti-fraude.  

Types :  
- DEMO (10 jours)  
- STARTER (30 jours)  
- PREMIUM (90 jours)  
- ULTIMATE (365 jours)  
- INFINITY (illimité)  

🛡 *Sécurisé et fiable.*`;
          break;

        case "achat":
          text = `🛒 *Achat de l'EA* :  
 ___________________________________________        
|          |       |      |                 |
| Licence  | Durée | Prix | Nbre de Comptes | 
|__________|_______|______|_________________|
| DEMO     | 10 j  | 0€   | 1 démo          | 
| STARTER  | 30 j  | 15€  | 1 réel + 1 démo | 
| PREMIUM  | 90 j  | 40€  | 2 réels + 2 démo| 
| ULTIMATE | 365 j | 120€ | 5 réels + 5 démo| 
| INFINITY | ∞     | 197€ | Illimités       | 
|__________|_______|______|_________________|

💳 *Paiements acceptés* : PayPal, Binance, MTN MOMO, Orange Money, Perfect Money, VISA ...etc  

📩 Contact : @JoeyPerkins`;
          break;

        case "faq":
          text = `❔ *FAQ - Questions fréquentes* :  

**Q:** L'EA n'envoie pas de messages ?  
**R:** Vérifie la config WebRequest et tokens.  

**Q:** Comment obtenir mon Chat ID ?  
**R:** Écris à @userinfobot.  

**Q:** Les screenshots ne fonctionnent pas ?  
**R:** Vérifie les permissions du dossier MQL5/Files/.  

**Q:** Utilisable sur VPS ?  
**R:** Oui, totalement compatible.  

📩 *Autres questions* : lesbonnesaffaires2025@gmail.com`;
          break;

        case "contact":
          text = `👥 *Support / Contact* :  

📧 *Email* : lesbonnesaffaires2025@gmail.com  
📢 *Canal Telegram* : https://t.me/ShepherdSignalsProfessional  
💬 *Groupe privé* : accessible via le canal  

🕒 *Support du lundi au vendredi (9h-18h GMT)*  
🌍 FR / EN / ES
⚙️ Assistance installation et personnalisation`;
          break;

        case "apropos":
          text = `💡 *À propos* :  

*Shepherd Signals Professional* est un EA MQL5 pour le suivi automatisé des performances avec alertes Telegram et gestion intelligente des risques.  

Version : *1.0*  
© 2025 *Joey Perkins D.J.* — Tous droits réservés.`;
          break;

        case "back_main":
          text = "⬅️ Retour au menu principal.";
          markup = mainMenu;
          break;
      }

      await axios.post(`${TELEGRAM_API}/editMessageText`, {
        chat_id: chatId,
        message_id: callback.message.message_id,
        text,
        parse_mode: "Markdown",
        ...markup,
      });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Erreur :", err.message);
    res.sendStatus(500);
  }
});

// === Lancement du serveur ===
app.listen(3000, async () => {
  console.log("🤖 Flock Manager bot en ligne !");
  await axios.post(`${TELEGRAM_API}/setWebhook`, { url: WEBHOOK_URL });
});
