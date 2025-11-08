import express from "express";
import axios from "axios";

// =============================================
// ⚙️ Mode TEST / PROD automatique
// =============================================
const MODE = process.env.MODE || "test"; // "test" ou "prod"
const PAYMENT_TOKEN =
  MODE === "prod"
    ? process.env.PAYMENT_TOKEN_PROD
    : process.env.PAYMENT_TOKEN_TEST;

console.log(`💳 Mode de paiement actif : ${MODE.toUpperCase()}`);

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
// 🧠 Paiement via Telegram
// ===============================
async function sendInvoice(chatId, title, description, payload, currency, prices) {
  const url = `${TELEGRAM_API}/sendInvoice`;
  const invoiceData = {
    chat_id: chatId,
    title,
    description,
    payload,
    //provider_token: process.env.PAYMENT_TOKEN || "TEST_PROVIDER_TOKEN",
    provider_token: PAYMENT_TOKEN,
    currency,
    prices,
    start_parameter: "purchase-ea",
    photo_url: "https://i.ibb.co/6vxM8cB/shepherd-logo.png",
    photo_width: 512,
    photo_height: 512,
    need_email: true,
  };
  await axios.post(url, invoiceData);
}

// ===== utilitaires de masquage =====
function maskKeyAsterisks(key, showStart = 3, showEnd = 3) {
  if (!key) return "";
  if (key.length <= showStart + showEnd) return "*".repeat(key.length);
  const start = key.slice(0, showStart);
  const end = key.slice(-showEnd);
  return start + "*".repeat(Math.max(0, key.length - showStart - showEnd)) + end;
}

// Échappe pour MarkdownV2 (Telegram) — nécessaire si on utilise spoilers
function escapeMarkdownV2(text) {
  if (!text) return "";
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

// Prépare un spoiler MarkdownV2
function spoilerForTelegram(key) {
  // escape d'abord pour MarkdownV2, puis entoure de || (spoiler)
  return "||" + escapeMarkdownV2(key) + "||";
}


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
/*async function saveUserData(userData) {
  console.log("📝 Données à sauvegarder:", userData);
  
  // URL de votre Web App Google Apps Script (à remplacer par votre URL)
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwFvs1GBfOb1aLG8QdoF8z9jIER7SCjsOBytJZDNpfrGnaWmkEPc8GZUN7jFmsk6mKw/exec';
  
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
      console.log("📅 Date de début:", response.data.StartDate);
      return {
        LicenseKey: response.data.LicenseKey,
        StartDate: response.data.StartDate
      };
    } else {
      console.error("❌ Erreur Google Sheets:", response.data.error);
      return null;
    }
  } catch (error) {
    console.error("❌ Erreur connexion Google Sheets:", error.message);
    return null;
  }
}*/

// 🆕 Fonction pour sauvegarder les données dans Google Sheets
async function saveUserData(userData) {
  console.log("📝 Données à sauvegarder:", userData);
  
  // URL de ton Web App Google Apps Script
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwFvs1GBfOb1aLG8QdoF8z9jIER7SCjsOBytJZDNpfrGnaWmkEPc8GZUN7jFmsk6mKw/exec';
  
  try {
    const response = await axios.post(GOOGLE_SCRIPT_URL, {
      prenom: userData.prenom,
      nom: userData.nom,
      pseudo: userData.pseudo,
      email: userData.email,
      licence: userData.licence,
      mode: MODE,
      transaction_id: userData.transaction_id || "/",
      montant: userData.montant || "/",
      devise: userData.devise || "/"
    });
    
    if (response.data.ok) {
      console.log("✅ Données sauvegardées dans Google Sheets, ligne:", response.data.row);
      console.log("🔑 Clé de licence générée:", response.data.LicenseKey);
      console.log("📅 Date de début:", response.data.StartDate);
      return {
        LicenseKey: response.data.LicenseKey,
        StartDate: response.data.StartDate
      };
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
  // === Gestion du pré-checkout (validation avant paiement) ===
  if (req.body.pre_checkout_query) {
    const query = req.body.pre_checkout_query;
    console.log("💳 Pré-checkout reçu :", query);
  
    try {
      // ✅ Telegram exige cette réponse en moins de 10 secondes
      await axios.post(`${TELEGRAM_API}/answerPreCheckoutQuery`, {
        pre_checkout_query_id: query.id,
        ok: true,
      });
      console.log("✅ Pré-checkout confirmé à Telegram.");
    } catch (error) {
      console.error("❌ Erreur lors du pré-checkout :", error.message);
    }
  
    // Important : renvoyer 200 pour que Telegram ne relance pas la requête
    return res.sendStatus(200);
  }

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
              [{ text: "⬅️ Retour", callback_data: "menu_commandes" }] // 🆕 Même bouton retour
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
        return res.sendStatus(200);
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
      return res.sendStatus(200);
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
      return res.sendStatus(200);  
      }
    }
    
   if (message && message.successful_payment) {
  const chatId = message.chat.id;
  const payment = message.successful_payment;

  console.log("✅ Paiement reçu :", payment);

  // 🆕 Ajout : compléter les infos avant envoi à Google Sheet
  if (userData[chatId]) {
    userData[chatId].montant = payment.total_amount / 100;
    userData[chatId].devise = payment.currency;
    userData[chatId].transaction_id = payment.telegram_payment_charge_id;

    // 🔹 Enregistrement dans Google Sheet
    const result = await saveUserData(userData[chatId]);
    
    if (result) {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `✅ *Paiement confirmé !*\n\n🔑 Clé : ${data.LicenseKey || "Non générée"}\n📅 Date : ${data.StartDate || "Non disponible"}\n\nMerci pour votre achat 🎉`,
        parse_mode: "Markdown"
      });
     /*if (result) {
      const licenseKey = result.LicenseKey || "Non générée";
      const startDate = result.StartDate || "Non disponible";
    
      // 🔐 Masquage de la clé dans un spoiler Telegram MarkdownV2
      const spoilerKey = spoilerForTelegram(licenseKey);
    
      // 🔗 Lien de téléchargement de ton canal Telegram (à personnaliser)
      const downloadLink = "https://t.me/+1i0POPVI710xZTY0";
    
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text:
          `✅ *Paiement confirmé !*\n\n` +
          `🔑 *Clé de licence* : ${spoilerKey}\n` +
          `📅 *Date d'activation* : ${escapeMarkdownV2(startDate)}\n\n` +
          `🎉 Merci pour votre achat et bienvenue parmi les utilisateurs Shepherd Signals Pro !\n\n` +
          `Veuillez télécharger l’EA en cliquant sur le bouton ci-dessous ⬇️`,
        parse_mode: "MarkdownV2",
        reply_markup: {
          inline_keyboard: [
            [{ text: "📥 Télécharger l’EA", url: downloadLink }]
          ]
        }
      });*/
    } else {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `⚠️ Paiement reçu mais erreur d’enregistrement dans la base.\n\nContactez-nous ici : @JoeyPerkins`,
        parse_mode: "Markdown"
      });
    }
  }
  
  return res.sendStatus(200);
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

          markup = {
          reply_markup: {
            inline_keyboard: [
              [{ text: "⬅️ Retour", callback_data: "menu_commandes" }]
            ]
          }
        };
        break;

          // 🆕 NOUVEAU CASE POUR LE RETOUR
        case "back_to_achat_menu":
          userState[chatId] = null; // Important : réinitialise l'état
          text = "🛒 *Achat de l'EA* :\n\nRetour au menu d'achat. Choisis ton type de licence 👇";
          
          markup = {
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
          break;

        // �NOUVEAU : Gestion des sélections de licence avec sauvegarde
        case "lic_demo": {
          userData[chatId].licence = "DEMO";
          const result = await saveUserData(userData[chatId]);
          
          if (result) {
            text = `🎁 *Licence DEMO sélectionnée ! valable 10 jours pour Shepherd Signals Professional.*\n\n✅ *Vos informations :*\n• Nom: ${userData[chatId].prenom} ${userData[chatId].nom}\n• Email: ${userData[chatId].email}\n• Licence: DEMO\n• Clé: ${result.LicenseKey}\n• Début: ${result.StartDate}\n\n📧 Nous vous contacterons rapidement pour l'activation !`;
          } else {
            text = `🎁 *Licence DEMO sélectionnée ! valable 10 jours pour Shepherd Signals Professional.*\n\n✅ *Vos informations :*\n• Nom: ${userData[chatId].prenom} ${userData[chatId].nom}\n• Email: ${userData[chatId].email}\n• Licence: DEMO\n\n⚠️ Système temporairement indisponible. Veuillez reessayer à nouveau !`;
          }
          markup = mainMenu;
          break;
        }

        case "lic_starter":{
          userData[chatId].licence = "STARTER";
          /*const result = await saveUserData(userData[chatId]);
          if (result) {
            text = `🎁 *Licence STARTER sélectionnée !*\n\n✅ *Vos informations :*\n• Nom: ${userData[chatId].prenom} ${userData[chatId].nom}\n• Email: ${userData[chatId].email}\n• Licence: DEMO\n• Clé: ${result.LicenseKey}\n• Début: ${result.StartDate}\n\n📧 Nous vous contacterons rapidement pour l'activation !`;
          } else {
            text = `🎁 *Licence STARTER sélectionnée !*\n\n✅ *Vos informations :*\n• Nom: ${userData[chatId].prenom} ${userData[chatId].nom}\n• Email: ${userData[chatId].email}\n• Licence: DEMO\n\n⚠️ Système temporairement indisponible. Nous vous contacterons rapidement !`;
          }*/
          
          // 💳 Envoie une facture Telegram
          await sendInvoice(
            chatId,
            "Licence ShepherdSignalsProfessional_STARTER",
            "Licence STARTER valable 30 jours pour Shepherd Signals Professional.",
            "lic_starter_payment",
            "EUR",
            [{ label: "Licence STARTER", amount: 1700 }] // 17.00 EUR = 1700 cents
          );
          
          text = `🧾 *Paiement en cours...*\n\nMerci d'attendre la fenêtre de paiement Telegram.`;
          markup = mainMenu;
          break;
        }
          
        case "lic_premium":{ 
          userData[chatId].licence = "PREMIUM";
         /* const result = await saveUserData(userData[chatId]);
           if (result) {
            text = `🎁 *Licence PREMIUM sélectionnée !*\n\n✅ *Vos informations :*\n• Nom: ${userData[chatId].prenom} ${userData[chatId].nom}\n• Email: ${userData[chatId].email}\n• Licence: PREMIUM\n• Clé: ${result.LicenseKey}\n• Début: ${result.StartDate}\n\n📧 Nous vous contacterons rapidement pour l'activation !`;
          } else {
            text = `🎁 *Licence PREMIUM sélectionnée !*\n\n✅ *Vos informations :*\n• Nom: ${userData[chatId].prenom} ${userData[chatId].nom}\n• Email: ${userData[chatId].email}\n• Licence: PREMIUM\n\n⚠️ Système temporairement indisponible. Nous vous contacterons rapidement !`;
          }*/

          // 💳 Envoie une facture Telegram
          await sendInvoice(
            chatId,
            "Licence ShepherdSignalsProfessional_PREMIUM",
            "Licence PREMIUM valable 90 jours pour Shepherd Signals Professional.",
            "lic_premium_payment",
            "EUR",
            [{ label: "Licence PREMIUM", amount: 4000 }] // 40.00 EUR = 4000 cents
          );
          
          text = `🧾 *Paiement en cours...*\n\nMerci d'attendre la fenêtre de paiement Telegram.`;
          markup = mainMenu;
          break;
        }

        case "lic_ultimate":{
          userData[chatId].licence = "ULTIMATE";
          /*const result = await saveUserData(userData[chatId]);
          if (result) {
            text = `🎁 *Licence ULTIMATE sélectionnée !*\n\n✅ *Vos informations :*\n• Nom: ${userData[chatId].prenom} ${userData[chatId].nom}\n• Email: ${userData[chatId].email}\n• Licence: ULTIMATE\n• Clé: ${result.LicenseKey}\n• Début: ${result.StartDate}\n\n📧 Nous vous contacterons rapidement pour l'activation !`;
          } else {
            text = `🎁 *Licence ULTIMATE sélectionnée !*\n\n✅ *Vos informations :*\n• Nom: ${userData[chatId].prenom} ${userData[chatId].nom}\n• Email: ${userData[chatId].email}\n• Licence: ULTIMATE\n\n⚠️ Système temporairement indisponible. Nous vous contacterons rapidement !`;
          }*/

          // 💳 Envoie une facture Telegram
          await sendInvoice(
            chatId,
            "Licence ShepherdSignalsProfessional_ULTIMATE",
            "Licence ULTIMATE valable 365 jours pour Shepherd Signals Professional.",
            "lic_ultimate_payment",
            "EUR",
            [{ label: "Licence ULTIMATE", amount: 13500 }] // 135.00 EUR = 13500 cents
          );
          
          text = `🧾 *Paiement en cours...*\n\nMerci d'attendre la fenêtre de paiement Telegram.`;
          markup = mainMenu;
          break;
      }

        case "lic_infinity":{
          userData[chatId].licence = "INFINITY";
          /*const result = await saveUserData(userData[chatId]);
          if (result) {
            text = `🎁 *Licence INFINITY sélectionnée !*\n\n✅ *Vos informations :*\n• Nom: ${userData[chatId].prenom} ${userData[chatId].nom}\n• Email: ${userData[chatId].email}\n• Licence: INFINITY\n• Clé: ${result.LicenseKey}\n• Début: ${result.StartDate}\n\n📧 Nous vous contacterons rapidement pour l'activation !`;
          } else {
            text = `🎁 *Licence INFINITY sélectionnée !*\n\n✅ *Vos informations :*\n• Nom: ${userData[chatId].prenom} ${userData[chatId].nom}\n• Email: ${userData[chatId].email}\n• Licence: INFINITY\n\n⚠️ Système temporairement indisponible. Nous vous contacterons rapidement !`;
          }*/

          // 💳 Envoie une facture Telegram
          await sendInvoice(
            chatId,
            "Licence ShepherdSignalsProfessional_INFINITY",
            "Licence INFINITY valable à vie pour Shepherd Signals Professional.",
            "lic_infinity_payment",
            "EUR",
            [{ label: "Licence INFINITY", amount: 19900 }] // 199.00 EUR = 19900 cents
          );
          
          text = `🧾 *Paiement en cours...*\n\nMerci d'attendre la fenêtre de paiement Telegram.`;
          markup = mainMenu;
          break;
        }
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
      // ✅ Répond immédiatement à Telegram pour éviter le "spinner" bloqué
      await axios.post(`${TELEGRAM_API}/answerCallbackQuery`, {
        callback_query_id: callback.id,
        text: "⏳ Traitement en cours...",
        show_alert: false
      });
      await axios.post(`${TELEGRAM_API}/editMessageText`, {
        chat_id: chatId,
        message_id: callback.message.message_id,
        text,
        parse_mode: "Markdown",
        ...markup,
      });
    return res.sendStatus(200);
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
