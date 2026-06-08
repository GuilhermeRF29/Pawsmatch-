import * as React from "react";
import { Pet, UserProfile, ActiveTab } from "../types";
import { PlusCircle, Trash2, CheckCircle2 } from "lucide-react";

interface MyPetsScreenProps {
  pets: Pet[];
  userProfile: UserProfile;
  onDeletePet: (id: string) => void;
  onMarkAsAdopted: (pet: Pet) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export default function MyPetsScreen({
  pets,
  userProfile,
  onDeletePet,
  onMarkAsAdopted,
  setActiveTab,
}: MyPetsScreenProps) {
  const shelterPets = pets.filter(
    (p) =>
      p.contactEmail === userProfile.email ||
      p.shelterName === userProfile.shelterName ||
      p.id.startsWith("custom-pet-")
  );

  return (
    <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-rose-50 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-rose-50 pb-5 mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-800 font-display">Seus Bichinhos Cadastrados</h3>
          <p className="text-xs text-slate-400">Aqui ficam exibidos os animais associados ao seu abrigo.</p>
        </div>
        <button
          onClick={() => setActiveTab("add-pet")}
          className="mt-3 sm:mt-0 px-4 py-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold rounded-xl shadow-md hover:brightness-105 active:scale-95 transition flex items-center gap-1.5 self-start cursor-pointer"
        >
          <PlusCircle size={14} />
          Cadastrar Novo Pet
        </button>
      </div>

      {shelterPets.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-[#ff4b6e] mx-auto mb-4 animate-pulse">
            🐾
          </div>
          <h4 className="text-base font-bold text-slate-800 font-display">Nenhum animal cadastrado por você ainda</h4>
          <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Cadastre o seu primeiro petinho de resgate para vê-lo listado aqui e habilitá-lo na seção de "Descoberta" para milhares de adotantes!
          </p>
          <button
            onClick={() => setActiveTab("add-pet")}
            className="mt-6 px-5 py-2 bg-neutral-800 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-neutral-700 transition"
          >
            Começar Cadastro de Pet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {shelterPets.map((pet) => (
            <div
              key={pet.id}
              className="relative bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition duration-200"
            >
              <div className="h-44 relative">
                <img
                  src={pet.photo}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {/* Floating Trash bin icon on Top Left of image */}
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        `Tem certeza que deseja excluir o perfil e remover o cadastro de ${pet.name}?`
                      )
                    ) {
                      onDeletePet(pet.id);
                    }
                  }}
                  className="absolute top-3 left-3 w-8 h-8 rounded-xl bg-white/95 hover:bg-rose-600 hover:text-white backdrop-blur-md text-rose-500 flex items-center justify-center shadow-md transition duration-200 border border-rose-100 cursor-pointer z-10"
                  title="Excluir cadastro do pet"
                >
                  <Trash2 size={15} />
                </button>
                <div
                  className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold rounded-full text-white ${
                    pet.isAdopted ? "bg-emerald-500" : "bg-orange-500"
                  }`}
                >
                  {pet.isAdopted ? "Adotado! 🎉" : "Disponível"}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-800">{pet.name}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                      {pet.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                    {pet.breed} • {pet.age}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed italic">
                    "{pet.bio}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between gap-2 shrink-0">
                  {!pet.isAdopted && (
                    <button
                      onClick={() => onMarkAsAdopted(pet)}
                      className="flex-1 bg-emerald-50 text-emerald-600 border border-emerald-250 hover:bg-emerald-100/50 py-1.5 px-2 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 size={10} />
                      Marcar Adotado
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Tem certeza que deseja excluir o perfil e remover o cadastro de ${pet.name}?`
                        )
                      ) {
                        onDeletePet(pet.id);
                      }
                    }}
                    className="px-3 py-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 hover:border-rose-200 rounded-lg border border-rose-100 transition cursor-pointer flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
                    title="Excluir Pet"
                  >
                    <Trash2 size={12} />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
