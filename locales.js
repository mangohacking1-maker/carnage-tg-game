const locales = {
  ru: {
    welcome: (name, g, s, c, w, mp=100, st=100, d=4) => {
      let wStr = w ? `┃ 💎 TON WALLET: \`\${w.slice(0,6)}...\${w.slice(-6)}\`\n` : '┃ 💎 TON WALLET: Not linked\n';
      let cStr = c > 0 ? `┃ 👑 CORES: *${c} CORE*\n` : '';
      return `╔══════════════════════════════════╗\n   ⚜️ C A R N A G E  E P O C H ⚜️\n╚══════════════════════════════════╝\n🪐 *ПЛАНЕТА ПОТАЛА • СЕССИЯ v2.0*\n\n┃ 👤 WARRIOR: *${name}*\n┃ ⚜️ BALANCE: *${g} GOLD* │ ⚙️ SCRAP: *${s}*\n${cStr}${wStr}┃ 🔷 MANA: *${mp} MP* │ 🟢 STAMINA: *${st}%*\n┃ _M. Diamonds: ${'♦︎'.repeat(d) || 'None'}_\n──────────────────────────────────\nВоин, выбери свой путь:`;
    },
    btn_arena: "⚔️ Enter Arena / Войти на Арену", btn_wastelands: "🏜️ Wastelands / Пустоши (Фарм)", btn_wallet: "💎 Wallet / TON Кошелек", btn_lang: "🌍 Change Language / Сменить язык", btn_menu: "↩️ Menu / В Меню",
    choose_weapon: "╔══════════════════════════════════╗\n            ⚔️ GEAR SELECTION         \n╚══════════════════════════════════╝\n\nВыбери экипировку для Арены:", btn_bow: "🏹 Compound Bow [Poison]", btn_claws: "🩸 Energy Claws [Damage]",
    arena_intro: "🛸 Перед тобой свирепый Alien Hunter (100 HP).\n\n*ВЫБЕРИ НАПРАВЛЕНИЕ УДАРA:*", arena_defend_intro: "🎯 Цель зафиксирована!\n*ВЫБЕРИ НАПРАВЛЕНИЕ БЛОКА:*",
    arena_win: "⚜️ ═══ П О Б Е Д А ═══ ⚜️\n\n🏆 Ты поверг Чужого на Потале!\nWeb3-модуль готовит трансляцию NFT...", arena_lose: "💀 ═══ Т Ы  П О Г И Б ═══ 💀\n\nИнопланетный Охотник оказался сильнее. Твое снаряжение повреждено!"
  },
  en: {
    welcome: (name, g, s, c, w, mp=100, st=100, d=4) => {
      let wStr = w ? `┃ 💎 TON WALLET: \`\${w.slice(0,6)}...\${w.slice(-6)}\`\n` : '┃ 💎 TON WALLET: Not connected\n';
      let cStr = c > 0 ? `┃ 👑 PLASMA CORES: *${c} CORE*\n` : '';
      return `╔══════════════════════════════════╗\n   ⚜️ C A R N A G E  E P O C H ⚜️\n╚══════════════════════════════════╝\n🪐 *PLANET POTALA • SESSION v2.0*\n\n┃ 👤 WARRIOR: *${name}*\n┃ ⚜️ BALANCE: *${g} GOLD* │ ⚙️ SCRAP: *${s}*\n${cStr}${wStr}┃ 🔷 MANA: *${mp} MP* │ 🟢 STAMINA: *${st}%*\n┃ _M. Diamonds: ${'♦︎'.repeat(d) || 'None'}_\n──────────────────────────────────\nWarrior, choose your path:`;
    },
    btn_arena: "⚔️ Enter Arena / Войти на Арену", btn_wastelands: "🏜️ Wastelands / Пустоши (Фарм)", btn_wallet: "💎 Wallet / TON Кошелек", btn_lang: "🌍 Change Language / Сменить язык", btn_menu: "↩️ Menu / В Меню",
    choose_weapon: "╔══════════════════════════════════╗\n            ⚔️ GEAR SELECTION         \n╚══════════════════════════════════╝\n\nSelect your combat gear for the Arena:", btn_bow: "🏹 Compound Bow [Poison]", btn_claws: "🩸 Energy Claws [Damage]",
    arena_intro: "🛸 A fierce Alien Hunter stands before you (100 HP).\n\n*CHOOSE YOUR ATTACK TARGET:*", arena_defend_intro: "🎯 Target locked!\n*CHOOSE YOUR BLOCK DIRECTION:*",
    arena_win: "⚜️ ═══ V I C T O R Y ═══ ⚜️\n\n🏆 You defeated the Alien Hunter!\nWeb3 module is broadcasting NFT...", arena_lose: "💀 ═══ W A R R I O R  D I E D ═══ 💀\n\nThe Alien Hunter was stronger!"
  }
};

module.exports = locales;
