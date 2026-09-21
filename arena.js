const WEAPON_BALANCING = {
  blades: { name_ru: "⚔️ Ритуальные Клинки", name_en: "⚔️ Ritual Blades", directDamage: 25, critChance: 0.20, critMultiplier: 1.4 },
  saber: { name_ru: "⚔️ Офицерская Сабля", name_en: "⚔️ Officer Saber", directDamage: 28, critChance: 0.15, critMultiplier: 1.5 },
  sword: { name_ru: "⚔️ Тяжелый Меч", name_en: "⚔️ Heavy Sword", directDamage: 35, critChance: 0.10, critMultiplier: 1.6 },
  knife: { name_ru: "🔪 Тактический Нож", name_en: "🔪 Tactical Knife", directDamage: 18, critChance: 0.40, critMultiplier: 1.5 },
  th_knives: { name_ru: "🎯 Метательные Ножи", name_en: "🎯 Throwing Knives", directDamage: 20, critChance: 0.30, critMultiplier: 1.3 },
  axes: { name_ru: "🪓 Боевые Топоры", name_en: "🪓 Combat Axes", directDamage: 32, critChance: 0.12, critMultiplier: 1.5 },
  stars: { name_ru: "⭐ Стальные Звездочки", name_en: "⭐ Steel Stars", directDamage: 15, critChance: 0.50, critMultiplier: 1.4 },
  explosives: { name_ru: "💣 Направленная Взрывчатка", name_en: "💣 Targeted Explosive", directDamage: 45, critChance: 0.05, critMultiplier: 2.0 }
};

const BATTLE_ZONES = {
  head: { ru: "🎯 Голова (Head)", en: "🎯 Head" },
  chest: { ru: "🛡 Грудь (Chest)", en: "🛡 Chest" },
  belt: { ru: "🎒 Пояс (Belt)", en: "🎒 Belt" },
  legs: { ru: "🦿 Ноги (Legs)", en: "🦿 Legs" }
};

function getAttackKeyboard(lang) {
  return { inline_keyboard: Object.keys(BATTLE_ZONES).map(z => [{ text: `⚔️ ${BATTLE_ZONES[z][lang]}`, callback_data: `a_atk_${z}` }]) };
}

function getDefendKeyboard(lang) {
  return { inline_keyboard: Object.keys(BATTLE_ZONES).map(z => [{ text: `🛡 ${BATTLE_ZONES[z][lang]}`, callback_data: `a_def_${z}` }]) };
}

// Переносим расчет раунда сюда, чтобы разгрузить главный файл
function runBattleTurn(battle, playerDefendZone, lang) {
  const zones = Object.keys(BATTLE_ZONES);
  const predatorAttack = zones[Math.floor(Math.random() * zones.length)];
  const predatorDefend = zones[Math.floor(Math.random() * zones.length)];
  const wp = WEAPON_BALANCING[battle.weapon];

  let pDamage = 0; let predDamage = 0; let log = [];

  if (battle.playerAttackZone === predatorDefend) {
    log.push(lang === 'ru' ? `🛡 *Заблокировано!* Враг отразил удар.` : `🛡 *Blocked!* Enemy parried.`);
    battle.weapon_dura = Math.max(0, battle.weapon_dura - 2);
  } else {
    pDamage = wp.directDamage; battle.weapon_dura = Math.max(0, battle.weapon_dura - 1);
    if (Math.random() < wp.critChance) {
      pDamage = Math.round(pDamage * wp.critMultiplier);
      log.push(lang === 'ru' ? `💥 *КРИТ!* Нанесено *-${pDamage} HP*!` : `💥 *CRIT!* Hit for *-${pDamage} HP*!`);
    } else {
      log.push(lang === 'ru' ? `🩸 Попадание! Нанесено *-${pDamage} HP*.` : `🩸 Hit! Sustained *-${pDamage} HP*.`);
    }
  }

  if (predatorAttack === playerDefendZone) {
    log.push(lang === 'ru' ? `✅ *Успешный блок!* Ты отразил атаку.` : `✅ *Dodge!* Shield held.`);
    battle.armor_dura = Math.max(0, battle.armor_dura - 1);
  } else {
    predDamage = 20; battle.armor_dura = Math.max(0, battle.armor_dura - 2);
    log.push(lang === 'ru' ? `💥 Пропущено! Получено *-${predDamage} HP*.` : `💥 Failed! Damage taken *-${predDamage} HP*.`);
  }

  battle.playerHp = Math.max(0, battle.playerHp - predDamage);
  battle.predatorHp = Math.max(0, battle.predatorHp - pDamage);
  battle.playerAttackZone = null;

  return { log: log.join('\n') };
}

module.exports = { WEAPON_BALANCING, BATTLE_ZONES, getAttackKeyboard, getDefendKeyboard, runBattleTurn };
