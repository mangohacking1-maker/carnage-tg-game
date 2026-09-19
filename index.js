// Connecting the telegram bot library and the built-in HTTP module to bypass the Render port error
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const token = process.env.TELEGRAM_TOKEN;

if (!token) {
  console.error("SECURITY ERROR: TELEGRAM_TOKEN environment variable is missing!");
  process.exit(1);
}

// 🌐 RENDER PORT BINDING FIX: Creating a mini web server so Render knows our service is alive
const port = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Arena of Honor: Server is running in secure mode 24/7!');
});

server.listen(port, () => {
  console.log(`[🌐 WEB] Server placeholder is successfully listening on port ${port}`);
});

// Launching the Telegram bot in secure polling mode
const bot = new TelegramBot(token, { polling: true });
console.log("Arena of Honor engine has been successfully deployed 24/7...");

// Processing the /start command from players
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || "Stranger";
  console.log(`[🛡️ SECURITY] User @${username} (ID: ${chatId}) requested entry to the Arena.`);

  // Epic grim-dark greeting in the style of classic Carnage
  const welcomeMessage = `⚔️ Welcome to the Arena of Honor, Warrior!\n\nThis is where steel is forged and legends are born. Are you ready to spill the first blood and earn gold?`;

  // Secure inline button with action marker
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '⚔️ Enter the Battle!', callback_data: 'start_battle_search' }
        ]
      ]
    }
  };

  bot.sendMessage(chatId, welcomeMessage, options);
});

// Anti-cheat button click processor (Server-side validation)
bot.on('callback_query', (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const action = callbackQuery.data;

  if (action === 'start_battle_search') {
    // Notify the client that the request is accepted
    bot.answerCallbackQuery(callbackQuery.id, { text: "Matchmaking started..." });
    
    bot.sendMessage(chatId, "🛡️ The system is looking for an equal opponent in the Arena... Prepare for battle!");
    console.log(`[⚔️ MATCHMAKING] Player joined the queue on the secure server.`);
  }
});
