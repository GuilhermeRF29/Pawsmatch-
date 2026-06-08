import * as React from "react";
import { useState } from "react";
import { Pet, UserProfile, PetType, PetGender, PetSize } from "../types";
import { Plus } from "lucide-react";

interface AddPetScreenProps {
  userProfile: UserProfile;
  onPublishPet: (pet: Pet) => void;
}

export default function AddPetScreen({ userProfile, onPublishPet }: AddPetScreenProps) {
  const [newPet, setNewPet] = useState<Partial<Pet>>({
    name: "",
    type: "Cachorro",
    breed: "",
    age: "",
    gender: "Macho",
    size: "Médio",
    photo: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600",
    bio: "",
    location: userProfile.location || "São Paulo, SP",
    shelterName: userProfile.shelterName || userProfile.name,
    contactEmail: userProfile.email,
    contactPhone: userProfile.phone || "(11) 99999-9999",
  });

  const handlePublishPet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPet.name || !newPet.breed || !newPet.bio) {
      alert("Por favor, preencha o nome, raça e descrição do pet!");
      return;
    }

    const created: Pet = {
      id: `custom-pet-${Date.now()}`,
      name: newPet.name,
      type: (newPet.type as PetType) || "Cachorro",
      breed: newPet.breed,
      age: newPet.age || "Filhote",
      gender: (newPet.gender as PetGender) || "Macho",
      size: (newPet.size as PetSize) || "Médio",
      photo:
        newPet.photo ||
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600",
      bio: newPet.bio,
      location: newPet.location || "São Paulo, SP",
      shelterName: newPet.shelterName || userProfile.shelterName || userProfile.name,
      contactEmail: newPet.contactEmail || userProfile.email,
      contactPhone: newPet.contactPhone || userProfile.phone || "(11) 99999-5555",
    };

    onPublishPet(created);

    // Reset form
    setNewPet({
      name: "",
      type: "Cachorro",
      breed: "",
      age: "",
      gender: "Macho",
      size: "Médio",
      photo: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600",
      bio: "",
      location: userProfile.location || "São Paulo, SP",
      shelterName: userProfile.shelterName || userProfile.name,
      contactEmail: userProfile.email,
      contactPhone: userProfile.phone || "(11) 99999-9999",
    });
  };

  return (
    <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-rose-50 p-6 sm:p-8">
      <div className="border-b border-rose-50 pb-4 mb-4">
        <h3 className="text-xl font-black text-slate-800 font-display">Cadastrar Novo Pet para Adoção</h3>
        <p className="text-xs text-slate-400">Insira um bichinho resgatado para colocá-lo para adoção responsável!</p>
      </div>

      <form onSubmit={handlePublishPet} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Nome do Pet</label>
            <input
              id="newpet-name"
              type="text"
              required
              placeholder="Ex: Totó, Floquinho"
              value={newPet.name}
              onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-400 transition"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Espécie</label>
            <select
              id="newpet-type"
              value={newPet.type}
              onChange={(e) => setNewPet({ ...newPet, type: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-400 transition"
            >
              <option value="Cachorro">Cachorro</option>
              <option value="Gato">Gato</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Raça / Descritor</label>
            <input
              id="newpet-breed"
              type="text"
              required
              placeholder="Ex: Vira-lata, Persa, Angorá"
              value={newPet.breed}
              onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-400 transition"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Idade aproximada</label>
            <input
              id="newpet-age"
              type="text"
              placeholder="Ex: 5 meses, 2 anos"
              value={newPet.age}
              onChange={(e) => setNewPet({ ...newPet, age: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-400 transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Gênero</label>
            <select
              id="newpet-gender"
              value={newPet.gender}
              onChange={(e) => setNewPet({ ...newPet, gender: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none"
            >
              <option value="Macho">Macho</option>
              <option value="Fêmea">Fêmea</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Porte</label>
            <select
              id="newpet-size"
              value={newPet.size}
              onChange={(e) => setNewPet({ ...newPet, size: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none"
            >
              <option value="Pequeno">Pequeno</option>
              <option value="Médio">Médio</option>
              <option value="Grande">Grande</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Localização</label>
            <input
              id="newpet-location"
              type="text"
              placeholder="Ex: São Paulo, SP"
              value={newPet.location}
              onChange={(e) => setNewPet({ ...newPet, location: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 block mb-1">URL da foto do animal (deve ser pública)</label>
          <input
            id="newpet-photo"
            type="text"
            placeholder="Ex: https://images.unsplash.com/photo-..."
            value={newPet.photo}
            onChange={(e) => setNewPet({ ...newPet, photo: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-400 transition font-mono"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 block mb-1">Biografia fofa do animal (Primeira pessoa é ideal!)</label>
          <textarea
            id="newpet-bio"
            required
            rows={3}
            placeholder="Ex: Sou muito arteiro, amo carinho na barriguinha e correr atrás de barbantes no final da tarde..."
            value={newPet.bio}
            onChange={(e) => setNewPet({ ...newPet, bio: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-400 transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Nome do Abrigo / Protetor</label>
            <input
              id="newpet-shelter"
              type="text"
              value={newPet.shelterName}
              onChange={(e) => setNewPet({ ...newPet, shelterName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Contato de E-mail</label>
            <input
              id="newpet-email"
              type="email"
              value={newPet.contactEmail}
              onChange={(e) => setNewPet({ ...newPet, contactEmail: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs"
            />
          </div>
        </div>

        <button
          id="newpet-submit-btn"
          type="submit"
          className="w-full bg-gradient-to-r from-[#ff4b6e] to-[#ff7e40] text-white py-3 rounded-xl font-display font-bold text-xs tracking-wide shadow-md hover:brightness-105 active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus size={14} strokeWidth={2.5} />
          Cadastrar Pet e Colocar no Deck
        </button>
      </form>
    </div>
  );
}
