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
  let { data: p, error } = await supabase.from('players').select('*').eq('tg_id', tgId).single();
  if (error && error.code === 'PGRST116') {
    const { data: n } = await supabase.from('players').insert([{ tg_id: tgId, username: username, language: 'ru' }]).select().single();
    return n;
  }
  return p;
}

function getMainMenuKeyboard(text) {
  return { inline_keyboard: [ 
    [{ text: text.btn_arena, callback_data: 'choose_weapon' }], 
    [{ text: text.btn_wastelands, callback_data: 'menu_wastelands' }, { text: text.btn_market, callback_data: 'menu_market' }], 
    [{ text: text.btn_wallet, callback_data: 'menu_wallet' }], 
    [{ text: text.btn_lang, callback_data: 'toggle_language' }] 
  ]};
}

bot.on('message', async (msg) => {
  const chatId = msg.chat.id; const text = msg.text;
  if (!text || text.startsWith('/')) return;
  if (walletState.get(chatId) === 'awaiting_wallet') {
    walletState.delete(chatId); await supabase.from('players').update({ wallet_address: text.trim() }).eq('tg_id', chatId);
    bot.sendMessage(chatId, locales.ru.wallet_success, { parse_mode: 'Markdown' });
  }
});

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id; const username = msg.from.username || 'Warbound';
  activeBattles.delete(chatId); walletState.delete(chatId);
  const p = await getOrCreatePlayer(chatId, username); const lang = p?.language || 'ru'; const text = locales[lang];
  bot.sendMessage(chatId, text.welcome(username, p?.gold || 0, p?.scrap || 0, p?.plasma_cores || 0, p?.wallet_address, p?.mp, p?.stamina, p?.marsel_diamonds), { parse_mode: 'Markdown', reply_markup: getMainMenuKeyboard(text) });
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id; const messageId = query.message.message_id; const data = query.data;
  bot.answerCallbackQuery(query.id).catch(() => {});
  let p = await getOrCreatePlayer(chatId, query.from.username || 'Warbound');
  let lang = p?.language || 'ru'; let text = locales[lang];

  if (data === 'toggle_language') {
    const newLang = lang === 'ru' ? 'en' : 'ru'; await supabase.from('players').update({ language: newLang }).eq('tg_id', chatId);
    p = await getOrCreatePlayer(chatId, query.from.username || 'Warbound'); text = locales[newLang];
    bot.editMessageText(text.welcome(query.from.username || 'Warbound', p?.gold || 0, p?.scrap || 0, p?.plasma_cores || 0, p?.wallet_address, p?.mp, p?.stamina, p?.marsel_diamonds), { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: getMainMenuKeyboard(text) }); return;
  }
  if (data === 'menu_wallet') { walletState.set(chatId, 'awaiting_wallet'); bot.editMessageText(text.wallet_menu(p?.wallet_address), { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: text.btn_menu, callback_data: 'back_to_main' }]] } }); }
  if (data === 'menu_wastelands') {
    if (activeExpeditions.has(chatId)) {
      const exp = activeExpeditions.get(chatId); const mins = Math.floor((Date.now() - exp.startTime) / 60000);
      bot.editMessageText(text.wastelands_farming(mins), { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: text.btn_claim, callback_data: 'claim_loot' }]] } });
    } else {
      bot.editMessageText(text.wastelands_desc, { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: [ [{ text: text.btn_start_farm, callback_data: 'start_expedition' }], [{ text: text.btn_menu, callback_data: 'back_to_main' }] ] } });
    }
  }
  if (data === 'start_expedition') { activeExpeditions.set(chatId, { startTime: Date.now() }); bot.editMessageText(text.farm_started, { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: text.btn_status, callback_data: 'menu_wastelands' }]] } }); }
  if (data === 'claim_loot') {
    const exp = activeExpeditions.get(chatId); if (!exp) return;
    const mins = Math.floor((Date.now() - exp.startTime) / 60000); if (mins < 1) return bot.sendMessage(chatId, text.too_early);
    const gEarned = Math.floor(mins * (2 / 60)); const sEarned = Math.floor(mins * (5 / 60)); const isEpic = Math.random() < 0.15;
    activeExpeditions.delete(chatId); await supabase.from('players').update({ gold: (p?.gold || 0) + gEarned, scrap: (p?.scrap || 0) + sEarned, plasma_cores: (p?.plasma_cores || 0) + (isEpic ? 1 : 0) }).eq('tg_id', chatId);
    bot.sendMessage(chatId, text.loot_report(gEarned, sEarned, isEpic), { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: text.btn_menu, callback_data: 'back_to_main' }]] } });
  }

  if (data === 'menu_market') {
    const { data: cfg } = await supabase.from('game_config').select('value_int').eq('key', 'merchant_gold').single();
    bot.editMessageText(text.market_menu(cfg?.value_int || 0, p?.plasma_cores || 0), { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: [ [{ text: text.btn_sell_mask, callback_data: 'sell_mask' }], [{ text: text.btn_menu, callback_data: 'back_to_main' }] ] } });
  }
  if (data === 'sell_mask') {
    const { data: cfg } = await supabase.from('game_config').select('value_int').eq('key', 'merchant_gold').single();
    const mGold = cfg?.value_int || 0; const masks = p?.plasma_cores || 0;
    if (mGold < 500) return bot.sendMessage(chatId, text.market_empty_merchant, { parse_mode: 'Markdown' });
    if (masks < 1) return bot.sendMessage(chatId, text.market_no_items, { parse_mode: 'Markdown' });
    await supabase.from('players').update({ gold: (p?.gold || 0) + 500, plasma_cores: masks - 1 }).eq('tg_id', chatId);
    await supabase.from('game_config').update({ value_int: mGold - 500 }).eq('key', 'merchant_gold');
    bot.editMessageText(text.market_success_sell, { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: text.btn_menu, callback_data: 'back_to_main' }]] } });
  }

  if (data === 'choose_weapon') { 
    bot.editMessageText(text.choose_weapon, { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: [ 
      [{ text: text.btn_melee_cat, callback_data: 'cat_melee' }, { text: text.btn_throw_cat, callback_data: 'cat_throw' }] 
    ] } }); 
  }
  if (data === 'cat_melee') {
    bot.editMessageText(lang === 'ru' ? "⚔️ *ВЫБЕРИ КЛИНКОВОЕ ОРУЖИЕ:*" : "⚔️ *SELECT MELEE GEAR:*", { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: [
      [{ text: "⚔️ Ritual Blades", callback_data: 'w_blades' }, { text: "⚔️ Officer Saber", callback_data: 'w_saber' }],
      [{ text: "⚔️ Heavy Sword", callback_data: 'w_sword' }, { text: "🔪 Tactical Knife", callback_data: 'w_knife' }]
    ] } });
  }
  if (data === 'cat_throw') {
    bot.editMessageText(lang === 'ru' ? "💣 *ВЫБЕРИ МЕТАТЕЛЬНЫЙ АРСЕНАЛ:*" : "💣 *SELECT THROWABLE GEAR:*", { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: [
      [{ text: "🎯 Throwing Knives", callback_data: 'w_th_knives' }, { text: "🪓 Combat Axes", callback_data: 'w_axes' }],
      [{ text: "⭐ Steel Stars", callback_data: 'w_stars' }, { text: "💣 Targeted Explosive", callback_data: 'w_explosives' }]
    ] } });
  }

  if (data.startsWith('w_')) {
    const selectedWp = data.replace('w_', '');
    activeBattles.set(chatId, { playerHp: 100, predatorHp: 100, weapon: selectedWp, playerAttackZone: null, weapon_dura: 100, armor_dura: 100 });
    bot.editMessageText(`⚜️ *ARENA v3.9*\n\n${text.arena_intro}`, { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: arena.getAttackKeyboard(lang) });
  }

  if (data.startsWith('a_atk_')) {
    const zone = data.replace('a_atk_', ''); const battle = activeBattles.get(chatId);
    if (!battle) return bot.sendMessage(chatId, "Battle error.");
    battle.playerAttackZone = zone;
    bot.editMessageText(`⚜️ *ARENA v3.9*\n\n${text.arena_defend_intro}`, { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: arena.getDefendKeyboard(lang) });
  }

  if (data.startsWith('a_def_')) {
    const playerDefendZone = data.replace('a_def_', ''); const battle = activeBattles.get(chatId);
    if (!battle || !battle.playerAttackZone) return bot.sendMessage(chatId, "Step error.");

    // Вызываем изолированный боевой расчет из файла arena.js
    const turnResult = arena.runBattleTurn(battle, playerDefendZone, lang);
    const hpBar = '█'.repeat(Math.round(battle.playerHp / 10)) + '░'.repeat(10 - Math.round(battle.playerHp / 10));
    
    const statusReport = lang === 'ru' 
      ? `\n\n📊 *STATUS:* ❤️ Ты: [${hpBar}] ${battle.playerHp} HP │ 👽 Враг: ${battle.predatorHp} HP\n\n🎒 *GEAR DURA:*\n🏹 Weapon: ${battle.weapon_dura}% │ 🛡️ Armor: ${battle.armor_dura}%`
      : `\n\n📊 *STATUS:* ❤️ You: [${hpBar}] ${battle.playerHp} HP │ 👽 Enemy: ${battle.predatorHp} HP\n\n🎒 *GEAR DURA:*\n🏹 Weapon: ${battle.weapon_dura}% │ 🛡️ Armor: ${battle.armor_dura}%`;

    if (battle.predatorHp <= 0) {
      let kbd = [[{ text: text.btn_menu, callback_data: 'back_to_main' }]];
