import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = `https://shepherdsignalsprobot.onrender.com${URI}`;

// ===============================
// 🧠 Stock des états utilisateurs
// ===============================
const userState = {};
const userData = {}; // 🆕 Stocke TOUTES les données utilisateur (nom, email, licence)

// ===============================
// 🎛 Menus principaux
// ===============================
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

// 🆕 Fonction pour sauvegarder les données dans Google Sheets
async function saveUserData(userData) {
  console.log("📝 Données à sauvegarder:", userData);
  
  // URL de votre Web App Google Apps Script (à remplacer par votre URL)
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzKVLxmyRRI_Y80Xqr9q6_tiCAfrrNtuxMuLP08zkLAFoxf90Y64-pNHUn2ZMaqERa7/exec';
  
  try {
    const response = await axios.post(GOOGLE_SCRIPT_URL, {
      prenom: userData.prenom,
      nom: userData.nom,
      pseudo: userData.pseudo,
      email: userData.email,
      licence: userData.licence
    });
    
    if (response.data.ok) {
      console.log("✅ Données sauvegardées dans Google Sheets, ligne:", response.data.row);
      console.log("🔑 Clé de licence générée:", response.data.LicenseKey);
      return response.data.LicenseKey;
    } else {
      console.error("❌ Erreur Google Sheets:", response.data.error);
      return null;
    }
  } catch (error) {
    console.error("❌ Erreur connexion Google Sheets:", error.message);
    return null;
  }
}

//-------------------------------------------------------
app.post(URI, async (req, res) => {
  const message = req.body.message;
  const callback = req.body.callback_query;

  try {
    if (message && message.text) {
      const textCmd = message.text.trim().toLowerCase();
      const chatId = message.chat.id;

      // 🆕 Étape spéciale : réception d'un email
      if (userState[chatId] === "waiting_email") {
        const email = message.text.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
          await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: "❌ *Adresse email invalide.*\n\nMerci de réessayer avec un format valide (ex: tonmail@gmail.com).",
            parse_mode: "Markdown"
          });
          return res.sendStatus(200);
        }

        // 🆕 Sauvegarde de l'email ET du nom
        userData[chatId] = {
          email: email,
          prenom: message.from.first_name || " ",
          nom: message.from.last_name || " ",
          pseudo: message.from.username || " ",
          licence: null // Sera rempli plus tard
        };
        
        userState[chatId] = null;

        const licencesMenu = {
          reply_markup: {
            inline_keyboard: [
              [{ text: "🎁 DEMO", callback_data: "lic_demo" }],
              [{ text: "🚀 STARTER", callback_data: "lic_starter" }],
              [{ text: "💎 PREMIUM", callback_data: "lic_premium" }],
              [{ text: "⚡ ULTIMATE", callback_data: "lic_ultimate" }],
              [{ text: "♾️ INFINITY", callback_data: "lic_infinity" }],
              [{ text: "⬅️ Retour", callback_data: "menu_commandes" }]
            ]
          }
        };

        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: `✅ *Email enregistré avec succès !*\n\nMaintenant, choisis ton type de licence 👇`,
          parse_mode: "Markdown",
          ...licencesMenu
        });

        return res.sendStatus(200);
      }

      // --- /start ---
      if (textCmd === "/start" || textCmd === "/start@shepherdsignalsprobot") {
        const prenom = message.from.first_name || "cher(e) trader";
         const nom = message.from.last_name || " ";
        const pseudo = message.from.username || null;

        // 🆕 Initialisation des données utilisateur
        if (!userData[chatId]) {
          userData[chatId] = {
            prenom: prenom,
            nom: nom,
            pseudo: pseudo,
            email: null,
            licence: null
          };
        }

        const welcomeMessage = `
👋 *Bonjour et bienvenue ${prenom} ${nom}!*  

Je suis *Flock Manager*, ton assistant virtuel pour découvrir, installer, paramétrer et exploiter ton EA *Shepherd Signals Professional*.  

*Shepherd Signals Professional* est un Expert Advisor avancé pour *MetaTrader 5* qui transforme ton expérience de trading grâce à l'intégration Telegram en temps réel.  

📲 *Fonctionne sur MetaTrader 5*  
🔗 *Communauté Telegram* : @ShepherdSignalsProfessional  
📩 *Support* : lesbonnesaffaires2025@gmail.com  

👇 Clique sur *Commandes disponibles* pour en savoir plus :
        `;

        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: welcomeMessage,
          parse_mode: "Markdown",
          ...mainMenu,
        });
      }

      // --- /help ---
      else if (textCmd === "/help" || textCmd === "/help@shepherdsignalsprobot") {
        const helpMessage = `
🧭 *Commandes disponibles* :

• /start — Revenir à l'accueil  

👇 Sélectionne une section ci-dessous pour explorer Shepherd Signals Professional :
        `;
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: helpMessage,
          parse_mode: "Markdown",
          ...commandesMenu,
        });
      }

      // --- Commande inconnue ---
      else if (textCmd.startsWith("/")) {
        const unknownMessage = `
❓ *Commande inconnue.*  

Essaie plutôt /start ou /help pour naviguer dans le bot.
        `;
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: unknownMessage,
          parse_mode: "Markdown",
          ...mainMenu,
        });
      }
    }

    // === Gestion des boutons ===
    if (callback) {
      const chatId = callback.message.chat.id;
      const data = callback.data;

      let text = "";
      let markup = commandesMenu;

      switch (data) {
        // ... (tous vos cases existants restent identiques jusqu'à "achat")
         // --- Sous-menus ---
        case "menu_commandes":
          text = "🧭 *Commandes disponibles* :\n\nChoisis une section ci-dessous pour découvrir les différentes fonctionnalités de Shepherd Signals Professional 👇";
          break;

        case "fonctionnalites":
          text = `🎯 *Fonctionnalités principales* :  

- Copie automatique de signaux vers Telegram 📲
- Notifications instantanées 📩  
- Capture d’écran automatique 📸  
- Briefing quotidien (manuel & auto) 📝
- Gestion proactive du risque ⚖️  
- Alertes en temps réel 🔔  
- Interface simple avec boutons intégrés 📍
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
    - 🔎 → cacher le panneau des boutons

3️⃣ *Alertes automatiques* 🔔  
    - Signaux temps réel  
    - Briefing programmé  

4️⃣ *Surveillance du compte* 📊  
    - Équité & marges  
    - Margin call détecté
    
🆒 Convient à toutes les catégories de traders, amateurs comme professionnels.`;
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
          text = `🛒 *Achat de l'EA* :\n\nAvant de continuer, indique ton **adresse email** valide. Nous l'utiliserons pour te communiquer ta clé de licence.\n(ex: tonmail@gmail.com)`;
          userState[chatId] = "waiting_email";
          markup = null;
          break;

        // �NOUVEAU : Gestion des sélections de licence avec sauvegarde
        case "lic_demo":
          userData[chatId].licence = "DEMO";
          const LicenseKey = await saveUserData(userData[chatId]);
          
         if (LicenseKey) {
            text = `🎁 *Licence DEMO sélectionnée !*\n\n✅ *Vos informations :*\n• Nom: ${userData[chatId].prenom} ${userData[chatId].nom}\n• Email: ${userData[chatId].email}\n• Licence: DEMO\n• Clé: ${LicenseKey}\n\n📧 Nous vous contacterons rapidement pour l'activation !`;
          } else {
            text = `🎁 *Licence DEMO sélectionnée !*\n\n✅ *Vos informations :*\n• Nom: ${userData[chatId].prenom} ${userData[chatId].nom}\n• Email: ${userData[chatId].email}\n• Licence: DEMO\n\n⚠️ Système temporairement indisponible. Nous vous contacterons rapidement !`;
          }
          
          markup = mainMenu;
          //await saveUserData(userData[chatId]); // 🆕 SAUVEGARDE
          break;

        case "lic_starter":
          userData[chatId].licence = "STARTER";
          const LicenseKey = await saveUserData(userData[chatId]);
          
          if (LicenseKey) {
            text = `🎁 *Licence STARTER sélectionnée !*\n\n✅ *Vos informations :*\n• Nom: ${userData[chatId].prenom} ${userData[chatId].nom}\n• Email: ${userData[chatId].email}\n• Licence: DEMO\n• Clé: ${LicenseKey}\n\n📧 Nous vous contacterons rapidement pour l'activation !`;
          } else {
            text = `🎁 *Licence STARTER sélectionnée !*\n\n✅ *Vos informations :*\n• Nom: ${userData[chatId].prenom} ${userData[chatId].nom}\n• Email: ${userData[chatId].email}\n• Licence: DEMO\n\n⚠️ Système temporairement indisponible. Nous vous contacterons rapidement !`;
          }
         
          markup = mainMenu;
          //await saveUserData(userData[chatId]); // 🆕 SAUVEGARDE
          break;

        case "lic_premium":
          userData[chatId].licence = "PREMIUM";
          const LicenseKey = await saveUserData(userData[chatId]);
          
           if (LicenseKey) {
            text = `🎁 *Licence PREMIUM sélectionnée !*\n\n✅ *Vos informations :*\n• Nom: ${userData[chatId].prenom} ${userData[chatId].nom}\n• Email: ${userData[chatId].email}\n• Licence: PREMIUM\n• Clé: ${LicenseKey}\n\n📧 Nous vous contacterons rapidement pour l'activation !`;
          } else {
            text = `🎁 *Licence PREMIUM sélectionnée !*\n\n✅ *Vos informations :*\n• Nom: ${userData[chatId].prenom} ${userData[chatId].nom}\n• Email: ${userData[chatId].email}\n• Licence: PREMIUM\n\n⚠️ Système temporairement indisponible. Nous vous contacterons rapidement !`;
          }
          
          markup = mainMenu;
          //await saveUserData(userData[chatId]); // 🆕 SAUVEGARDE
          break;

        case "lic_ultimate":
          userData[chatId].licence = "ULTIMATE";
          const LicenseKey = await saveUserData(userData[chatId]);

          if (LicenseKey) {
            text = `🎁 *Licence ULTIMATE sélectionnée !*\n\n✅ *Vos informations :*\n• Nom: ${userData[chatId].prenom} ${userData[chatId].nom}\n• Email: ${userData[chatId].email}\n• Licence: ULTIMATE\n• Clé: ${LicenseKey}\n\n📧 Nous vous contacterons rapidement pour l'activation !`;
          } else {
            text = `🎁 *Licence ULTIMATE sélectionnée !*\n\n✅ *Vos informations :*\n• Nom: ${userData[chatId].prenom} ${userData[chatId].nom}\n• Email: ${userData[chatId].email}\n• Licence: ULTIMATE\n\n⚠️ Système temporairement indisponible. Nous vous contacterons rapidement !`;
          }
         
          markup = mainMenu;
          //await saveUserData(userData[chatId]); // 🆕 SAUVEGARDE
          break;

        case "lic_infinity":
          userData[chatId].licence = "INFINITY";
          const LicenseKey = await saveUserData(userData[chatId]);
          
          if (LicenseKey) {
            text = `🎁 *Licence INFINITY sélectionnée !*\n\n✅ *Vos informations :*\n• Nom: ${userData[chatId].prenom} ${userData[chatId].nom}\n• Email: ${userData[chatId].email}\n• Licence: INFINITY\n• Clé: ${LicenseKey}\n\n📧 Nous vous contacterons rapidement pour l'activation !`;
          } else {
            text = `🎁 *Licence INFINITY sélectionnée !*\n\n✅ *Vos informations :*\n• Nom: ${userData[chatId].prenom} ${userData[chatId].nom}\n• Email: ${userData[chatId].email}\n• Licence: INFINITY\n\n⚠️ Système temporairement indisponible. Nous vous contacterons rapidement !`;
          }
          
          markup = mainMenu;
          //await saveUserData(userData[chatId]); // 🆕 SAUVEGARDE
          break;

        // ... (le reste de vos cases reste identique)
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

©️ 2025, *Joey Perkins D.J.* — Tous droits réservés.`;
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

app.listen(3000, async () => {
  console.log("🤖 Flock Manager bot en ligne !");
  await axios.post(`${TELEGRAM_API}/setWebhook`, { url: WEBHOOK_URL });
});
