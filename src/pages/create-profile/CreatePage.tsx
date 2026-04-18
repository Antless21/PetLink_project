import { CreatePetForm } from '@widgets/CreatePetForm/CreatePetForm';

export function CreatePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-12">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-1">
          Создать анкету
        </h1>
        <p className="text-slate-600">
          Расскажите о питомце — это поможет найти ему дом
        </p>
      </header>
      <CreatePetForm />
    </div>
  );
}
