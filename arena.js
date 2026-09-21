// arena.js - Логика транзакций внутри Supabase
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 1. Продажа Plasma Core (Охотничьей маски) купцу
export async function sellPlasmaCore(tgId) {
  // Получаем данные игрока и ликвидность мерчанта в одной транзакции (или последовательно)
  const { data: player } = await supabase.from('players').select('*').eq('tg_id', tgId).single();
  const { data: config } = await supabase.from('game_config').select('value_int').eq('key', 'merchant_gold').single();

  if (!player || player.plasma_cores < 1) return { success: false, error: "Нет масок для продажи!" };
  if (!config || config.value_int < 150) return { success: false, error: "У купца кончилось золото! Жди рефреша." };

  // Выполняем атомарный сдвиг экономики: маска плавится, золото перетекает
  const { error: pErr } = await supabase.from('players')
    .update({ 
      plasma_cores: player.plasma_cores - 1, 
      gold: player.gold + 150 
    })
    .eq('tg_id', tgId);

  const { error: cErr } = await supabase.from('game_config')
    .update({ value_int: config.value_int - 150 })
    .eq('key', 'merchant_gold');

  if (pErr || cErr) return { success: false, error: "Сбой синхронизации БД." };
  return { success: true, newGold: player.gold + 150 };
}

// 2. Покупка рунического апгрейда (Слив золота и скрапа)
export async function upgradeSharpness(tgId) {
  const { data: player } = await supabase.from('players').select('*').eq('tg_id', tgId).single();
  
  if (!player) return { success: false, error: "Игрок не найден" };
  if (player.gold < 50 || player.scrap < 120) return { success: false, error: "Недостаточно ресурсов (Нужно 50G / 120Scrap)" };

  const { error } = await supabase.from('players')
    .update({
      gold: player.gold - 50,
      scrap: player.scrap - 120,
      // Предпологаем, что 'mp' или отдельное поле отвечает за силу/заточку
      mp: player.mp + 3 
    })
    .eq('tg_id', tgId);

  if (error) return { success: false, error: "Ошибка БД при апгрейде." };
  return { success: true };
}
