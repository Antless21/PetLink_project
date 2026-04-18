import type { Pet, UserPreferences } from '@entities/pet/types';

interface CriterionResult {
  weight: number;
  score: number;
  label: string;
}

export interface CompatibilityResult {
  percent: number;
  breakdown: CriterionResult[];
  matchedCriteria: string[];
  mismatchedCriteria: string[];
}

export function calculateCompatibility(
  pet: Pet,
  prefs: UserPreferences,
): CompatibilityResult {
  const criteria: CriterionResult[] = [];

  // Вид (высокий вес — если указан)
  if (prefs.species) {
    criteria.push({
      weight: 20,
      score: prefs.species === pet.species ? 1 : 0,
      label: 'Вид питомца',
    });
  }

  // Размер
  if (prefs.preferredSize) {
    const sizeOrder = { small: 0, medium: 1, large: 2 };
    const diff = Math.abs(sizeOrder[pet.size] - sizeOrder[prefs.preferredSize]);
    criteria.push({
      weight: 10,
      score: diff === 0 ? 1 : diff === 1 ? 0.5 : 0,
      label: 'Размер',
    });
  }

  // Уровень энергии
  if (prefs.preferredEnergy) {
    const order = { low: 0, medium: 1, high: 2 };
    const diff = Math.abs(order[pet.energyLevel] - order[prefs.preferredEnergy]);
    criteria.push({
      weight: 10,
      score: diff === 0 ? 1 : diff === 1 ? 0.5 : 0,
      label: 'Активность',
    });
  }

  // Пол
  if (prefs.preferredGender) {
    criteria.push({
      weight: 5,
      score: prefs.preferredGender === pet.gender ? 1 : 0.5,
      label: 'Пол',
    });
  }

  // Возраст
  if (prefs.ageMin !== undefined || prefs.ageMax !== undefined) {
    const min = prefs.ageMin ?? 0;
    const max = prefs.ageMax ?? 30;
    const inRange = pet.age >= min && pet.age <= max;
    criteria.push({
      weight: 8,
      score: inRange ? 1 : 0,
      label: 'Возраст',
    });
  }

  // Дети
  if (prefs.hasKids) {
    criteria.push({
      weight: 15,
      score: pet.goodWithKids && !pet.isAggressive ? 1 : 0,
      label: 'Дети в доме',
    });
  }

  // Другие животные
  if (prefs.hasOtherPets) {
    criteria.push({
      weight: 12,
      score: pet.goodWithPets && !pet.isAggressive ? 1 : 0,
      label: 'Другие питомцы',
    });
  }

  // Опыт хозяина
  if (pet.needsExperienced) {
    criteria.push({
      weight: 10,
      score: prefs.isExperienced ? 1 : 0,
      label: 'Опыт владельца',
    });
  }

  // Тип жилья
  if (prefs.livesInApartment) {
    const ok =
      pet.housingType === 'apartment' ||
      pet.housingType === 'any' ||
      pet.size === 'small';
    criteria.push({
      weight: 10,
      score: ok ? 1 : 0,
      label: 'Подходит для квартиры',
    });
  }

  // Прививки
  if (prefs.wantsVaccinated) {
    criteria.push({
      weight: 5,
      score: pet.isVaccinated ? 1 : 0,
      label: 'Привитость',
    });
  }

  // Здоровье
  if (!prefs.canHandleIllnesses && pet.hasIllnesses) {
    criteria.push({
      weight: 8,
      score: 0,
      label: 'Здоровье',
    });
  }

  // Уход
  if (!prefs.canHandleSpecialCare && pet.needsSpecialCare) {
    criteria.push({
      weight: 6,
      score: 0,
      label: 'Требует ухода',
    });
  }

  // Агрессивность (всегда минус)
  if (pet.isAggressive) {
    criteria.push({
      weight: 8,
      score: 0,
      label: 'Агрессивный',
    });
  }

  // Если критериев нет вообще — даём базовую совместимость 70%
  if (criteria.length === 0) {
    return {
      percent: 70,
      breakdown: [],
      matchedCriteria: [],
      mismatchedCriteria: [],
    };
  }

  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0);
  const weightedScore = criteria.reduce((s, c) => s + c.weight * c.score, 0);
  const percent = Math.round((weightedScore / totalWeight) * 100);

  return {
    percent,
    breakdown: criteria,
    matchedCriteria: criteria.filter((c) => c.score >= 0.75).map((c) => c.label),
    mismatchedCriteria: criteria.filter((c) => c.score < 0.5).map((c) => c.label),
  };
}

export function compatibilityColor(percent: number): {
  bg: string;
  text: string;
  label: string;
} {
  if (percent >= 85) return { bg: 'bg-green-500', text: 'text-white', label: 'Идеально' };
  if (percent >= 70) return { bg: 'bg-green-400', text: 'text-white', label: 'Отлично' };
  if (percent >= 55) return { bg: 'bg-amber-400', text: 'text-white', label: 'Хорошо' };
  if (percent >= 40) return { bg: 'bg-orange-400', text: 'text-white', label: 'Средне' };
  return { bg: 'bg-red-400', text: 'text-white', label: 'Мало общего' };
}
