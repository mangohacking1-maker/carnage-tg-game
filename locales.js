// locales.js - Отрисовка витрины рынка в стиле Dior & M. Diamonds
export const renderMarketplaceItem = (player, merchantGold) => {
  return `
╔═════════════════════════════════════════╗
║          💎 ARENA OF HONOR 💎          ║
╠═════════════════════════════════════════╣
║  👤 ИГРОК: @${player.tg_id}
║  ♦︎♦︎♦︎♦︎ Marsel Diamonds: ${player.marsel_diamonds}
║  💰 Золото: ${player.gold} / 🛠️ Скрап: ${player.scrap}
║  🎭 Plasma Cores (Маски): ${player.plasma_cores}
╠═════════════════════════════════════════╣
║  🏪 ЛАВКА КУПЦА (Ликвидность: ${merchantGold} Gold)
║  
║  [1] 🎭 Продать Plasma Core  ➡️  +150 Gold
║      (Шанс дропа в бою: 15%)
║  
║  [2] ⚡ Руническая Заточка (+3 Шарп)
║      Цена: 50 Gold + 120 Scrap 💸 SINK
╚═════════════════════════════════════════╝
  `.trim();
};
