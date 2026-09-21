const arena = require('./arena');

const locales = {
  ru: {
    welcome: (name, g, s, c, w, mp=100, st=100, d=4) => {
      let wStr = w ? `┃ 💎 TON WALLET: \`\${w.slice(0,6)}...\${w.slice(-6)}\`\n` : '┃ 💎 TON WALLET: Not linked\n';
      let cStr = c > 0 ? `┃ 👑 CORES: *\${c} CORE*\n` : '';
      return `╔══════════════════════════════════╗\n   ⚜️  E P O C H  G A M E  v2.0 ⚜️\n╚══════════════════════════════════╝\n🪐 *ПЛАНЕТА ПОТАЛА • СЕССИЯ v2.0*\n\n┃ 👤 WARRIOR: *\({name}*\n┃ ⚜️ BALANCE: *\){g} GOLD* │ ⚙️ SCRAP: *\({s}*\n\){cStr}wStr┃ 🔷 MANA: *{mp} MP* │ 🟢 STAMINA: *\({st}\%*\n┃ _M. Diamonds: \){'♦︎'.repeat(d) || 'None'}_\n──────────────────────────────────\nВоин, выбери свой путь:`;
    },
    btn_arena: "⚔️ Enter Arena / Войти на Арену", btn_wastelands: "🏜️ Пустоши (Авто-фарм)", btn_wallet: "💎 Wallet / TON Кошелек", btn_lang: "🌍 Change Language / Сменить язык", btn_menu: "↩️ Menu / В Меню",
    wastelands_farming: (mins) => `╔══════════════════════════════════╗\n          🏜️ ПУСТОШИ (АВТО-ФАРМ)      \n╚══════════════════════════════════╝\n⏱ Время в экспедиции: *\${mins} мин.*\n\n┃ _Сервер ведет охоту в бэкграунде._\n┃ _Твой телефон может быть выключен._`,
    wastelands_desc: `╔══════════════════════════════════╗\n          🏜️ ПУСТОШИ (АВТО-ФАРМ)      \n╚══════════════════════════════════╝\n🪐 Бесконечные темные сектора Поталы.\n\n┃ 💰 Авто-добыча Золота и Лома 24/7.\n┃ 🎁 Шанс 15% найти редкое Ядро Plasma Core.\n──────────────────────────────────`,
    btn_claim: "🎒 Собрать добычу", btn_start_farm: "🚀 Запустить авто-фарм", btn_status: "📊 Статус", farm_started: "🚀 *Экспедиция запущена!* Процесс пошел.", too_early: "⏳ Поход только начался! Поисковые дроны еще собирают данные.",
    loot_report: (g, s, e) => `╔══════════════════════════════════╗\n             🎒 ОТЧЕТ ПО ЛУТУ          \n╚══════════════════════════════════╝\nДобыча успешно доставлена на склад:\n\n┃ ⚜️ Золото: *+\${g}*\n┃ ⚙️ Металлолом: *+\({s}*\n\){e ? '┃ ⚡ *НАХОДКА:* Редкое Энергетическое Ядро!\n' : ''}──────────────────────────────────\nДанные сохранены в Supabase.`,
    choose_weapon: "╔══════════════════════════════════╗\n            ⚔️ ВЫБОР СНАРЯЖЕНИЯ        \n╚══════════════════════════════════╝\n\nВыбери боевой стиль для Арены v3.9:", btn_bow: "🏹 Compound Bow [Poison]", btn_claws: "🩸 Energy Claws [Damage]",
    wallet_menu: (w) => w ? `╔══════════════════════════════════╗\n            💎 TONKEEPER WALLET       \n╚══════════════════════════════════╝\n┃ Успешно привязан к системе.\n┃ Адрес: \`${w}\`` : `╔══════════════════════════════════╗\n            💎 TONKEEPER WALLET       \n╚══════════════════════════════════╝\n┃ Кошелек не обнаружен.\n\n_Отправь адрес своего TON-кошелька текстовым сообщением._`,
    wallet_success: "✅ *Синхронизация успешна!*", wallet_invalid: "❌ *Ошибка формата кошелька!*",
    arena_intro: "🛸 Перед тобой свирепый Alien Hunter (100 HP).\n\n*ВЫБЕРИ НАПРАВЛЕНИЕ УДАРA:*", arena_defend_intro: "🎯 Цель зафиксирована!\n*ВЫБЕРИ НАПРАВЛЕНИЕ БЛОКА:*",
    arena_win: "⚜️ ═══ П О Б Е Д А ═══ ⚜️\n\n🏆 Ты поверг Чужого на Потале!\nWeb3-модуль готовит трансляцию NFT...", arena_lose: "💀 ═══ Т Ы  П О Г И Б ═══ 💀\n\nИнопланетный Охотник оказался сильнее. Твое снаряжение повреждено!"
  },
  en: {
    welcome: (name, g, s, c, w, mp=100, st=100, d=4) => {
      let wStr = w ? `┃ 💎 TON WALLET: \`\${w.slice(0,6)}...\${w.slice(-6)}\`\n` : '┃ 💎 TON WALLET: Not connected\n';
      let cStr = c > 0 ? `┃ 👑 PLASMA CORES: *${c} CORE*\n` : '';
      return `╔══════════════════════════════════╗\n   ⚜️  E P O C H  G A M E  v2.0 ⚜️\n╚══════════════════════════════════╝\n🪐 *PLANET POTALA • SESSION v2.0*\n\n┃ 👤 WARRIOR: *${name}*\n┃ ⚜️ BALANCE: *${g} GOLD* │ ⚙️ SCRAP: *${s}*\n${cStr}${wStr}┃ 🔷 MANA: *${mp} MP* │ 🟢 STAMINA: *${st}%*\n┃ _M. Diamonds: ${'♦︎'.repeat(d) || 'None'}_\n──────────────────────────────────\nWarrior, choose your path:`;
    },
    btn_arena: "⚔️ Enter Arena / Войти на Арену", btn_wastelands: "🏜️ Wastelands / Пустоши (Фарм)", btn_wallet: "💎 Wallet / TON Кошелек", btn_lang: "🌍 Change Language / Сменить язык", btn_menu: "↩️ Menu / В Меню",
    choose_weapon: "╔══════════════════════════════════╗\n            ⚔️ GEAR SELECTION         \n╚══════════════════════════════════╝\n\nSelect your combat gear for the Arena:", btn_bow: "🏹 Compound Bow [Poison]", btn_claws: "🩸 Energy Claws [Damage]",
    arena_intro: "🛸 A fierce Alien Hunter stands before you (100 HP).\n\n*CHOOSE YOUR ATTACK TARGET:*", arena_defend_intro: "🎯 Target locked!\n*CHOOSE YOUR BLOCK DIRECTION:*",
    arena_win: "⚜️ ═══ V I C T O R Y ═══ ⚜️\n\n🏆 You defeated the Alien Hunter!\nWeb3 module is broadcasting NFT...", arena_lose: "💀 ═══ W A R R I O R  D I E D ═══ 💀\n\nThe Alien Hunter was stronger!"
  }
};

module.exports = locales;
