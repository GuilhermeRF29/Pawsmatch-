import * as React from "react";
import { Match, UserProfile } from "../types";

interface VisitModalProps {
  isOpen: boolean;
  activeChatMatch: Match | null;
  userProfile: UserProfile;
  tempVisitDate: string;
  setTempVisitDate: (date: string) => void;
  tempVisitTime: string;
  setTempVisitTime: (time: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export default function VisitModal({
  isOpen,
  activeChatMatch,
  userProfile,
  tempVisitDate,
  setTempVisitDate,
  tempVisitTime,
  setTempVisitTime,
  onClose,
  onConfirm,
}: VisitModalProps) {
  if (!isOpen || !activeChatMatch) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4 pb-2 border-b border-rose-50">
          <span className="text-2xl animate-bounce">📅</span>
          <div>
            <h3 className="text-lg font-black text-slate-800 font-display">
              {userProfile.role === "doador"
                ? "Propor Novo Horário"
                : `Agendar Visita com ${activeChatMatch.pet.name}`}
            </h3>
            <p className="text-[11px] text-slate-400">
              {userProfile.role === "doador"
                ? "Selecione uma nova data e horário para sugerir ao adotante."
                : "Escolha uma data e horário possíveis para fazer a visita no abrigo."}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
              Escolha a Data da Visita
            </label>
            <input
              type="date"
              id="visit-date-input"
              required
              value={tempVisitDate}
              onChange={(e) => setTempVisitDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-400 transition"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
              Escolha o Horário
            </label>
            <input
              type="time"
              id="visit-time-input"
              required
              value={tempVisitTime}
              onChange={(e) => setTempVisitTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-400 transition"
            />
          </div>

          {/* Quick suggestions */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
              Atalhos de Horário Rápido
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const nextSat = new Date();
                  nextSat.setDate(nextSat.getDate() + ((6 - nextSat.getDay() + 7) % 7)); // Next Saturday
                  setTempVisitDate(nextSat.toISOString().split("T")[0]);
                  setTempVisitTime("14:00");
                }}
                className="p-2 border border-slate-200 hover:border-[#ff4b6e] rounded-xl text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-rose-50/10 cursor-pointer text-left"
              >
                Próximo Sábado (14h)
              </button>
              <button
                type="button"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setTempVisitDate(tomorrow.toISOString().split("T")[0]);
                  setTempVisitTime("10:00");
                }}
                className="p-2 border border-slate-200 hover:border-[#ff4b6e] rounded-xl text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-rose-50/10 cursor-pointer text-left"
              >
                Amanhã de Manhã (10h)
              </button>
            </div>
          </div>

          {/* Information text about the shelter */}
          <div className="p-3 bg-rose-50/30 rounded-xl border border-rose-100 flex gap-2.5 text-[10.5px] text-slate-600 leading-relaxed font-sans mt-2">
            <span className="text-rose-500 shrink-0">📍</span>
            <div>
              <span className="font-bold text-rose-800">Local para Atendimento:</span>
              <p>
                O abrigo <span className="font-bold text-slate-700">{activeChatMatch.pet.shelterName}</span> está localizado em <span className="font-bold text-slate-700">{activeChatMatch.pet.location}</span>. O telefone é {activeChatMatch.pet.contactPhone}.
              </p>
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
            className="w-full bg-gradient-to-r from-[#ff4b6e] to-[#ff7e40] text-white py-3 rounded-xl text-xs font-bold font-display shadow-md hover:brightness-105 active:scale-98 transition flex items-center justify-center cursor-pointer"
          >
            Confirmar Agendamento 🐾
          </button>
        </div>
      </div>
    </div>
  );
}
