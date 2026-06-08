import * as React from "react";
import { Pet, UserProfile, ActiveTab, PetType, PetGender, PetSize } from "../types";
import SwipeCard from "../components/SwipeCard";
import { Sparkles, Briefcase } from "lucide-react";

interface SwipeScreenProps {
  userProfile: UserProfile;
  filteredPets: Pet[];
  currentPet: Pet | null;
  onSwipe: (direction: "left" | "right" | "super") => void;
  onResetFilters: () => void;
  setIsMobileFiltersOpen: (isOpen: boolean) => void;
  filterType: PetType | "Todos";
  filterGender: PetGender | "Todos";
  filterSize: PetSize | "Todos";
  setActiveTab: (tab: ActiveTab) => void;
}

export default function SwipeScreen({
  userProfile,
  filteredPets,
  currentPet,
  onSwipe,
  onResetFilters,
  setIsMobileFiltersOpen,
  filterType,
  filterGender,
  filterSize,
  setActiveTab,
}: SwipeScreenProps) {
  const isDoador = userProfile.role === "doador";

  return (
    <div className="w-full max-w-[440px] h-[480px] xs:h-[520px] md:h-[580px] flex flex-col relative">
      {/* Floating Mobile Filter Trigger Button for Adotante */}
      {!isDoador && (
        <div className="lg:hidden flex items-center justify-between pointer-events-auto shrink-0 mb-3 px-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#ff4b6e] font-display flex items-center gap-1">
            <span className="animate-pulse">🐾</span> Deck do Cupido
          </span>
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-[10px] font-extrabold rounded-full shadow-xs cursor-pointer transition select-none"
          >
            <span>Filtros</span>
            <span>🔍</span>
            {(filterType !== "Todos" || filterGender !== "Todos" || filterSize !== "Todos") && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4b6e] shrink-0" />
            )}
          </button>
        </div>
      )}

      {isDoador ? (
        <div className="bg-white rounded-3xl border border-rose-100/50 p-8 shadow-xl text-center flex flex-col items-center justify-center h-full">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-[#ff7e40] mb-4 shadow-sm">
            <Briefcase size={28} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 font-display">Visão do Doador</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
            Você está logado como Doador/Abrigo. Para cadastrar novos animais de resgate para a plataforma PetMatch ou gerenciar seus pets existentes, use os botões correspondentes no topo do painel.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-6 w-full">
            <button
              onClick={() => setActiveTab("add-pet")}
              className="px-4 py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-xl text-xs font-bold font-display shadow-md hover:brightness-105 transition cursor-pointer"
            >
              Cadastrar Novo Pet
            </button>
            <button
              onClick={() => setActiveTab("my-listed-pets")}
              className="px-4 py-3 bg-slate-800 text-white rounded-xl text-xs font-bold font-display shadow-md hover:bg-slate-700 transition cursor-pointer"
            >
              Ver Meus Animais
            </button>
          </div>
        </div>
      ) : currentPet ? (
        <div className="relative w-full h-full">
          {/* Underlay card preview to make it feel like a real deck */}
          {filteredPets.length > 1 && (
            <div className="absolute inset-0 scale-95 translate-y-3 opacity-40 z-0 bg-white rounded-3xl border border-rose-50/50 shadow-md transform pointer-events-none" />
          )}
          {filteredPets.length > 2 && (
            <div className="absolute inset-0 scale-90 translate-y-6 opacity-20 z-0 bg-white rounded-3xl border border-rose-50/50 shadow-xs transform pointer-events-none" />
          )}

          {/* Render the actual interactive swipe card draggable */}
          <SwipeCard
            key={currentPet.id}
            pet={currentPet}
            onSwipe={onSwipe}
            isTopCard={true}
          />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-rose-100/50 p-8 shadow-xl text-center flex flex-col items-center justify-center h-full">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-[#ff4b6e] mb-4 shadow-sm animate-bounce">
            <Sparkles size={28} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 font-display">Fim do Deck por hoje!</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
            Você visualizou todos os pets compatíveis com os filtros selecionados. Altere os filtros na barra ao lado para ver novos gatinhos, cachorrinhos ou coelhos!
          </p>
          <button
            id="btn-clear-filters-end-deck"
            onClick={onResetFilters}
            className="mt-6 px-6 py-2.5 bg-gradient-to-r from-[#ff4b6e] to-[#ff7e40] text-white rounded-full text-xs font-bold font-display shadow-md hover:brightness-105 active:scale-95 transition cursor-pointer"
          >
            Remover Todos os Filtros
          </button>
        </div>
      )}
    </div>
  );
}
