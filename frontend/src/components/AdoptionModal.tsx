import * as React from "react";
import { Match, UserProfile } from "../types";

interface AdoptionModalProps {
  isOpen: boolean;
  activeChatMatch: Match | null;
  userProfile: UserProfile;
  tempAdoptionDate: string;
  setTempAdoptionDate: (date: string) => void;
  tempAdoptionTime: string;
  setTempAdoptionTime: (time: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export default function AdoptionModal({
  isOpen,
  activeChatMatch,
  userProfile,
  tempAdoptionDate,
  setTempAdoptionDate,
  tempAdoptionTime,
  setTempAdoptionTime,
  onClose,
  onConfirm,
}: AdoptionModalProps) {
  if (!isOpen || !activeChatMatch) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4 pb-2 border-b border-emerald-50">
          <span className="text-2xl animate-bounce">🏠</span>
          <div>
            <h3 className="text-lg font-black text-slate-800 font-display">
              {userProfile.role === "doador"
                ? "Propor Novo Horário de Retirada"
                : `Termo de Adoção de ${activeChatMatch.pet.name}`}
            </h3>
            <p className="text-[11px] text-slate-400">
              {userProfile.role === "doador"
                ? "Sugerir uma nova data para o adotante vir buscar o pet."
                : "Assine o termo e agende a busca do seu novo melhor amigo!"}
            </p>
          </div>
        </div>

        {/* Adoption Terms (Termo de responsabilidade) */}
        {userProfile.role !== "doador" && (
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 mb-4 text-[11px] text-neutral-700 leading-normal font-sans">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-emerald-650 text-base">📝</span>
              <span className="font-bold text-emerald-950 font-display text-[12px]">
                Termo de Adoção Responsável
              </span>
            </div>
            <div className="overflow-y-auto max-h-32 pr-1 space-y-2 scrollbar-thin">
              <p className="font-bold text-emerald-900">Ao prosseguir, você declara e se compromete a:</p>
              <p className="bg-white/65 p-1 rounded border border-emerald-50">
                • <strong>Proporcionar bem-estar:</strong> Garantir condições dignas de vida, ofertando ração de qualidade, abrigo seguro protegido e água limpa.
              </p>
              <p className="bg-white/65 p-1 rounded border border-emerald-50">
                • <strong>Zelo sanitário:</strong> Manter a vacinação e vermifugação rigorosamente em dia, prestando socorro veterinário imediato se houver qualquer enfermidade.
              </p>
              <p className="bg-white/65 p-1 rounded border border-emerald-50">
                • <strong>Guarda Definitiva:</strong> Jamais acorrentar o peludinho de forma contínua, abandoná-lo nas ruas, ou repassar sua guarda a terceiros sem prévia autorização e vistoria do abrigo criador.
              </p>
              <p className="bg-white/65 p-1 rounded border border-emerald-50">
                • <strong>Acompanhamento:</strong> Permitir visitas de acompanhamento pós-adoção ou envio de fotos aos voluntários da instituição para comprovar o bem-estar contínuo.
              </p>
            </div>
            <div className="mt-2 text-[10px] text-emerald-800 font-semibold italic">
              *Este termo equivale a uma declaração formal de intenção e responsabilidade de posse responsável.
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
              Escolha a Data para Buscar o Pet
            </label>
            <input
              type="date"
              id="adopt-date-input"
              required
              value={tempAdoptionDate}
              onChange={(e) => setTempAdoptionDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
              Escolha o Horário da Entrega
            </label>
            <input
              type="time"
              id="adopt-time-input"
              required
              value={tempAdoptionTime}
              onChange={(e) => setTempAdoptionTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
            />
          </div>

          {/* Quick suggestions */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
              Sugerir Horários Rápidos
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const nextSat = new Date();
                  nextSat.setDate(nextSat.getDate() + ((6 - nextSat.getDay() + 7) % 7)); // Next Saturday
                  setTempAdoptionDate(nextSat.toISOString().split("T")[0]);
                  setTempAdoptionTime("10:00");
                }}
                className="p-2 border border-slate-250 hover:border-emerald-500 rounded-xl text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-emerald-50/10 cursor-pointer text-left"
              >
                Próximo Sábado de Manhã (10h)
              </button>
              <button
                type="button"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 2); // 2 days from now
                  setTempAdoptionDate(tomorrow.toISOString().split("T")[0]);
                  setTempAdoptionTime("16:00");
                }}
                className="p-2 border border-slate-250 hover:border-emerald-500 rounded-xl text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-emerald-50/10 cursor-pointer text-left"
              >
                Em 2 Dias no Final da Tarde (16h)
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-650 py-3 rounded-xl text-xs font-bold text-center transition cursor-pointer"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl text-xs font-bold font-display shadow-md hover:brightness-105 active:scale-98 transition flex items-center justify-center cursor-pointer"
          >
            Assinar e Confirmar 🐾
          </button>
        </div>
      </div>
    </div>
  );
}
