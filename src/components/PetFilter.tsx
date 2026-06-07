import { PetType, PetGender, PetSize } from "../types";
import { Filter, RotateCcw, Dog, Cat, Sparkles, User, Users } from "lucide-react";

interface PetFilterProps {
  selectedType: PetType | "Todos";
  onSelectType: (type: PetType | "Todos") => void;
  selectedGender: PetGender | "Todos";
  onSelectGender: (gender: PetGender | "Todos") => void;
  selectedSize: PetSize | "Todos";
  onSelectSize: (size: PetSize | "Todos") => void;
  onResetFilters: () => void;
}

export default function PetFilter({
  selectedType,
  onSelectType,
  selectedGender,
  onSelectGender,
  selectedSize,
  onSelectSize,
  onResetFilters,
}: PetFilterProps) {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-rose-100/60 p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-widest pb-1 border-b border-rose-50">
        <div className="flex items-center gap-1.5 font-display text-rose-500">
          <Filter size={14} />
          <span>Filtros do Cupido Pet</span>
        </div>
        <button
          id="btn-reset-filters"
          onClick={onResetFilters}
          className="text-[10px] text-slate-400 hover:text-rose-500 flex items-center gap-1 transition cursor-pointer"
        >
          <RotateCcw size={10} />
          Refazer Filtros
        </button>
      </div>

      {/* Row 1: Pet Type Selection */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium text-slate-400">Espécie</span>
        <div className="grid grid-cols-3 gap-1.5">
          {(["Todos", "Cachorro", "Gato"] as const).map((type) => (
            <button
              key={type}
              id={`filter-type-${type.toLowerCase()}`}
              onClick={() => onSelectType(type)}
              className={`py-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition cursor-pointer ${
                selectedType === type
                  ? "bg-rose-500 text-white shadow-sm font-semibold"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900"
              }`}
            >
              {type === "Todos" && <Sparkles size={11} />}
              {type === "Cachorro" && <Dog size={11} />}
              {type === "Gato" && <Cat size={11} />}
              <span>{type}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-1">
        {/* Row 2: Selected Gender */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-slate-400">Gênero</span>
          <div className="grid grid-cols-3 gap-1">
            {(["Todos", "Macho", "Fêmea"] as const).map((gender) => (
              <button
                key={gender}
                id={`filter-gender-${gender.toLowerCase()}`}
                onClick={() => onSelectGender(gender)}
                className={`py-1 rounded-md text-[11px] font-medium text-center transition cursor-pointer ${
                  selectedGender === gender
                    ? "bg-rose-100 text-rose-700 border border-rose-200"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent"
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Selected Size */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-slate-400">Porte</span>
          <div className="grid grid-cols-4 gap-1">
            {(["Todos", "Pequeno", "Médio", "Grande"] as const).map((size) => (
              <button
                key={size}
                id={`filter-size-${size.toLowerCase()}`}
                onClick={() => onSelectSize(size)}
                className={`py-1 rounded-md text-[10px] font-medium text-center transition cursor-pointer ${
                  selectedSize === size
                    ? "bg-rose-100 text-rose-700 border border-rose-200"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent"
                }`}
              >
                <span>{size === "Todos" ? "Todos" : size.slice(0, 3)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
