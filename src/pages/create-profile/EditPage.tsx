import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { usePetStore } from '@entities/pet/store';
import { useAuthStore } from '@entities/user/store';
import { CreatePetForm } from '@widgets/CreatePetForm/CreatePetForm';

export function EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pet = usePetStore((s) => s.pets.find((p) => p.id === id));
  const currentUser = useAuthStore((s) => s.currentUser);

  useEffect(() => {
    if (!pet) return;
    if (pet.owner.id !== currentUser?.id) {
      navigate('/profile');
    }
  }, [pet, currentUser, navigate]);

  if (!pet) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-slate-600">
        Анкета не найдена
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-12">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-1">
          Редактировать анкету
        </h1>
        <p className="text-slate-600">Обновите данные о питомце</p>
      </header>
      <CreatePetForm initialPet={pet} />
    </div>
  );
}
