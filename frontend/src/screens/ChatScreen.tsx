import * as React from "react";
import { useState } from "react";
import { Match, Message, UserProfile } from "../types";
import { Heart, MessageSquare, Info, Trash2, Send, CheckCircle2 } from "lucide-react";

interface ChatScreenProps {
  displayedMatches: Match[];
  selectedMatchId: string | null;
  setSelectedMatchId: (id: string | null) => void;
  userProfile: UserProfile;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onAcceptVisit: (match: Match) => void;
  onCancelVisit: (match: Match) => void;
  onAcceptAdoption: (match: Match) => void;
  onCancelAdoption: (match: Match) => void;
  onDeletePetProfile: (petId: string) => void;
  onUnmatch: (matchId: string) => void;
  onSimulateAdoption: (match: Match) => void;
  setIsSchedulingVisit: (val: boolean) => void;
  setIsSchedulingAdoption: (val: boolean) => void;
  setTempVisitDate: (val: string) => void;
  setTempVisitTime: (val: string) => void;
  setTempAdoptionDate: (val: string) => void;
  setTempAdoptionTime: (val: string) => void;
  showFlash: (text: string, type?: "success" | "info") => void;
}

export default function ChatScreen({
  displayedMatches,
  selectedMatchId,
  setSelectedMatchId,
  userProfile,
  messages,
  onSendMessage,
  onAcceptVisit,
  onCancelVisit,
  onAcceptAdoption,
  onCancelAdoption,
  onDeletePetProfile,
  onUnmatch,
  onSimulateAdoption,
  setIsSchedulingVisit,
  setIsSchedulingAdoption,
  setTempVisitDate,
  setTempVisitTime,
  setTempAdoptionDate,
  setTempAdoptionTime,
  showFlash,
}: ChatScreenProps) {
  const [inputMessage, setInputMessage] = useState("");

  const activeChatMatch = displayedMatches.find((m) => m.id === selectedMatchId) || null;
  const chatMessages = messages.filter((m) => m.matchId === selectedMatchId);

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    onSendMessage(inputMessage.trim());
    setInputMessage("");
  };

  return (
    <div className="w-full max-w-4xl h-full flex flex-col md:flex-row bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
      {/* Mobile match selector */}
      <div
        className={`w-full md:w-80 border-r border-slate-100 flex flex-col shrink-0 ${
          selectedMatchId ? "hidden md:flex" : "flex flex-1"
        } md:max-h-full md:h-full overflow-y-auto p-4 md:hidden`}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff4b6e] mb-3 block">
          Conversas Ativas
        </span>
        <div className="flex flex-col gap-3 overflow-y-auto pb-2">
          {displayedMatches.map((match) => {
            const isActive = selectedMatchId === match.id;
            const isDoadorRole = userProfile.role === "doador";
            const displayPhoto = isDoadorRole
              ? match.adotantePic ||
                "https://images.unsplash.com/photo-1537151625747-7ae85e565156?auto=format&fit=crop&q=80&w=150"
              : match.pet.photo;
            const displayName = isDoadorRole
              ? match.adotanteName || match.adotanteEmail || "Adotante Interessado"
              : match.pet.name;
            const displaySub = isDoadorRole ? `Pet: ${match.pet.name}` : match.pet.age;

            return (
              <div
                key={match.id}
                id={`mob-match-${match.id}`}
                onClick={() => setSelectedMatchId(match.id)}
                className={`flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer transition border ${
                  isActive
                    ? "bg-rose-50/70 border-rose-100 shadow-xs"
                    : "bg-white hover:bg-slate-50 border-slate-100"
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={displayPhoto}
                    alt={displayName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  {(match.unreadCount || 0) > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-[#2d3748] truncate block">
                      {displayName}
                    </span>
                    <span className="text-[9px] text-[#ff4b6e] font-display font-semibold">
                      {displaySub}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {match.lastMessage || "Comece a conversar!"}
                  </p>
                </div>
              </div>
            );
          })}
          {displayedMatches.length === 0 && (
            <div className="text-center py-10 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <span className="text-xl">🐾</span>
              <p className="text-xs font-bold text-slate-500 mt-2">Nenhum match ativo ainda.</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Conversation Body */}
      {activeChatMatch ? (
        <div className="flex-1 flex flex-col h-full bg-rose-50/5 relative overflow-hidden">
          {/* Chat Header */}
          {(() => {
            const isDoadorRole = userProfile.role === "doador";
            const headerPhoto = isDoadorRole
              ? activeChatMatch.adotantePic ||
                "https://images.unsplash.com/photo-1537151625747-7ae85e565156?auto=format&fit=crop&q=80&w=150"
              : activeChatMatch.pet.photo;
            const headerName = isDoadorRole
              ? activeChatMatch.adotanteName || activeChatMatch.adotanteEmail || "Adotante Interessado"
              : activeChatMatch.pet.name;
            const headerSub = isDoadorRole
              ? `Interessado(a) em: ${activeChatMatch.pet.name} (${activeChatMatch.pet.breed})`
              : `${activeChatMatch.pet.breed} • ${activeChatMatch.pet.age}`;

            return (
              <div className="h-14.5 bg-white border-b border-slate-100 px-4 sm:px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Back button for mobile */}
                  <button
                    type="button"
                    onClick={() => setSelectedMatchId(null)}
                    className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-[#ff4b6e] transition cursor-pointer flex items-center justify-center shrink-0"
                    title="Voltar para conversas"
                  >
                    <svg
                      className="w-5.5 h-5.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <img
                    src={headerPhoto}
                    alt={headerName}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-rose-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs text-slate-800 font-display">{headerName}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Online" />
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">{headerSub}</span>
                  </div>
                </div>

                {/* Chat Header Actions */}
                <div className="flex items-center gap-2">
                  {userProfile.role !== "doador" &&
                    (activeChatMatch.visitStatus === "agendada" ? (
                      <button
                        onClick={() => {
                          showFlash("Visita confirmada! Veja os detalhes no cabeçalho da conversa.", "info");
                        }}
                        className="bg-[#fff9eb] border border-amber-200 text-amber-800 rounded-full px-3.2 py-1 text-[10px] font-bold tracking-wide transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>📅 Visita Agendada</span>
                      </button>
                    ) : activeChatMatch.visitStatus === "proposta_adotante" ? (
                      <button
                        onClick={() => {
                          showFlash("Proposta enviada! Aguardando confirmação do doador.", "info");
                        }}
                        className="bg-orange-50 border border-orange-200 text-orange-850 rounded-full px-3.2 py-1 text-[10px] font-bold tracking-wide transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>📅 Proposta Enviada</span>
                      </button>
                    ) : activeChatMatch.visitStatus === "proposta_doador" ? (
                      <button
                        onClick={() => {
                          showFlash("Você recebeu uma proposta do doador! Responda abaixo na conversa.", "info");
                        }}
                        className="bg-[#fff9eb] border border-amber-200 text-amber-850 rounded-full px-3.2 py-1 text-[10px] font-bold tracking-wide transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>📅 Contraproposta Recebida</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setTempVisitDate("");
                          setTempVisitTime("");
                          setIsSchedulingVisit(true);
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-3.2 py-1 text-[10px] font-bold tracking-wide transition flex items-center gap-1 cursor-pointer"
                        title="Agendar encontro no abrigo"
                      >
                        <span>📅 Agendar Visita</span>
                      </button>
                    ))}

                  {/* Adoption Actions */}
                  {userProfile.role !== "doador" ? (
                    activeChatMatch.adoptionStatus === "adotado" ? (
                      <button
                        disabled
                        className="bg-teal-700 text-white rounded-full px-3.2 py-1 text-[10px] font-bold tracking-wide flex items-center gap-1 cursor-not-allowed opacity-80"
                      >
                        <CheckCircle2 size={11} className="text-teal-200" />
                        Pet Adotado! 🎉
                      </button>
                    ) : activeChatMatch.adoptionStatus === "agendado" ? (
                      <button
                        onClick={() => onSimulateAdoption(activeChatMatch)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-3.2 py-1 text-[10px] font-bold tracking-wide transition flex items-center gap-1 cursor-pointer animate-pulse"
                        title="Clique para confirmar que você buscou o pet no abrigo e concluir a adoção!"
                      >
                        <CheckCircle2 size={11} className="text-emerald-100" />
                        Confirmar Retirada! 🏁
                      </button>
                    ) : activeChatMatch.adoptionStatus === "proposta_adotante" ? (
                      <button
                        onClick={() =>
                          showFlash("Você já enviou a proposta de adoção! Aguardando o doador aceitar.", "info")
                        }
                        className="bg-indigo-50 border border-indigo-200 text-indigo-850 rounded-full px-3.2 py-1 text-[10px] font-bold tracking-wide transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>🐾 Proposta Enviada</span>
                      </button>
                    ) : activeChatMatch.adoptionStatus === "proposta_doador" ? (
                      <button
                        onClick={() =>
                          showFlash(
                            "Você recebeu uma contraproposta de agendamento de adoção! Responda abaixo na conversa.",
                            "info"
                          )
                        }
                        className="bg-[#eef2ff] border border-indigo-200 text-indigo-900 rounded-full px-3.2 py-1 text-[10px] font-bold tracking-wide transition flex items-center gap-1 cursor-pointer animate-bounce"
                      >
                        <span>🐾 Contraproposta Recebida</span>
                      </button>
                    ) : (
                      <button
                        id={`btn-chat-adopt-${activeChatMatch.pet.id}`}
                        onClick={() => {
                          setTempAdoptionDate("");
                          setTempAdoptionTime("");
                          setIsSchedulingAdoption(true);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-3.5 py-1 text-[10px] font-bold tracking-wide transition flex items-center gap-1 cursor-pointer"
                        title="Iniciar processo de adoção responsável"
                      >
                        <CheckCircle2 size={11} fill="currentColor" className="text-emerald-105" />
                        Adotar!
                      </button>
                    )
                  ) : // Donor role view
                  activeChatMatch.adoptionStatus === "adotado" ? (
                    <span className="bg-teal-50 border border-teal-200 text-teal-850 rounded-full px-3.2 py-1 text-[10px] font-bold tracking-wide">
                      🎉 Adotado!
                    </span>
                  ) : activeChatMatch.adoptionStatus === "agendado" ? (
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Você gostaria de confirmar e finalizar a adoção de ${activeChatMatch.pet.name}? Isso removerá o card do pet e enviará a mensagem de confirmação para o chat!`
                          )
                        ) {
                          onSimulateAdoption(activeChatMatch);
                        }
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-3.2 py-1 text-[10px] font-bold tracking-wide transition flex items-center gap-1 cursor-pointer animate-pulse shadow-xs"
                      title="Clique para concluir a adoção e remover o card do pet!"
                    >
                      🏁 Concluir Adoção
                    </button>
                  ) : activeChatMatch.adoptionStatus === "proposta_adotante" ? (
                    <button
                      onClick={() =>
                        showFlash(
                          "Você recebeu uma proposta de adoção responsável! Verifique a caixa amarela de decisão abaixo.",
                          "info"
                        )
                      }
                      className="bg-[#eef2ff] border border-indigo-200 text-indigo-850 rounded-full px-3.2 py-1 text-[10px] font-bold tracking-wide cursor-pointer animate-pulse"
                    >
                      <span>📩 Proposta de Adoção de Adotante</span>
                    </button>
                  ) : activeChatMatch.adoptionStatus === "proposta_doador" ? (
                    <span className="bg-slate-100 border border-slate-200 text-slate-600 rounded-full px-3.2 py-1 text-[10px] font-bold tracking-wide">
                      Proposta de Adoção Enviada
                    </span>
                  ) : (
                    <span className="bg-zinc-100 border border-zinc-200 text-zinc-600 rounded-full px-3.2 py-1 text-[10px] font-bold tracking-wide">
                      Adoção Disponível 🐾
                    </span>
                  )}

                  <button
                    id={`btn-chat-unmatch-${activeChatMatch.pet.id}`}
                    onClick={() => {
                      if (userProfile.role === "doador") {
                        if (
                          window.confirm(
                            `Tem certeza de que deseja excluir o perfil e remover permanentemente o cadastro de ${activeChatMatch.pet.name}?`
                          )
                        ) {
                          onDeletePetProfile(activeChatMatch.pet.id);
                        }
                      } else {
                        onUnmatch(activeChatMatch.id);
                      }
                    }}
                    className="p-1 rounded-full text-slate-300 hover:text-rose-500 transition hover:bg-slate-50 cursor-pointer"
                    title={userProfile.role === "doador" ? "Excluir cadastro do pet" : "Desfazer Match"}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Message Bubble Stream Scroll */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Welcome Notice */}
            {(() => {
              const isDoadorRole = userProfile.role === "doador";
              const headerName = isDoadorRole
                ? activeChatMatch.adotanteName || activeChatMatch.adotanteEmail || "Adotante Interessado"
                : activeChatMatch.pet.name;

              return (
                <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-100/50 flex gap-3 text-xs text-slate-600">
                  <Info size={16} className="text-sky-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sky-800">
                      {isDoadorRole
                        ? `Contato direto com ${headerName}`
                        : `Chat direto com o doador de ${activeChatMatch.pet.name}`}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                      {isDoadorRole
                        ? `Responda às dúvidas do participante sobre a história, vacinação ou comportamento do pet para prosseguir com a adoção responsável!`
                        : `Fale diretamente com o doador para tirar dúvidas sobre a história do bichinho, vacinação, rotina no abrigo ou marcar uma visita física.`}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Active Visit Proposal: Doador Role viewing a proposal from Adotante */}
            {userProfile.role === "doador" && activeChatMatch.visitStatus === "proposta_adotante" && (
              <div className="p-4 bg-[#fffbeb] rounded-2xl border border-amber-200 flex flex-col gap-3 text-xs text-amber-950 shadow-sm animate-in fade-in duration-200">
                <div className="flex gap-2.5 items-center">
                  <span className="text-xl">📬</span>
                  <div>
                    <p className="font-bold text-amber-950">Proposta de Visita Recebida! 🎉</p>
                    <p className="text-[11px] text-amber-850 leading-normal font-sans">
                      O adotante{" "}
                      <span className="font-bold">
                        {activeChatMatch.adotanteName || activeChatMatch.adotanteEmail || "Interessado"}
                      </span>{" "}
                      quer agendar uma visita para conhecer o pet <span className="font-bold">{activeChatMatch.pet.name}</span>.
                    </p>
                    <p className="text-[11.5px] font-extrabold text-[#ff4b6e] mt-1 font-mono">
                      Horário sugerido:{" "}
                      {new Date(activeChatMatch.visitDate + "T00:00:00").toLocaleDateString("pt-BR")} às{" "}
                      {activeChatMatch.visitTime}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onAcceptVisit(activeChatMatch)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer grow text-center shadow-xs"
                  >
                    Aceitar Visita ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempVisitDate(activeChatMatch.visitDate || "");
                      setTempVisitTime(activeChatMatch.visitTime || "");
                      setIsSchedulingVisit(true);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer grow text-center shadow-xs"
                  >
                    Não Aceitar / Propor Novo Horário 📅
                  </button>
                </div>
              </div>
            )}

            {/* Active Visit Proposal Pending Adotante's Acceptance */}
            {userProfile.role === "doador" && activeChatMatch.visitStatus === "proposta_doador" && (
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center justify-between gap-3 text-xs text-orange-950 shadow-sm animate-in fade-in duration-200">
                <div className="flex gap-2.5 items-center">
                  <span className="text-xl">📅</span>
                  <div>
                    <p className="font-bold text-orange-950">Proposta de Contraproposta Enviada! 🐾</p>
                    <p className="text-[10.5px] text-orange-850 font-medium font-sans">
                      Sugerido dia{" "}
                      <span className="font-bold">
                        {new Date(activeChatMatch.visitDate + "T00:00:00").toLocaleDateString("pt-BR")}
                      </span>{" "}
                      às <span className="font-bold">{activeChatMatch.visitTime}</span>. Aguardando aceitação do
                      adotante {activeChatMatch.adotanteName || ""}.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onCancelVisit(activeChatMatch)}
                  className="bg-orange-105 hover:bg-orange-200 text-orange-900 font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer shrink-0"
                >
                  Cancelar Proposta
                </button>
              </div>
            )}

            {/* Active Visit Counter-Proposal received by Adotante */}
            {userProfile.role === "adotante" && activeChatMatch.visitStatus === "proposta_doador" && (
              <div className="p-4 bg-[#fffbeb] rounded-2xl border border-amber-200 flex flex-col gap-3 text-xs text-amber-950 shadow-sm animate-in fade-in duration-200">
                <div className="flex gap-2.5 items-center">
                  <span className="text-xl">📬</span>
                  <div>
                    <p className="font-bold text-amber-950">Contraproposta de Visita Recebida! 🎉</p>
                    <p className="text-[11px] text-amber-850 leading-normal font-sans">
                      O abrigo <span className="font-bold">{activeChatMatch.pet.shelterName}</span> sugeriu uma
                      nova data e horário para a visita do pet <span className="font-bold">{activeChatMatch.pet.name}</span>.
                    </p>
                    <p className="text-[11.5px] font-extrabold text-[#ff4b6e] mt-1 font-mono">
                      Horário sugerido:{" "}
                      {new Date(activeChatMatch.visitDate + "T00:00:00").toLocaleDateString("pt-BR")} às{" "}
                      {activeChatMatch.visitTime}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onAcceptVisit(activeChatMatch)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer grow text-center shadow-xs"
                  >
                    Aceitar Novo Horário ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempVisitDate(activeChatMatch.visitDate || "");
                      setTempVisitTime(activeChatMatch.visitTime || "");
                      setIsSchedulingVisit(true);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer grow text-center shadow-xs"
                  >
                    Não Aceitar / Propor Outro Horário 📅
                  </button>
                </div>
              </div>
            )}

            {/* Proposal Banner: Adotante Role viewing their own proposal pending Doador's acceptance */}
            {userProfile.role === "adotante" && activeChatMatch.visitStatus === "proposta_adotante" && (
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center justify-between gap-3 text-xs text-orange-950 shadow-sm animate-in fade-in duration-200">
                <div className="flex gap-2.5 items-center">
                  <span className="text-xl">📅</span>
                  <div>
                    <p className="font-bold text-orange-950">Proposta de Visita Enviada! 🐾</p>
                    <p className="text-[10.5px] text-orange-850 font-medium font-sans">
                      Dia{" "}
                      <span className="font-bold">
                        {new Date(activeChatMatch.visitDate + "T00:00:00").toLocaleDateString("pt-BR")}
                      </span>{" "}
                      às <span className="font-bold">{activeChatMatch.visitTime}</span>. Aguardando aceitação de{" "}
                      {activeChatMatch.pet.shelterName}.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onCancelVisit(activeChatMatch)}
                  className="bg-orange-105 hover:bg-orange-200 text-orange-900 font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer shrink-0"
                >
                  Cancelar Proposta
                </button>
              </div>
            )}

            {/* Active Visit Information Alert Banner */}
            {activeChatMatch.visitStatus === "agendada" && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-amber-950 shadow-sm animate-in fade-in duration-200">
                <div className="flex gap-2.5 items-center">
                  <span className="text-xl">📅</span>
                  <div>
                    <p className="font-bold text-amber-950">Visita de Adoção Agendada! 🎉</p>
                    <p className="text-[10.5px] text-amber-800 font-medium font-sans">
                      Dia{" "}
                      <span className="font-bold">
                        {new Date(activeChatMatch.visitDate + "T00:00:00").toLocaleDateString("pt-BR")}
                      </span>{" "}
                      às <span className="font-bold">{activeChatMatch.visitTime}</span> no abrigo{" "}
                      <span className="font-bold">{activeChatMatch.pet.shelterName}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onCancelVisit(activeChatMatch)}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer"
                  >
                    Desmarcar Visita
                  </button>
                </div>
              </div>
            )}

            {/* Active Adoption Proposal: Doador Role viewing a proposal from Adotante */}
            {userProfile.role === "doador" && activeChatMatch.adoptionStatus === "proposta_adotante" && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col gap-3 text-xs text-emerald-950 shadow-sm animate-in fade-in duration-200">
                <div className="flex gap-2.5 items-center">
                  <span className="text-xl">📬</span>
                  <div>
                    <p className="font-bold text-emerald-950">Proposta de Adoção Aceita & Termo Assinado! 🐾 🎉</p>
                    <p className="text-[11px] text-emerald-850 leading-normal font-sans">
                      O adotante{" "}
                      <span className="font-bold">
                        {activeChatMatch.adotanteName || activeChatMatch.adotanteEmail || "Interessado"}
                      </span>{" "}
                      assinou o Termo de Posse Responsável e quer agendar a busca do amiguinho{" "}
                      <span className="font-bold">{activeChatMatch.pet.name}</span>.
                    </p>
                    <p className="text-[11.5px] font-extrabold text-emerald-800 mt-1 font-mono bg-white/50 px-2 py-1 rounded inline-block">
                      Data/Horário de busca sugeridos:{" "}
                      {new Date(activeChatMatch.adoptionDate + "T00:00:00").toLocaleDateString("pt-BR")} às{" "}
                      {activeChatMatch.adoptionTime}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onAcceptAdoption(activeChatMatch)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer grow text-center shadow-xs"
                  >
                    Confirmar e Agendar Adoção ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempAdoptionDate(activeChatMatch.adoptionDate || "");
                      setTempAdoptionTime(activeChatMatch.adoptionTime || "");
                      setIsSchedulingAdoption(true);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer grow text-center shadow-xs"
                  >
                    Propor Novo Horário de Retirada 📅
                  </button>
                </div>
              </div>
            )}

            {/* Active Adoption Proposal Pending Adotante's Acceptance */}
            {userProfile.role === "doador" && activeChatMatch.adoptionStatus === "proposta_doador" && (
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center justify-between gap-3 text-xs text-orange-950 shadow-sm animate-in fade-in duration-200">
                <div className="flex gap-2.5 items-center">
                  <span className="text-xl">📅</span>
                  <div>
                    <p className="font-bold text-orange-950">Proposta de Contraproposta de Retirada Enviada! 🐾</p>
                    <p className="text-[10.5px] text-orange-850 font-medium font-sans">
                      Sugerido dia{" "}
                      <span className="font-bold">
                        {new Date(activeChatMatch.adoptionDate + "T00:00:00").toLocaleDateString("pt-BR")}
                      </span>{" "}
                      às <span className="font-bold">{activeChatMatch.adoptionTime}</span>. Aguardando aceitação do
                      adotante {activeChatMatch.adotanteName || ""}.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onCancelAdoption(activeChatMatch)}
                  className="bg-orange-105 hover:bg-orange-200 text-orange-900 font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer shrink-0"
                >
                  Cancelar Proposta
                </button>
              </div>
            )}

            {/* Active Adoption Counter-Proposal received by Adotante */}
            {userProfile.role === "adotante" && activeChatMatch.adoptionStatus === "proposta_doador" && (
              <div className="p-4 bg-[#fffbeb] rounded-2xl border border-amber-200 flex flex-col gap-3 text-xs text-amber-950 shadow-sm animate-in fade-in duration-200">
                <div className="flex gap-2.5 items-center">
                  <span className="text-xl">📬</span>
                  <div>
                    <p className="font-bold text-amber-950">Contraproposta de Entrega/Busca Recebida! 🎉</p>
                    <p className="text-[11px] text-amber-850 leading-normal font-sans">
                      O abrigo <span className="font-bold">{activeChatMatch.pet.shelterName}</span> sugeriu uma
                      nova data e horário para você buscar o pet <span className="font-bold">{activeChatMatch.pet.name}</span>.
                    </p>
                    <p className="text-[11.5px] font-extrabold text-[#ff4b6e] mt-1 font-mono">
                      Horário sugerido:{" "}
                      {new Date(activeChatMatch.adoptionDate + "T00:00:00").toLocaleDateString("pt-BR")} às{" "}
                      {activeChatMatch.adoptionTime}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onAcceptAdoption(activeChatMatch)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer grow text-center shadow-xs"
                  >
                    Aceitar Novo Horário ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempAdoptionDate(activeChatMatch.adoptionDate || "");
                      setTempAdoptionTime(activeChatMatch.adoptionTime || "");
                      setIsSchedulingAdoption(true);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer grow text-center shadow-xs"
                  >
                    Não Aceitar / Propor Outro Horário 📅
                  </button>
                </div>
              </div>
            )}

            {/* Proposal Banner: Adotante Role viewing their own proposal pending Doador's acceptance */}
            {userProfile.role === "adotante" && activeChatMatch.adoptionStatus === "proposta_adotante" && (
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center justify-between gap-3 text-xs text-orange-950 shadow-sm animate-in fade-in duration-200">
                <div className="flex gap-2.5 items-center">
                  <span className="text-xl">📅</span>
                  <div>
                    <p className="font-bold text-orange-950">Proposta de Adoção Enviada! 🐾</p>
                    <p className="text-[10.5px] text-orange-850 font-medium font-sans">
                      Dia{" "}
                      <span className="font-bold">
                        {new Date(activeChatMatch.adoptionDate + "T00:00:00").toLocaleDateString("pt-BR")}
                      </span>{" "}
                      às <span className="font-bold">{activeChatMatch.adoptionTime}</span>. Aguardando aceitação de{" "}
                      {activeChatMatch.pet.shelterName}.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onCancelAdoption(activeChatMatch)}
                  className="bg-orange-105 hover:bg-orange-200 text-orange-900 font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer shrink-0"
                >
                  Cancelar Proposta
                </button>
              </div>
            )}

            {/* Active Adoption Confirmed Information Banner */}
            {activeChatMatch.adoptionStatus === "agendado" && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-250 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-emerald-950 shadow-sm animate-in fade-in duration-200">
                <div className="flex gap-2.5 items-center">
                  <span className="text-xl">🎉</span>
                  <div>
                    <p className="font-bold text-emerald-950">Entrega de Adoção Agendada! 🏠🐾</p>
                    <p className="text-[10.5px] text-emerald-800 font-medium font-sans">
                      Dia <span className="font-bold">{new Date(activeChatMatch.adoptionDate + "T00:00:00").toLocaleDateString("pt-BR")}</span> às <span className="font-bold">{activeChatMatch.adoptionTime}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onCancelAdoption(activeChatMatch)}
                    className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer"
                  >
                    Desmarcar Adoção
                  </button>
                  {userProfile.role !== "doador" && (
                    <button
                      type="button"
                      onClick={() => onSimulateAdoption(activeChatMatch)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer shadow-xs animate-bounce"
                    >
                      Confirmar Retirada 🏁
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Message Bubble stream rendering */}
            {chatMessages.map((msg) => {
              const isMe =
                (userProfile.role === "doador" && msg.sender === "pet") ||
                (userProfile.role !== "doador" && msg.sender === "user");

              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                      isMe
                        ? "bg-gradient-to-br from-[#ff4b6e] to-[#ff7e40] text-white rounded-br-none"
                        : "bg-white border border-slate-100 text-slate-800 rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`text-[8px] block mt-1 text-right ${
                        isMe ? "text-white/60" : "text-slate-405"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Form */}
          <form
            onSubmit={handleSendSubmit}
            className="p-4 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              id="chat-message-input"
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                userProfile.role === "doador"
                  ? `Responda para ${activeChatMatch.adotanteName || activeChatMatch.adotanteEmail || "adotante"}...`
                  : `Escreva uma mensagem carinhosa para o ${activeChatMatch.pet.name}...`
              }
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 placeholder:text-slate-400 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400 transition"
              autoComplete="off"
            />
            <button
              id="chat-send-btn"
              type="submit"
              disabled={!inputMessage.trim()}
              className={`w-11 h-11 rounded-2xl bg-gradient-to-r from-[#ff4b6e] to-[#ff7e40] text-white flex items-center justify-center transition focus:outline-rose-400 cursor-pointer ${
                !inputMessage.trim() ? "opacity-60 cursor-not-allowed" : "hover:brightness-105 active:scale-95"
              }`}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-8 bg-slate-50/20">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3.5">
            <MessageSquare size={22} />
          </div>
          <h4 className="text-lg font-bold text-slate-700">Selecione uma Conversa</h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Escolha um de seus matches na lista para conversar amorosamente e agendar uma recepção de adoção real!
          </p>
        </div>
      )}
    </div>
  );
}
