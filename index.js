const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  console.error("SECURITY ERROR: TELEGRAM_TOKEN is missing!");
  process.exit(1);
}

const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Arena of Honor Engine Active');
}).listen(port);

const bot = new TelegramBot(token, { polling: true });
console.log("Potala Engine v2.0 stable deployed...");

const activeFights = new Map();
const activeExpeditions = new Map(); 
const zones = ['Head', 'Chest', 'Belt', 'Legs'];

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  activeFights.delete(chatId);
  
  const mainPage = `🪐 *WELCOME TO PLANET POTALA* 🪐\n_Arena of Honor & Wastelands_\n\nWarrior, choose your path on this brutal planet:`;
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
  bot.answerCallbackQuery(query.id).catch(() => {});

  if (data === 'menu_wastelands') {
    if (activeExpeditions.has(chatId)) {
      const exp = activeExpeditions.get(chatId);
      const minutesPassed = Math.floor((Date.now() - exp.startTime) / 60000);
      let text = `🏜 *POTALA WASTELANDS*\n━━━━━━━━━━━━━━━\n👤 Exploring *Radioactive Dunes*.\n⏱ Time: *${minutesPassed} min*.\n\n_Server is hunting! You can turn off your phone!_`;
      bot.editMessageText(text, {
        chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: '🎒 Return & Claim Loot', callback_data: 'claim_loot' }]] }
      }).catch(() => {});
    } else {
      let text = `🏜 *POTALA WASTELANDS*\n━━━━━━━━━━━━━━━\nSend hero to farm resources.\n\n💰 *Gold & Scrap* every minute.\n🎁 *15% Surprise chance*!`;
      bot.editMessageText(text, {
        chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🚀 Start Expedition (Auto-Farm)', callback_data: 'start_expedition' }],
            [{ text: '↩️ Main Menu', callback_data: 'back_to_main' }]
          ]
        }
      }).catch(() => {});
    }
  }

  if (data === 'start_expedition') {
    activeExpeditions.set(chatId, { startTime: Date.now() });
    bot.editMessageText(`🚀 *Expedition Started!*\n\nHero is in *Wastelands*. Turn off your phone and rest!`, {
      chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: '📊 Check Status', callback_data: 'menu_wastelands' }]] }
    }).catch(() => {});
  }

  if (data === 'claim_loot') {
    const exp = activeExpeditions.get(chatId);
    if (!exp) return;
    const seconds = Math.floor((Date.now() - exp.startTime) / 1000);
    if (seconds < 5) {
      bot.sendMessage(chatId, "⏳ Your hero hasn't found anything yet. Wait a bit longer!");
      return;
    }

    const gold = seconds * 2;
    const scrap = seconds * 5;
    const epic = Math.random() < 0.15 ? `\n🔥 *SURPRISE:* Found *⚡ Yautja Plasma Core*!` : "";

    activeExpeditions.delete(chatId);
    bot.sendMessage(chatId, `🎒 *REPORT*\n━━━━━━━━━━━━━━━\n💰 *Gold*: +${gold}\n⚙️ *Scrap*: +${scrap}${epic}`, {
      parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: '↩️ Main Menu', callback_data: 'back_to_main' }]] }
    });
  }

  if (data === 'choose_weapon') {
    bot.editMessageText(`⚔️ *ARENA OF HONOR*\n\nSelect your Combat Gear:`, {
      chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🏹 Bow of Potala (Silat)', callback_data: 'w_bow' }],
          [{ text: '🩸 Yautja Claws (Wing Chun)', callback_data: 'w_claws' }]
        ]
      }
    }).catch(() => {});
  }

  if (data.startsWith('w_')) {
    const isClaws = data === 'w_claws';
    activeFights.set(chatId, {
      player: { hp: 100, maxHp: 100, damage: isClaws ? 16 : 12, style: isClaws ? 'Wing Chun' : 'Pencak Silat', poison: !isClaws, strike: null, block: null },
      enemy: { name: '👹 Savage Predator', hp: 110, maxHp: 110, damage: 14, strike: null, block: null, poison: 0 },
      round: 1
    });
    bot.editMessageText(`⚔️ *ROUND 1* 📢\nChoose where you want to *STRIKE*:`, {
      chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔴 Head', callback_data: 'atk_Head' }, { text: '🔴 Chest', callback_data: 'atk_Chest' }],
          [{ text: '🔴 Belt', callback_data: 'atk_Belt' }, { text: '🔴 Legs', callback_data: 'atk_Legs' }]
        ]
      }
    }).catch(() => {});
  }

  if (data.startsWith('atk_')) {
    const fight = activeFights.get(chatId);
    if (!fight) return;
    fight.player.strike = data.split('_');
    bot.editMessageText(`⚔️ *Round ${fight.round}* \n🎯 Strike: *${fight.player.strike}*\n\nChoose your *BLOCK*:`, {
      chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🛡️ Head', callback_data: 'def_Head' }, { text: '🛡️ Chest', callback_data: 'def_Chest' }],
          [{ text: '🛡️ Belt', callback_data: 'def_Belt' }, { text: '🛡️ Legs', callback_data: 'def_Legs' }]
        ]
      }
    }).catch(() => {});
  }

  if (data.startsWith('def_')) {
    const fight = activeFights.get(chatId);
    if (!fight || !fight.player.strike) return;
    fight.player.block = data.split('_');
    fight.enemy.strike = zones[Math.floor(Math.random() * zones.length)];
    fight.enemy.block = zones[Math.floor(Math.random() * zones.length)];

    let log = `📊 *ROUND ${fight.round} LOG*:\n━━━━━━━━━━━━━━━\n`;

    if (fight.player.strike === fight.enemy.block) log += `🛡️ Enemy blocked your strike!\n`;
    else {
      let dmg = fight.player.damage;
      if (fight.player.style === 'Pencak Silat' && Math.random() < 0.25) { dmg *= 2; log += `⚡ *CRIT!* `; }
      fight.enemy.hp -= dmg;
      log += `⚔️ You hit enemy for *-${dmg} HP*!\n`;
      if (fight.player.poison) { fight.enemy.poison = 3; fight.player.poison = false; log += `🧪 *Poison applied!*\n`; }
    }

    if (fight.enemy.strike === fight.player.block) {
      log += `🛡️ You blocked enemy strike!\n`;
      if (fight.player.style === 'Wing Chun' && Math.random() < 0.35) { fight.enemy.hp -= 8; log += `💥 *COUNTER (Wing Chun):* *-8 HP*!\n`; }
    } else { fight.player.hp -= fight.enemy.damage; log += `💥 Enemy hit you for *-${fight.enemy.damage} HP*!\n`; }

    if (fight.enemy.poison > 0) { fight.enemy.hp -= 6; fight.enemy.poison--; log += `🧪 Poison inflicts *-6 HP*.\n`; }

    if (fight.player.hp < 0) fight.player.hp = 0;
    if (fight.enemy.hp < 0) fight.enemy.hp = 0;
    log += `━━━━━━━━━━━━━━━\n👤 *Your HP*: ${fight.player.hp}\n👹 *Enemy HP*: ${fight.enemy.hp}`;

    if (fight.player.hp <= 0 && fight.enemy.hp <= 0) {
      bot.sendMessage(chatId, `${log}\n\n💀 *DRAW!* Both died.`, { reply_markup: { inline_keyboard: [[{ text: '↩️ Main Menu', callback_data: 'back_to_main' }]] } });
      activeFights.delete(chatId);
    } else if (fight.player.hp <= 0) {
      bot.sendMessage(chatId, `${log}\n\n💀 *DEFEAT!* You died.`, { reply_markup: { inline_keyboard: [[{ text: '↩️ Main Menu', callback_data: 'back_to_main' }]] } });
      activeFights.delete(chatId);
    } else if (fight.enemy.hp <= 0) {
      bot.sendMessage(chatId, `${log}\n\n🏆 *VICTORY!* You won! +50 Gold.`, { reply_markup: { inline_keyboard: [[{ text: '↩️ Main Menu', callback_data: 'back_to_main' }]] } });
      activeFights.delete(chatId);
    } else {
      fight.round++; fight.player.strike = null; fight.player.block = null;
      bot.sendMessage(chatId, `${log}\n\n*ROUND ${fight.round}* 📢\nChoose *STRIKE*:`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔴 Head', callback_data: 'atk_Head' }, { text: '🔴 Chest', callback_data: 'atk_Chest' }],
            [{ text: '🔴 Belt', callback_data: 'atk_Belt' }, { text: '🔴 Legs', callback_data: 'atk_Legs' }]
          ]
        }
      });
    }
  }

  if (data === 'back_to_main') {
    const mainPage = `🪐 *WELCOME TO PLANET POTALA* 🪐\n_Arena of Honor & Wastelands_\n\nWarrior, choose your path on this brutal planet:`;
    bot.sendMessage(chatId, mainPage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '⚔️ Enter Arena (PVP Bot)', callback_data: 'choose_weapon' }],
          [{ text: '🏜️ Venture into Wastelands (Auto-Farm)', callback_data: 'menu_wastelands' }]
        ]
      }
    });
  }
});
