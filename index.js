// index.js - Bot Telegram (webhook) pour Render (Web Service gratuit)
import express from 'express';
import { Telegraf, Markup } from 'telegraf';

// Vérifie que Node accepte les imports : si tu as un problème, on pourra donner la version CommonJS.
// Ici on part sur ES modules (Render gère bien).
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('Erreur: BOT_TOKEN non défini dans les variables d’environnement.');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// --- Menus ---
function getMainMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🎯 Présentation', 'menu_presentation')],
    [Markup.button.callback('⚙️ Installation', 'menu_installation')],
    [Markup.button.callback('🪪 Licence', 'menu_licence')],
    [Markup.button.callback('💡 Exemple', 'menu_exemple')],
    [Markup.button.callback('🆘 Aide / Contact', 'menu_aide')],
  ]);
}

function getBackMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('⬅️ Retour', 'menu_main')],
  ]);
}

// --- Handlers ---
bot.start(async (ctx) => {
  const name = ctx.from?.first_name || 'utilisateur';
  await ctx.reply(
    `👋 Bonjour ${name} !\nBienvenue sur le bot Shepherd Signals EA.\n\nChoisis une option ci-dessous pour en savoir plus :`,
    getMainMenu()
  );
});

bot.action('menu_presentation', async (ctx) => {
  await ctx.answerCbQuery(); // ferme la petite roue de chargement côté client
  await ctx.editMessageText(
    `🎯 *Présentation de Shepherd Signals EA*\n\nCet Expert Advisor automatise vos stratégies de trading.\nIl analyse, exécute et gère les positions selon vos paramètres.`,
    { parse_mode: 'Markdown', ...getBackMenu() }
  );
});

bot.action('menu_installation', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `⚙️ *Installation*\n\n1) Placez le fichier EA dans le dossier Experts.\n2) Rafraîchissez MT5.\n3) Glissez l'EA sur un graphique.\n4) Activez "Allow Algo Trading".`,
    { parse_mode: 'Markdown', ...getBackMenu() }
  );
});

bot.action('menu_licence', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `🪪 *Licence*\n\nLicence liée à l'ID de compte MT5.\nStatuts: ✅ Active | ⏳ Expirée | 🚫 Révoquée`,
    { parse_mode: 'Markdown', ...getBackMenu() }
  );
});

bot.action('menu_exemple', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `💡 *Exemple*\n\n1) Chargez les paramètres recommandés.\n2) Activez le mode Auto.\n3) Surveillez via le panneau d'info.`,
    { parse_mode: 'Markdown', ...getBackMenu() }
  );
});

bot.action('menu_aide', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `🆘 *Aide*\n\nContact: @ShepherdSupport\nSite: https://shepherdsignals.com`,
    { parse_mode: 'Markdown', ...getBackMenu() }
  );
});

bot.action('menu_main', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `👋 Bienvenue à nouveau !\nChoisis une option :`,
    { parse_mode: 'Markdown', ...getMainMenu() }
  );
});

// --- Express + Webhook ---
const app = express();
app.use(express.json());

// chemin webhook: on recommande d'utiliser le token dans l'URL pour plus de sécurité
const WH_PATH = `/telegram/${BOT_TOKEN}`;

// route de santé (optionnelle)
app.get('/', (req, res) => res.send('Bot en ligne — Render Web Service (gratuit).'));

// route webhook que Telegram appellera
app.post(WH_PATH, (req, res) => {
  // telegraf propose webhookCallback, mais la méthode simple ci-dessous fonctionne aussi
  bot.handleUpdate(req.body, res).then(() => res.status(200).end()).catch((err) => {
    console.error('Erreur handleUpdate:', err);
    res.status(500).end();
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Serveur démarré sur le port ${PORT}, webhook path: ${WH_PATH}`);
  // optionnel : demande à Telegram d'enregistrer le webhook (mais tu peux le faire manuellement)
  // const webhookUrl = `https://${process.env.RENDER_EXTERNAL_URL}${WH_PATH}`;
  // await bot.telegram.setWebhook(webhookUrl);
});
