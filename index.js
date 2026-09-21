const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const { createClient } = require('@supabase/supabase-js');

// 1. Проверка секретных ключей
const token = process.env.TELEGRAM_TOKEN;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!token || !supabaseUrl || !supabaseKey) {
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Заглушка для Render, чтобы сервер не засыпал
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Active');
}).listen(port);

const bot = new TelegramBot(token, { polling: true });

// 2. Хранилища состояний в оперативной памяти сервера
const activeExpeditions = new Map();
const walletState = new Map();
const activeBattles = new Map(); // Для Арены v3.0

// ==========================================
// НАСТРОЙКИ БАЛАНСА АРЕНЫ v3.0 (Apex / CS style)
// ==========================================
const WEAPON_BALANCING = {
    bow: {
        name_ru: "Лук Пенчак Силат [Яд]",
        name_en: "Bow (Pencak Silat) [Poison]",
        directDamage: 15,
        poisonDamage: 8,
        poisonDuration: 3
    },
    claws: {
        name_ru: "Когти Вин Чун [Урон]",
        name_en: "Claws (Wing Chun) [Damage]",
        directDamage: 30,
        critChance: 0.35,
        critMultiplier: 1.5
    }
};

const BATTLE_ZONES = {
    head: { ru: "🎯 Голова (Head)", en: "🎯 Head" },
    chest: { ru: "🛡 Грудь (Chest)", en: "🛡 Chest" },
    belt: { ru: "🎒 Пояс (Belt)", en: "🎒 Belt" },
    legs: { ru: "🦿 Ноги (Legs)", en: "🦿 Legs" }
};

// ==========================================
// СЛОВАРЬ ЛОКАЛИЗАЦИИ (Языковые пакеты)
// ==========================================
const locales = {
  ru: {
    welcome: (name, gold, scrap, cores, wallet) => {
      let wStr = wallet ? '💎 TON Кошелек: ' + wallet.slice(0,6) + '...' + wallet.slice(-6) + '\n' : '💎 Кошелек: Не привязан\n';
      let cStr = cores > 0 ? '⚡ Ядра Яутжа: ' + cores + ' шт.\n' : '';
      return '🪐 *ДОБРО ПОЖАЛЬ НА ПЛАНЕТУ ПОТАЛА* 🪐\n\nПриветствуем тебя, *' + name + '*!\n💰 Баланс: *' + gold + ' Gold* | ⚙️ Лом: *' + scrap + '*\n' + cStr + wStr + '\nВоин, выбери свой путь:';
    },
    btn_arena: "⚔️ Войти на Арену",
    btn_wastelands: "🏜️ Пустоши (Авто-фарм)",
    btn_wallet: "💎 Кошелек / TON Wallet",
    btn_lang: "🌍 Сменить язык / Change Language",
    btn_menu: "↩️ В Меню",
    wastelands_farming: (mins) => '🏜 *ПУСТОШИ*\n⏱ Время в походе: *' + mins + ' мин.*\n\n_Сервер ведет охоту! Твой телефон может быть выключен._',
    wastelands_desc: "🏜 *ПУСТОШИ*\n💰 Авто-фарм Золота и Металлолома.\n🎁 Шанс 15% найти редкое Ядро Яутжа!",
    btn_claim: "🎒 Собрать добычу",
    btn_start_farm: "🚀 Запустить авто-фарм",
    btn_status: "📊 Статус",
    farm_started: "🚀 *Фарм запущен!* Выходи из бота, выключай телефон — процесс идет на сервере.",
    too_early: "⏳ Прошло слишком мало времени! Пустоши еще не принесли плодов.",
    loot_report: (gold, scrap, epic) => {
      let eStr = epic ? '\n🔥 *СЮРПРИЗ:* Найдено *⚡ Plasma Core Яутжа*!' : '';
      return '🎒 *ДОБЫЧА ИЗ ПУСТОШЕЙ:* \n💰 Золото: *+' + gold + '*\n⚙️ Металлолом: *+' + scrap + '*' + eStr + '\n\nДанные сохранены в базу.';
    },
    choose_weapon: "⚔️ *ВЫБЕРИ СНАРЯЖЕНИЕ ДЛЯ АРЕНЫ:*",
    btn_bow: "🏹 Лук (Пенчак Силат) [Яд]",
    btn_claws: "🩸 Когти (Вин Чун) [Урон]",
    wallet_menu: (wallet) => wallet ? '💎 *ТВОЙ TON КОШЕЛЕК:* \n`' + wallet + '`\n\nТы можешь отправить новый адрес сообщением, чтобы изменить его.' : '💎 *ПОДКЛЮЧЕНИЕ TON КОШЕЛЬКА* \n\nОтправь мне адрес своего TON кошелька (например, из Tonkeeper) обычным текстовым сообщением в ответ на это меню.',
    wallet_success: "✅ *Успех!* Твой TON кошелек успешно привязан и сохранен в вечную базу данных!",
    wallet_invalid: "❌ *Ошибка!* Неверный формат TON адреса. Адрес должен начинаться на EQ или UQ и содержать около 48 символов. Попробуй еще раз!",
    arena_intro: "🛸 Перед тобой свирепый Хищник Яутжа (100 HP).\n\n*ВЫБЕРИ ЗОНУ ДЛЯ УДАРА:*",
    arena_defend_intro: "🎯 Цель зафиксирована!\n*ТЕПЕРЬ УСТАНОВИ БЛОК ДЛЯ ЗАЩИТЫ:*",
    arena_win: "🎉 *ПОБЕДА НА АРЕНЕ!*\n\n🏆 Ты поверг Хищника Поталы! Твой Web3-модуль начинает оцифровку трофея для отправки в Tonkeeper...",
    arena_lose: "💀 *ТЫ ПОГИБ!*\n\nХищник оказался сильнее. Твое снаряжение повреждено. Подлечись в меню!"
  },
  en: {
    welcome: (name, gold, scrap, cores, wallet) => {
      let wStr = wallet ? '💎 TON Wallet: ' + wallet.slice(0,6) + '...' + wallet.slice(-6) + '\n' : '💎 Wallet: Not connected\n';
      let cStr = cores > 0 ? '⚡ Yautja Cores: ' + cores + ' pcs\n' : '';
      return '🪐 *WELCOME TO PLANET POTALA* 🪐\n\nGreetings, *' + name + '*!\n💰 Balance: *' + gold + ' Gold* | ⚙️ Scrap: *' + scrap + '*\n' + cStr + wStr + '\nWarrior, choose your path:';
    },
    btn_arena: "⚔️ Enter Arena",
    btn_wastelands: "🏜️ Wastelands (Auto-Farm)",
    btn_wallet: "💎 Wallet / TON Wallet",
    btn_lang: "🌍 Change Language / Сменить язык",
    btn_menu: "↩️ Menu",
    wastelands_farming: (mins) => '🏜 *WASTELANDS*\n⏱ Farming time: *' + mins + ' min*\n\n_Server is hunting! Your phone can be OFF!_',
    wastelands_desc: "🏜 *WASTELANDS*\n💰 Auto-farm Gold & Scrap.\n🎁 15% Lucky chance for Yautja Core!",
    btn_claim: "🎒 Claim Loot",
    btn_start_farm: "🚀 Start Auto-Farm",
    btn_status: "📊 Status",
    farm_started: "🚀 *Farming Started!* Close the bot, turn off your phone — server is running.",
    too_early: "⏳ Too early! Wastelands haven't brought any rewards yet.",
    loot_report: (gold, scrap, epic) => {
      let eStr = epic ? '\n🔥 *SURPRISE:* Found *⚡ Yautja Plasma Core*!' : '';
      return '🎒 *WASTELANDS LOOT:* \n💰 Gold: *+' + gold + '*\n⚙️ Scrap: *+' + scrap + '*' + eStr + '\n\nData saved securely to DB.';
    },
    choose_weapon: "⚔️ *SELECT YOUR GEAR:*",
    btn_bow: "🏹 Bow (Pencak Silat) [Poison]",
    btn_claws: "🩸 Claws (Wing Chun) [Damage]",
    wallet_menu: (wallet) => wallet ? '💎 *YOUR TON WALLET:* \n`' + wallet + '`\n\nYou can send a new address as a text message to change it.' : '💎 *CONNECT TON WALLET* \n\nSend your TON wallet address (e.g., from Tonkeeper) as a plain text message to this chat.',
    wallet_success: "✅ *Success!* Your TON wallet has been linked and saved securely!",
    wallet_invalid: "❌ *Error!* Invalid TON address format. It must start with EQ or UQ and be around 48 chars long. Try again!",
    arena_intro: "🛸 A fierce Predator Yautja stands before you (100 HP).\n\n*CHOOSE YOUR TARGET ZONE:*",
    arena_defend_intro: "🎯 Target locked!\n*NOW CHOOSE YOUR DEFENSE ZONE:*",
    arena_win: "🎉 *ARENA VICTORY!*\n\n🏆 You defeated the Predator! Your Web3 module is minting a trophy for your Tonkeeper...",
    arena_lose: "💀 *YOU DIED!*\n\nThe Predator was stronger. Your gear is damaged. Heal up in the menu!"
  }
};

// Вспомогательные клавиатуры Арены v3.0
function getAttackKeyboard(lang) {
  return {
    inline_keyboard: Object.keys(BATTLE_ZONES).map(zone => [
      { text: `⚔️ ${BATTLE_ZONES[zone][lang]}`, callback_data: `a_atk_${zone}` }
    ])
  };
}

function getDefendKeyboard(lang) {
  return {
    inline_keyboard: Object.keys(BATTLE_ZONES).map(zone => [
      { text: `🛡 ${BATTLE_ZONES[zone][lang]}`, callback_data: `a_def_${zone}` }
    ])
  };
}

// Поиск или создание записи игрока в Supabase
async function getOrCreatePlayer(tgId, username) {
  let { data: player, error } = await supabase.from('players').select('*').eq('tg_id', tgId).single();
  if (error && error.code === 'PGRST116') {
    const { data: newPlayer } = await supabase.from('players').insert([{ tg_id: tgId, username: username, language: 'ru' }]).select().single();
    return newPlayer;
  }
  return player;
}
// Обработчик текстовых сообщений (Привязка TON-кошелька)
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

// Команда /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id; const username = msg.from.username || 'Warbound';
  activeBattles.delete(chatId); walletState.delete(chatId);
  const player = await getOrCreatePlayer(chatId, username);
  const lang = player ? (player.language || 'ru') : 'ru'; const text = locales[lang];
  bot.sendMessage(chatId, text.welcome(username, player ? player.gold : 0, player ? player.scrap : 0, player ? player.plasma_cores : 0, player ? player.wallet_address : null), { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [ [{ text: text.btn_arena, callback_data: 'choose_weapon' }], [{ text: text.btn_wastelands, callback_data: 'menu_wastelands' }], [{ text: text.btn_wallet, callback_data: 'menu_wallet' }], [{ text: text.btn_lang, callback_data: 'toggle_language' }] ] } });
});

// ==========================================
// ГЛАВНЫЙ ОБРАБОТЧИК КНОПОК (CALLBACK QUERIES)
// ==========================================
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id; const messageId = query.message.message_id; const data = query.data;
  bot.answerCallbackQuery(query.id).catch(() => {});
  
  const player = await getOrCreatePlayer(chatId, query.from.username || 'Warbound');
  let lang = player ? (player.language || 'ru') : 'ru'; let text = locales[lang];

  // Смена языка
  if (data === 'toggle_language') {
    const newLang = lang === 'ru' ? 'en' : 'ru'; await supabase.from('players').update({ language: newLang }).eq('tg_id', chatId); text = locales[newLang];
    let menuMsg = text.welcome(query.from.username || 'Warbound', player ? player.gold : 0, player ? player.scrap : 0, player ? player.plasma_cores : 0, player ? player.wallet_address : null);
    bot.editMessageText(menuMsg, { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: [ [{ text: text.btn_arena, callback_data: 'choose_weapon' }], [{ text: text.btn_wastelands, callback_data: 'menu_wastelands' }], [{ text: text.btn_wallet, callback_data: 'menu_wallet' }], [{ text: text.btn_lang, callback_data: 'toggle_language' }] ] } }).catch(() => {}); return;
  }

  // Меню кошелька
  if (data === 'menu_wallet') { walletState.set(chatId, 'awaiting_wallet'); bot.editMessageText(text.wallet_menu(player ? player.wallet_address : null), { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: text.btn_menu, callback_data: 'back_to_main' }]] } }).catch(() => {}); }
  
  // Меню Пустошей (Авто-фарм)
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

  // ==========================================
  // ДВИЖОК АРЕНЫ v3.0 (ВЫБОР ОРУЖИЯ И БОЙ)
  // ==========================================
  if (data === 'choose_weapon') { 
    walletState.delete(chatId); 
    bot.editMessageText(text.choose_weapon, { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: [ [{ text: locales[lang].btn_bow, callback_data: 'w_bow' }], [{ text: locales[lang].btn_claws, callback_data: 'w_claws' }] ] } }).catch(() => {}); 
  }

  // Игрок выбрал оружие -> старт раунда
  if (data === 'w_bow' || data === 'w_claws') {
    const selectedWeapon = data === 'w_bow' ? 'bow' : 'claws';
    activeBattles.set(chatId, {
      playerHp: 100,
      predatorHp: 100,
      weapon: selectedWeapon,
      playerAttackZone: null
    });
    bot.editMessageText(`🪐 *АРЕНА ПОТАЛЫ*\n\n${text.arena_intro}`, {
      chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
      reply_markup: getAttackKeyboard(lang)
    });
  }

  // Клик по кнопке Атаки
  if (data.startsWith('a_atk_')) {
    const zone = data.replace('a_atk_', '');
    const battle = activeBattles.get(chatId);
    if (!battle) return bot.sendMessage(chatId, "Бой не найден. Начни заново через меню.");
    
    battle.playerAttackZone = zone;
    
    bot.editMessageText(`🪐 *АРЕНА ПОТАЛЫ*\n\n${text.arena_defend_intro}`, {
      chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
      reply_markup: getDefendKeyboard(lang)
    });
  }

  // Клик по кнопке Защиты -> Считаем результаты столкновения
  if (data.startsWith('a_def_')) {
    const playerDefendZone = data.replace('a_def_', '');
    const battle = activeBattles.get(chatId);
    if (!battle || !battle.playerAttackZone) return bot.sendMessage(chatId, "Ошибка шага боя.");

    const zones = Object.keys(BATTLE_ZONES);
    const predatorAttack = zones[Math.floor(Math.random() * zones.length)];
    const predatorDefend = zones[Math.floor(Math.random() * zones.length)];
    const wp = WEAPON_BALANCING[battle.weapon];

    let pDamage = 0; let predDamage = 0; let log = [];

    // 1. Атака игрока
    log.push(lang === 'ru' ? `*⚔️ ТВОЙ ХОД:* Ты бьешь в *${BATTLE_ZONES[battle.playerAttackZone].ru}*` : `*⚔️ YOUR TURN:* You strike *${BATTLE_ZONES[battle.playerAttackZone].en}*`);
    log.push(lang === 'ru' ? `🛸 Хищник выставил блок на *${BATTLE_ZONES[predatorDefend].ru}*` : `🛸 Predator blocked *${BATTLE_ZONES[predatorDefend].en}*`);

    if (battle.playerAttackZone === predatorDefend) {
      log.push(lang === 'ru' ? `🛡 *Заблокировано!* Яутжа парировал удар.` : `🛡 *Blocked!* Yautja countered your strike.`);
    } else {
      pDamage = wp.directDamage;
      if (battle.weapon === 'claws' && battle.playerAttackZone === 'head' && Math.random() < wp.critChance) {
        pDamage = Math.round(pDamage * wp.critMultiplier);
        log.push(lang === 'ru' ? `💥 *КРИТ!* Когти Вин Чун вскрывают Head на *-${pDamage} HP*!` : `💥 *CRIT!* Wing Chun Claws rip Head for *-${pDamage} HP*!`);
      } else if (battle.weapon === 'bow') {
        log.push(lang === 'ru' ? `🏹 Точное попадание! Нанесено *-${pDamage} HP* и наложен *ЯД* 🧪` : `🏹 Direct hit! *-${pDamage} HP* and *POISON* applied 🧪`);
      } else {
        log.push(lang === 'ru' ? `🩸 Попадание! Нанесено *-${pDamage} HP*.` : `🩸 Hit! Sustained *-${pDamage} HP*.`);
      }
    }

    // 2. Атака Хищника
    log.push(lang === 'ru' ? `\n*⚠️ ХОД ХИЩНИКА:* Он атакует в *${BATTLE_ZONES[predatorAttack].ru}*` : `\n*⚠️ PREDATOR TURN:* He attacks *${BATTLE_ZONES[predatorAttack].en}*`);
    log.push(lang === 'ru' ? `🛡 Твой блок установлен на *${BATTLE_ZONES[playerDefendZone].ru}*` : `🛡 Your block set to *${BATTLE_ZONES[playerDefendZone].en}*`);

    if (predatorAttack === playerDefendZone) {
      log.push(lang === 'ru' ? `✅ *Успешный блок!* Ты уклонился от когтей пришельца.` : `✅ *Successful Block!* You dodged the alien claws.`);
    } else {
      predDamage = 20;
      log.push(lang === 'ru' ? `💥 Пропущено! Хищник рвет тебя на *-${predDamage} HP*.` : `💥 Defenseless! Predator tears you for *-${predDamage} HP*.`);
    }

    battle.playerHp = Math.max(0, battle.playerHp - predDamage);
    battle.predatorHp = Math.max(0, battle.predatorHp - pDamage);
    battle.playerAttackZone = null;

    const statusReport = lang === 'ru' 
      ? `\n\n📊 *СТАТУС БОЯ:*\n❤️ Твое здоровье: *${battle.playerHp} HP*\n👽 Здоровье Хищника: *${battle.predatorHp} HP*`
