// arena.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Расчет пассивной экспедиции (Максимум 24 часа)
export async function processIdleExpedition(player) {
  const startTime = new Date(player.expedition_start).getTime();
  const now = new Date().getTime();
  
  let diffMins = Math.floor((now - startTime) / 1000 / 60);
  if (diffMins < 0) diffMins = 0;
  if (diffMins > 1440) diffMins = 1440; // Кап на 24 часа

  // Формула жесткой экономики: 1 час = +2 Gold, +5 Scrap
  const earnedGold = Math.floor(diffMins * (2 / 60));
  const earnedScrap = Math.floor(diffMins * (5 / 60));

  // Рандомный дроп маски Plasma Core (15% шанс)
  let droppedCore = 0;
  if (Math.random() <= 0.15) {
    droppedCore = 1;
  }

  // Обновляем игрока в Supabase, сбрасывая таймер экспедиции
  const { data: updatedPlayer } = await supabase
    .from('players')
    .update({
      gold: player.gold + earnedGold,
      scrap: player.scrap + earnedScrap,
      plasma_cores: player.plasma_cores + droppedCore,
      expedition_start: null // Очищаем статус поиска лута, игра больше не "спит"
    })
    .eq('tg_id', player.tg_id)
    .select()
    .single();

  return updatedPlayer || player;
}

// Рыночный цикл: Продажа ядра
export async function sellPlasmaCore(tgId) {
  const { data: player } = await supabase.from('players').select('*').eq('tg_id', tgId).single();
  const { data: config } = await supabase.from('game_config').select('value_int').eq('key', 'merchant_gold').single();

  if (!player || player.plasma_cores < 1) return { success: false, error: "Нет Plasma Core!" };
  if (!config || config.value_int < 150) return { success: false, error: "У купца нет золота!" };

  await supabase.from('players').update({ plasma_cores: player.plasma_cores - 1, gold: player.gold + 150 }).eq('tg_id', tgId);
  await supabase.from('game_config').update({ value_int: config.value_int - 150 }).eq('key', 'merchant_gold');

  return { success: true };
}

// Заточка
export async function upgradeSharpness(tgId) {
  const { data: player } = await supabase.from('players').select('*').eq('tg_id', tgId).single();
  if (!player || player.gold < 50 || player.scrap < 120) return { success: false };

  await supabase.from('players').update({ gold: player.gold - 50, scrap: player.scrap - 120, mp: player.mp + 3 }).eq('tg_id', tgId);
  return { success: true };
}
