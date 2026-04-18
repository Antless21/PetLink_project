import { create } from 'zustand';
import type {
  Pet,
  PetFilters,
  PetGender,
  PetSize,
  PetSpecies,
  EnergyLevel,
  HousingType,
  PriceType,
} from './types';
import { read, write, StorageKeys } from '@shared/storage/localStorage';
import { useAuthStore } from '@entities/user/store';
import { ageText } from '@shared/lib/format';

export interface CreatePetInput {
  name: string;
  age: number;
  breed: string;
  species: PetSpecies;
  gender: PetGender;
  size: PetSize;
  city: string;
  description: string;
  traits: string[];
  photos: string[];

  energyLevel: EnergyLevel;
  isFriendly: boolean;
  isAggressive: boolean;
  goodWithKids: boolean;
  goodWithPets: boolean;

  housingType: HousingType;
  canLiveAlone: boolean;
  needsExperienced: boolean;

  isVaccinated: boolean;
  isSterilized: boolean;
  hasIllnesses: boolean;
  needsSpecialCare: boolean;

  priceType: PriceType;
  isUrgent: boolean;
}

interface SwipeRecord {
  userId: string;
  petId: string;
  direction: 'like' | 'skip';
  createdAt: string;
}

interface PetState {
  pets: Pet[];
  filters: PetFilters;
  swipeVersion: number;

  init: () => void;
  getFeed: () => Pet[];
  getMyPets: () => Pet[];
  getById: (id: string) => Pet | undefined;
  like: (petId: string) => void;
  skip: (petId: string) => void;
  resetSwipes: () => void;
  createPet: (input: CreatePetInput) => Pet;
  updatePet: (id: string, patch: Partial<CreatePetInput>) => void;
  deletePet: (id: string) => void;

  setFilters: (filters: PetFilters) => void;
  clearFilters: () => void;
}

function loadSwipes(userId: string | null): SwipeRecord[] {
  if (!userId) return [];
  const all = read<SwipeRecord[]>(StorageKeys.swipes, []);
  return all.filter((s) => s.userId === userId);
}

function saveSwipe(record: SwipeRecord) {
  const all = read<SwipeRecord[]>(StorageKeys.swipes, []);
  all.push(record);
  write(StorageKeys.swipes, all);
}

function matchesFilters(pet: Pet, f: PetFilters): boolean {
  if (f.species && pet.species !== f.species) return false;
  if (f.breed && !pet.breed.toLowerCase().includes(f.breed.toLowerCase())) return false;
  if (f.ageMin !== undefined && pet.age < f.ageMin) return false;
  if (f.ageMax !== undefined && pet.age > f.ageMax) return false;
  if (f.gender && pet.gender !== f.gender) return false;
  if (f.size && pet.size !== f.size) return false;

  if (f.energyLevel && pet.energyLevel !== f.energyLevel) return false;
  if (f.goodWithKids && !pet.goodWithKids) return false;
  if (f.goodWithPets && !pet.goodWithPets) return false;
  if (f.notAggressive && pet.isAggressive) return false;

  if (f.housingType === 'apartment' && pet.housingType === 'house') return false;
  if (f.housingType === 'house' && pet.housingType === 'apartment') return false;
  if (f.canLiveAlone && !pet.canLiveAlone) return false;
  if (f.noExperienceNeeded && pet.needsExperienced) return false;

  if (f.mustBeVaccinated && !pet.isVaccinated) return false;
  if (f.mustBeSterilized && !pet.isSterilized) return false;
  if (f.noIllnesses && pet.hasIllnesses) return false;

  if (f.priceType && pet.priceType !== f.priceType) return false;
  if (f.urgentOnly && !pet.isUrgent) return false;
  if (f.ownerType && pet.owner.type !== f.ownerType) return false;

  if (f.city && !pet.city.toLowerCase().includes(f.city.toLowerCase())) return false;

  return true;
}

export const usePetStore = create<PetState>((set, get) => ({
  pets: [],
  filters: {},
  swipeVersion: 0,

  init: () => {
    const pets = read<Pet[]>(StorageKeys.pets, []);
    set({ pets });
  },

  getFeed: () => {
    const currentUser = useAuthStore.getState().currentUser;
    const swipes = loadSwipes(currentUser?.id ?? null);
    const swipedIds = new Set(swipes.map((s) => s.petId));
    const { pets, filters } = get();
    return pets.filter(
      (p) =>
        !swipedIds.has(p.id) &&
        p.owner.id !== currentUser?.id &&
        matchesFilters(p, filters),
    );
  },

  getMyPets: () => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return [];
    return get().pets.filter((p) => p.owner.id === currentUser.id);
  },

  getById: (id) => get().pets.find((p) => p.id === id),

  like: (petId) => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return;
    const all = read<SwipeRecord[]>(StorageKeys.swipes, []);
    if (all.some((s) => s.userId === currentUser.id && s.petId === petId)) {
      return;
    }
    saveSwipe({
      userId: currentUser.id,
      petId,
      direction: 'like',
      createdAt: new Date().toISOString(),
    });
    set((s) => ({ swipeVersion: s.swipeVersion + 1 }));
  },

  skip: (petId) => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return;
    const all = read<SwipeRecord[]>(StorageKeys.swipes, []);
    if (all.some((s) => s.userId === currentUser.id && s.petId === petId)) {
      return;
    }
    saveSwipe({
      userId: currentUser.id,
      petId,
      direction: 'skip',
      createdAt: new Date().toISOString(),
    });
    set((s) => ({ swipeVersion: s.swipeVersion + 1 }));
  },

  resetSwipes: () => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return;
    const all = read<SwipeRecord[]>(StorageKeys.swipes, []);
    write(
      StorageKeys.swipes,
      all.filter((s) => s.userId !== currentUser.id),
    );
    set((s) => ({ swipeVersion: s.swipeVersion + 1 }));
  },

  createPet: (input) => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) throw new Error('Нужно войти в аккаунт');

    const pet: Pet = {
      id: `p${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...input,
      ageText: ageText(input.age),
      owner: {
        id: currentUser.id,
        name: currentUser.name,
        type: currentUser.accountType,
      },
      createdAt: new Date().toISOString(),
    };

    const pets = [pet, ...get().pets];
    write(StorageKeys.pets, pets);
    set({ pets });
    return pet;
  },

  updatePet: (id, patch) => {
    const pets = get().pets.map((p) => {
      if (p.id !== id) return p;
      const merged = { ...p, ...patch };
      if (patch.age !== undefined) merged.ageText = ageText(patch.age);
      return merged;
    });
    write(StorageKeys.pets, pets);
    set({ pets });
  },

  deletePet: (id) => {
    const pets = get().pets.filter((p) => p.id !== id);
    write(StorageKeys.pets, pets);
    set({ pets });
  },

  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
}));
