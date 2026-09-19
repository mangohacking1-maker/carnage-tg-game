const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  console.error("SECURITY ERROR: TELEGRAM_TOKEN is missing!");
  process.exit(1);
}

// 🌐 Render Port Binder & Health Check
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Arena of Honor: Potala Engine Active');
}).listen(port);

const bot = new TelegramBot(token, { polling: true });
console.log("Arena of Honor: Potala Engine v2.0 deployed successfully...");

// 🧠 IN-MEMORY SERVER DATABASE
const activeFights = new Map();
const activeExpeditions = new Map(); // Stores Idle farming states securely
const zones = ['Head', 'Chest', 'Belt', 'Legs'];

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  // Clean up any old states to avoid bugs
  activeFights.delete(chatId);

  const mainPage = `🪐 *WELCOME TO PLANET POTALA* 🪐\n_Arena of Honor & Wastelands_\n\nWarrior, choose your path on this brutal planet of Yautja hunters:`;
  
  bot.sendMessage(chatId, mainPage, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '⚔️ Enter Arena (PVP Bot)', callback_data: 'choose_weapon' }],
        [{ text: '🏜️ Venture into Wastelands (Auto-Farm)', callback_data: 'menu_wastelands' }]
      ]
    }
  });
});

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const data = query.data;

  bot.answerCallbackQuery(query.id);

  // ==========================================
  // 🏜️ IDLE WASTELANDS SYSTEM (телефон можно выключать)
  // ==========================================
  if (data === 'menu_wastelands') {
    if (activeExpeditions.has(chatId)) {
      // Player is already farming, show progress
      const exp = activeExpeditions.get(chatId);
      const minutesPassed = Math.floor((Date.now() - exp.startTime) / 60000);
      
      let statusText = `🏜 *POTALA WASTELANDS*\n━━━━━━━━━━━━━━━\n`;
      statusText += `👤 Your Avatar is currently exploring *Radioactive Dunes*.\n`;
      statusText += `⏱ Time elapsed: *${minutesPassed} minutes*.\n\n_You can turn off your phone. The server is hunting for you!_`;
      
      bot.editMessageText(statusText, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: '🎒 Return & Claim Loot', callback_data: 'claim_loot' }]] }
      });
    } else {
      // Player is idle, allow starting expedition
      let menuText = `🏜 *POTALA WASTELANDS*\n━━━━━━━━━━━━━━━\n`;
      menuText += `Send your hero to farm resources automatically. \n\n💰 *Guaranteed*: Gold and Scrap every minute.\n🎁 *Surprise*: 1% chance for *Yautja Power Core* or *Epic Ruby*!`;
      
      bot.editMessageText(menuText, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🚀 Start Expedition (Auto-Farm)', callback_data: 'start_expedition' }],
            [{ text: '↩️ Back to Main Menu', callback_data: 'back_to_main' }]
          ]
        }
      });
    }
  }

  if (data === 'start_expedition') {
    if (activeFights.has(chatId)) return bot.sendMessage(chatId, "❌ Finish your Arena fight first!");
    
    // Secure Server-side time tracking (Anti-cheat)
    activeExpeditions.set(chatId, { startTime: Date.now() });
    
    bot.editMessageText(`🚀 *Expedition Started!*\n\nYour Hero has ventured into the deep *Potala Wastelands*. Feel free to *turn off your phone* and rest.\n\nCome back later to claim your loot!`, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: '📊 Check Status / Return', callback_data: 'menu_wastelands' }]] }
    });
  }

  if (data === 'claim_loot') {
    const exp = activeExpeditions.get(chatId);
    if (!exp) return bot.sendMessage(chatId, "❌ No active expedition found.");

    // SECURITY: Calculate true time based on server clocks
    const msPassed = Date.now() - exp.startTime;
    const secondsPassed = Math.floor(msPassed / 1000); // For quick testing, we use seconds as minutes!
    
    if (secondsPassed < 5) {
      return bot.sendMessage(chatId, "⏳ Your hero hasn't found anything yet. Wait a bit longer!");
    }

    // Loot calculations
    const goldEarned = secondsPassed * 2;
    const scrapEarned = secondsPassed * 5;
    
    // 🎁 Epic Surprise drop (1% roll)
    const epicRoll = Math.random() < 0.15; // Raised to 15% for testing purposes!
    let surpriseText = "";
    if (epicRoll) {
      surpriseText = `\n🔥 *EPIC SURPRISE FOUND!* You discovered a hidden *⚡ Yautja Plasma Core*!`;
    }

    let lootReport = `🎒 *EXPEDITION REPORT*\n━━━━━━━━━━━━━━━\n`;
    lootReport += `Your hero safely returned from the Wastelands!\n\n`;
    lootReport += `💰 *Gold earned*: +${goldEarned}\n`;
    lootReport += `⚙️ *Scrap collected*: +${scrapEarned}\n`;
    lootReport += surpriseText;

    activeExpeditions.delete(chatId); // Clear state securely

    bot.sendMessage(chatId, lootReport, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: '↩️ Back to Main Menu', callback_data: 'back_to_main' }]] }
    });
  }

  // ==========================================
  // ⚔️ COMBAT SYSTEM (Wing Chun, Silat, Bows)
  // ==========================================
  if (data === 'choose_weapon') {
    let text = `⚔️ *ARENA OF HONOR*\n\nSelect your Combat Gear and Martial Art Martial Style:`;
    bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🏹 Bow of Potala (Poison + Silat Style)', callback_data: 'w_bow' }],
          [{ text: '🩸 Yautja Wrist Claws (Wing Chun Style)', callback_data: 'w_claws' }]
        ]
      }
    });
  }

  if (data.startsWith('w_')) {
    const weaponType = data.split('_')[1];
    
    // Initialize combat stats based on choice
    const fightState = {
      player: { 
        hp: 100, maxHp: 100, damage: weaponType === 'claws' ? 16 : 12, 
        style: weaponType === 'claws' ? 'Wing Chun' : 'Pencak Silat',
        poisonArrows: weaponType === 'bow' ? 2 : 0,
        strike: null, block: null 
      },
      enemy: { name: '👹 Savage Predator', hp: 110, maxHp: 110, damage: 14, strike: null, block: null, poisonTicks: 0 },
      round: 1
    };
    activeFights.set(chatId, fightState);

    let text = `⚔️ *BATTLE INITIATED* ⚔️\n━━━━━━━━━━━━━━━\n`;
    text += `You enter the sands with *${fightState.player.style}* style.\n`;
    text += `Your enemy is a feral *${fightState.enemy.name}*!\n\n`;
    text += `*ROUND 1* 📢\nChoose where you want to *STRIKE*:`;

    bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔴 Strike Head', callback_data: 'atk_Head' }, { text: '🔴 Strike Chest', callback_data: 'atk_Chest' }],
          [{ text: '🔴 Strike Belt', callback_data: 'atk_Belt' }, { text: '🔴 Strike Legs', callback_data: 'atk_Legs' }]
        ]
      }
    });
  }

  if (data.startsWith('atk_')) {
    const fight = activeFights.get(chatId);
    if (!fight) return;

    fight.player.strike = data.split('_')[1];

    bot.editMessageText(`⚔️ *Round ${fight.round}* \n🎯 Selected Strike: *${fight.player.strike}*\n\nNow, select your *BLOCK* zone:`, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🛡️ Block Head', callback_data: 'def_Head' }, { text: '🛡️ Block Chest', callback_data: 'def_Chest' }],
          [{ text: '🛡️ Block Belt', callback_data: 'def_Belt' }, { text: '🛡️ Block Legs', callback_data: 'def_Legs' }]
        ]
      }
    });
  }

  if (data.startsWith('def_')) {
    const fight = activeFights.get(chatId);
    if (!fight || !fight.player.strike) return;

    fight.player.block = data.split('_')[1];

    // Server-side AI decisions
    fight.enemy.strike = zones[Math.floor(Math.random() * zones.length)];
    fight.enemy.block = zones[Math.floor(Math.random() * zones.length)];

    let log = `📊 *ROUND ${fight.round} LOG*:\n━━━━━━━━━━━━━━━\n`;

    // 1. Calculate Player Attack
    if (fight.player.strike === fight.enemy.block) {
      log += `🛡️ Enemy blocked your strike to *${fight.player.strike}*!\n`;
    } else {
      let dmg = fight.player.damage;
      // Pencak Silat crit bonus (25% chance for x2 damage)
      if (fight.player.style === 'Pencak Silat' && Math.random() < 0.25) {
        dmg *= 2;
        log += `⚡ *CRITICAL HIT (Silat Style)!* `;
      }
      fight.enemy.hp -= dmg;
      log += `⚔️ You hit enemy's *${fight.player.strike}* for *-${dmg} HP*!\n`;

      // Bow Poison application
      if (fight.player.poisonArrows > 0) {
        fight.enemy.poisonTicks = 3;
        fight.player.poisonArrows--;
        log += `🧪 *Poison applied* to the enemy target!\n`;
      }
    }

    // 2. Calculate Enemy Attack & Wing Chun Counter-attacks
    if (fight.enemy.strike === fight.player.block) {
      log += `🛡️ You successfully blocked enemy's strike!\n`;
      
      // Wing Chun Counter-attack (35% chance to counter on successful block)
      if (fight.player.style === 'Wing Chun' && Math.random() < 0.35) {
        const counterDmg = 8;
        fight.enemy.hp -= counterDmg;
        log += `💥 *COUNTER-STRIKE (Wing Chun)!* You instantly retaliated for *-${counterDmg} HP*!\n`;
      }
    } else {
      fight.player.hp -= fight.enemy.damage;
      log += `💥 Enemy slashed your *${fight.enemy.strike}* for *-${fight.enemy.damage} HP*!\n`;
    }

    // 3. Apply Poison ticks if active
    if (fight.enemy.poisonTicks > 0) {
      fight.enemy.hp -= 6;
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
