// locales.js

export const welcome = (username, gold, scrap, cores, diamonds) => {
  return `
╔═════════════════════════════════════════╗
║          💎 ARENA OF HONOR v2.0         ║
╠═════════════════════════════════════════╣
║  👤 ВОИН: @${username}
║  ♦︎♦︎♦︎♦︎ Marsel Diamonds: ${diamonds}
║  💰 Золото: ${gold} ┃ 🛠️ Скрап: ${scrap}
║  🎭 Plasma Cores: ${cores}
╠═════════════════════════════════════════╣
║  ⚔️ Готов к бою на Арене или Экспедиции? 
╚═════════════════════════════════════════╝
  `.trim();
};

export const renderMarketplaceItem = (player, merchantGold) => {
  return `
╔═════════════════════════════════════════╗
║          🏪 ЛАВКА КУПЦА & КУЗНЯ         ║
╠═════════════════════════════════════════╣
║  💰 Ликвидность торговца: ${merchantGold} Gold
║  
║  🎭 Продать Plasma Core  ➡️  +150 Gold
║      (Скупка масок с Арены)
║  
║  ⚡ Руническая Заточка (+3 Шарп)
║      Цена: 50 Gold + 120 Scrap 💸 SINK
╚═════════════════════════════════════════╝
  `.trim();
};

// Экспортируем всё как единый объект для index.js
const locales = { welcome, renderMarketplaceItem };
export default locales;
