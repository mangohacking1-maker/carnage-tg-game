const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const { createClient } = require('@supabase/supabase-js');
const arena = require('./arena');
const locales = require('./locales');

const token = process.env.TELEGRAM_TOKEN;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!token || !supabaseUrl || !supabaseKey) process.exit(1);

const supabase = createClient(supabaseUrl, supabaseKey);

const port = process.env.PORT || 3000;
http.createServer((req, res) => { res.writeHead(200); res.end('Active'); }).listen(port);

const bot = new TelegramBot(token, { polling: true });

const activeExpeditions = new Map();
const walletState = new Map();
const activeBattles = new Map();

async function getOrCreatePlayer(tgId, username) {
  let { data: player, error } = await supabase.from('players').select('*').eq('tg_id', tgId).single();
  if (error && error.code === 'PGRST116') {
    const { data: newPlayer } = await supabase.from('players').insert([{ tg_id: tgId, username: username, language: 'ru' }]).select().single();
    return newPlayer;
  }
  return player;
}

bot.on('message', async (msg) => {
  const chatId = msg.chat.id; const text = msg.text;
  if (!text || text.startsWith('/')) return;
  if (walletState.get(chatId) === 'awaiting_wallet') {
    const player = await getOrCreatePlayer(chatId, msg.from.username || 'Warbound');
    const lang = player ? (player.language || 'ru') : 'ru';
    const ui = locales[lang]; const cleanText = text.trim();
    const isTonAddress = /^(EQ|UQ)[A-Za-z0-9_-]{42,46}$/.test(cleanText);
    if (isTonAddress) {
      walletState.delete(chatId); await supabase.from('players').update({ wallet_address: cleanText }).eq('tg_id', chatId);
      bot.sendMessage(chatId, ui.wallet_success, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: ui.btn_menu, callback_data: 'back_to_main' }]] } });
    } else { bot.sendMessage(chatId, ui.wallet_invalid, { parse_mode: 'Markdown' }); }
  }
});

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id; const username = msg.from.username || 'Warbound';
  activeBattles.delete(chatId); walletState.delete(chatId);
  const player = await getOrCreatePlayer(chatId, username);
  const lang = player ? (player.language || 'ru') : 'ru'; const text = locales[lang];
  bot.sendMessage(chatId, text.welcome(username, player ? player.gold : 0, player ? player.scrap : 0, player ? player.plasma_cores : 0, player ? player.wallet_address : null), { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [ [{ text: text.btn_arena, callback_data: 'choose_weapon' }], [{ text: text.btn_wastelands, callback_data: 'menu_wastelands' }], [{ text: text.btn_wallet, callback_data: 'menu_wallet' }], [{ text: text.btn_lang, callback_data: 'toggle_language' }] ] } });
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id; const messageId = query.message.message_id; const data = query.data;
  bot.answerCallbackQuery(query.id).catch(() => {});
  const player = await getOrCreatePlayer(chatId, query.from.username || 'Warbound');
  let lang = player ? (player.language || 'ru') : 'ru'; let text = locales[lang];

  if (data === 'toggle_language') {
    const newLang = lang === 'ru' ? 'en' : 'ru'; await supabase.from('players').update({ language: newLang }).eq('tg_id', chatId); text = locales[newLang];
    let menuMsg = text.welcome(query.from.username || 'Warbound', player ? player.gold : 0, player ? player.scrap : 0, player ? player.plasma_cores : 0, player ? player.wallet_address : null);
    bot.editMessageText(menuMsg, { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: [ [{ text: text.btn_arena, callback_data: 'choose_weapon' }], [{ text: text.btn_wastelands, callback_data: 'menu_wastelands' }], [{ text: text.btn_wallet, callback_data: 'menu_wallet' }], [{ text: text.btn_lang, callback_data: 'toggle_language' }] ] } }).catch(() => {}); return;
  }

  if (data === 'menu_wallet') { walletState.set(chatId, 'awaiting_wallet'); bot.editMessageText(text.wallet_menu(player ? player.wallet_address : null), { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: text.btn_menu, callback_data: 'back_to_main' }]] } }).catch(() => {}); }
  if (data === 'menu_wastelands') {
    walletState.delete(chatId);
    if (activeExpeditions.has(chatId)) {
      const exp = activeExpeditions.get(chatId); const mins = Math.floor((Date.now() - exp.startTime) / 60000);
      bot.editMessageText(text.wastelands_farming(mins), { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: text.btn_claim, callback_data: 'claim_loot' }]] } }).catch(() => {});
    } else {
      bot.editMessageText(text.wastelands_desc, { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: [ [{ text: text.btn_start_farm, callback_data: 'start_expedition' }], [{ text: text.btn_menu, callback_data: 'back_to_main' }] ] } });
    }
  }
  if (data === 'start_expedition') { activeExpeditions.set(chatId, { startTime: Date.now() }); bot.editMessageText(text.farm_started, { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: text.btn_status, callback_data: 'menu_wastelands' }]] } }).catch(() => {}); }
  if (data === 'claim_loot') {
    const exp = activeExpeditions.get(chatId); if (!exp) return;
    const secs = Math.floor((Date.now() - exp.startTime) / 1000); if (secs < 5) return bot.sendMessage(chatId, text.too_early);
    const goldEarned = secs * 2; const scrapEarned = secs * 5; const isEpic = Math.random() < 0.15; const coresEarned = isEpic ? 1 : 0;
    activeExpeditions.delete(chatId);
    await supabase.from('players').update({ gold: ((player ? player.gold : 0) || 0) + goldEarned, scrap: ((player ? player.scrap : 0) || 0) + scrapEarned, plasma_cores: ((player ? player.plasma_cores : 0) || 0) + coresEarned }).eq('tg_id', chatId);
    bot.sendMessage(chatId, text.loot_report(goldEarned, scrapEarned, isEpic), { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: text.btn_menu, callback_data: 'back_to_main' }]] } });
  }

  if (data === 'choose_weapon') { walletState.delete(chatId); bot.editMessageText(text.choose_weapon, { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: [ [{ text: text.btn_bow, callback_data: 'w_bow' }], [{ text: text.btn_claws, callback_data: 'w_claws' }] ] } }).catch(() => {}); }

  if (data === 'w_bow' || data === 'w_claws') {
    const sw = data === 'w_bow' ? 'bow' : 'claws'; activeBattles.set(chatId, { playerHp: 100, predatorHp: 100, weapon: sw, playerAttackZone: null });
    bot.editMessageText(`🪐 *АРЕНА ПОТАЛЫ*\n\n${text.arena_intro}`, { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: arena.getAttackKeyboard(lang) });
  }

  if (data.startsWith('a_atk_')) {
    const zone = data.replace('a_atk_', ''); const battle = activeBattles.get(chatId);
    if (!battle) return bot.sendMessage(chatId, "Бой не найден.");
    battle.playerAttackZone = zone;
    bot.editMessageText(`🪐 *АРЕНА ПОТАЛЫ*\n\n${text.arena_defend_intro}`, { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: arena.getDefendKeyboard(lang) });
  }

  if (data.startsWith('a_def_')) {
    const playerDefendZone = data.replace('a_def_', ''); const battle = activeBattles.get(chatId);
    if (!battle || !battle.playerAttackZone) return bot.sendMessage(chatId, "Ошибка шага боя.");

    const zones = Object.keys(arena.BATTLE_ZONES);
    const predatorAttack = zones[Math.floor(Math.random() * zones.length)];
    const predatorDefend = zones[Math.floor(Math.random() * zones.length)];
    const wp = arena.WEAPON_BALANCING[battle.weapon];

    let pDamage = 0; let predDamage = 0; let log = [];

    log.push(lang === 'ru' ? `*⚔️ ТВОЙ ХОД:* Ты бьешь в *${arena.BATTLE_ZONES[battle.playerAttackZone].ru}*` : `*⚔️ YOUR TURN:* You strike *${arena.BATTLE_ZONES[battle.playerAttackZone].en}*`);
    log.push(lang === 'ru' ? `🛸 Хищник блок на *${arena.BATTLE_ZONES[predatorDefend].ru}*` : `🛸 Predator blocked *${arena.BATTLE_ZONES[predatorDefend].en}*`);

    if (battle.playerAttackZone === predatorDefend) {
      log.push(lang === 'ru' ? `🛡 *Заблокировано!*` : `🛡 *Blocked!*`);
    } else {
      pDamage = wp.directDamage;
      if (battle.weapon === 'claws' && battle.playerAttackZone === 'head' && Math.random() < wp.critChance) {
        pDamage = Math.round(pDamage * wp.critMultiplier);
        log.push(lang === 'ru' ? `💥 *КРИТ!* Когти Вин Чун вскрывают Head на *-${pDamage} HP*!` : `💥 *CRIT!* Claws rip Head for *-${pDamage} HP*!`);
      } else {
        log.push(lang === 'ru' ? `🩸 Попадание! Нанесено *-${pDamage} HP*.` : `🩸 Hit! Sustained *-${pDamage} HP*.`);
      }
    }

    log.push(lang === 'ru' ? `\n*⚠️ ХОД ХИЩНИКА:* Он атакует в *${arena.BATTLE_ZONES[predatorAttack].ru}*` : `\n*⚠️ PREDATOR:* Attacks *${arena.BATTLE_ZONES[predatorAttack].en}*`);
    log.push(lang === 'ru' ? `🛡 Твой блок установлен на *${arena.BATTLE_ZONES[playerDefendZone].ru}*` : `🛡 Block *${arena.BATTLE_ZONES[playerDefendZone].en}*`);

    if (predatorAttack === playerDefendZone) {
      log.push(lang === 'ru' ? `✅ *Успешный блок!*` : `✅ *Dodge!*`);
    } else {
      predDamage = 20; log.push(lang === 'ru' ? `💥 Пропущено! *-${predDamage} HP*.` : `💥 Failed! *-${predDamage} HP*.`);
    }

    battle.playerHp = Math.max(0, battle.playerHp - predDamage); battle.predatorHp = Math.max(0, battle.predatorHp - pDamage); battle.playerAttackZone = null;
    const statusReport = lang === 'ru' ? `\n\n📊 *СТАТУС:* ❤️ Ты: *${battle.playerHp} HP* | 👽 Враг: *${battle.predatorHp} HP*` : `\n\n📊 *STATUS:* ❤️ You: *${battle.playerHp} HP* | 👽 Enemy: *${battle.predatorHp} HP*`;

