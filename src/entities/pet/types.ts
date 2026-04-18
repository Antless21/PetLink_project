export type PetGender = 'male' | 'female';
export type PetSize = 'small' | 'medium' | 'large';
export type PetSpecies = 'dog' | 'cat' | 'other';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type HousingType = 'apartment' | 'house' | 'any';
export type PriceType = 'free' | 'paid';

export interface Pet {
  id: string;

  // Основное
  name: string;
  age: number;
  ageText: string;
  breed: string;
  species: PetSpecies;
  gender: PetGender;
  size: PetSize;

  // Характер и поведение
  energyLevel: EnergyLevel;
  isFriendly: boolean;
  isAggressive: boolean;
  goodWithKids: boolean;
  goodWithPets: boolean;

  // Условия содержания
  housingType: HousingType;
  canLiveAlone: boolean;
  needsExperienced: boolean;

  // Здоровье
  isVaccinated: boolean;
  isSterilized: boolean;
  hasIllnesses: boolean;
  needsSpecialCare: boolean;

  // Доп.
  priceType: PriceType;
  isUrgent: boolean;

  // Локация
  city: string;

  // Медиа и описание
  photos: string[];
  description: string;
  traits: string[];

  // Автор
  owner: {
    id: string;
    name: string;
    type: 'person' | 'shelter';
  };

  createdAt: string;
}

// Фильтры
export interface PetFilters {
  species?: PetSpecies;
  breed?: string;
  ageMin?: number;
  ageMax?: number;
  gender?: PetGender;
  size?: PetSize;

  energyLevel?: EnergyLevel;
  goodWithKids?: boolean;
  goodWithPets?: boolean;
  notAggressive?: boolean;

  housingType?: HousingType;
  canLiveAlone?: boolean;
  noExperienceNeeded?: boolean;

  mustBeVaccinated?: boolean;
  mustBeSterilized?: boolean;
  noIllnesses?: boolean;

  priceType?: PriceType;
  urgentOnly?: boolean;
  ownerType?: 'person' | 'shelter';

  city?: string;
}

// Пресеты быстрых фильтров
export type QuickFilter = 'apartment' | 'kids' | 'active' | 'urgent' | 'shelter';

// Профиль предпочтений пользователя (для совместимости)
export interface UserPreferences {
  species?: PetSpecies;
  preferredSize?: PetSize;
  preferredEnergy?: EnergyLevel;
  preferredGender?: PetGender;
  ageMin?: number;
  ageMax?: number;

  hasKids: boolean;
  hasOtherPets: boolean;
  isExperienced: boolean;
  livesInApartment: boolean;

  wantsVaccinated: boolean;
  canHandleIllnesses: boolean;
  canHandleSpecialCare: boolean;
}
