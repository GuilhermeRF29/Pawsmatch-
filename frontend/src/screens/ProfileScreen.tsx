import * as React from "react";
import { useState, useEffect } from "react";
import { UserProfile, ActiveTab } from "../types";
import { Sparkles, LogOut, Trash2, AlertCircle } from "lucide-react";

interface ProfileScreenProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  handleLogout: () => void;
  showFlash: (text: string, type?: "success" | "info") => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export default function ProfileScreen({
  userProfile,
  setUserProfile,
  handleLogout,
  showFlash,
  setActiveTab,
}: ProfileScreenProps) {
  const [accounts, setAccounts] = useState<UserProfile[]>([]);

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/auth/accounts");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts);
      }
    } catch (e) {
      console.error("Erro ao carregar contas do servidor:", e);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleDeleteAccount = async (email: string) => {
    const isMe = email.trim().toLowerCase() === userProfile.email.trim().toLowerCase();
    const token = localStorage.getItem("paws_token") || "demo-token";

    try {
      const res = await fetch(`/api/auth/accounts/${encodeURIComponent(email)}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        if (isMe) {
          handleLogout();
          showFlash("Sua conta foi excluída com sucesso de nossos registros.", "info");
        } else {
          showFlash(`A conta ${email} foi excluída com sucesso!`, "info");
          fetchAccounts(); // Refresh account list
        }
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Erro ao excluir conta.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro de conexão ao excluir conta.");
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("paws_token");
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(userProfile)
      });
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data.profile);
        localStorage.setItem("paws_user_profile", JSON.stringify(data.profile));
        if (data.token) {
          localStorage.setItem("paws_token", data.token);
        }
        showFlash("Perfil atualizado e salvo com sucesso!", "success");
        setActiveTab(userProfile.role === "doador" ? "my-listed-pets" : "swipe");
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao salvar perfil.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar perfil.");
    }
  };

  return (
    <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-rose-50 p-6 sm:p-8">
      <div className="flex items-center gap-4 border-b border-rose-50 pb-5 mb-5">
        <div className="relative">
          <img
            src={userProfile.profilePic}
            alt={userProfile.name}
            className="w-18 h-18 rounded-full object-cover border-2 border-[#ff4b6e] p-0.5"
            referrerPolicy="no-referrer"
          />
          <div className="absolute right-0 bottom-0 bg-gradient-to-r from-[#ff4b6e] to-[#ff7e40] text-white p-1 rounded-full border border-white">
            <Sparkles size={10} />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-black text-[#ff4b6e] font-display">
            {userProfile.role === "doador" ? "Perfil do Doador / Abrigo" : "Seu Perfil de Adotante"}
          </h3>
          <p className="text-xs text-slate-400">
            {userProfile.role === "doador"
              ? "As informações cadastradas aparecem como contato oficial dos seus pets para adoção!"
              : "O robô pet usará essas informações para te responder no chat!"}
          </p>
        </div>
      </div>

      {/* Editable Profile form */}
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">
            {userProfile.role === "doador" ? "Nome do Responsável / Protetor" : "Como quer ser chamado(a)?"}
          </label>
          <input
            id="profile-name-input"
            type="text"
            value={userProfile.name}
            onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-400 transition"
          />
        </div>

        {userProfile.role === "doador" && (
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Nome oficial do Abrigo / ONG</label>
            <input
              id="profile-shelter-input"
              type="text"
              value={userProfile.shelterName || ""}
              onChange={(e) => setUserProfile({ ...userProfile, shelterName: e.target.value })}
              placeholder="Nome do abrigo parceiro"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-400 transition"
            />
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">E-mail de Contato</label>
          <input
            id="profile-email-input"
            type="email"
            value={userProfile.email}
            onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-400 transition"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">Cidade e UF onde reside</label>
          <input
            id="profile-location-input"
            type="text"
            value={userProfile.location}
            onChange={(e) => setUserProfile({ ...userProfile, location: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-400 transition"
          />
        </div>

        {userProfile.role === "doador" && (
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Telefone / WhatsApp Comercial</label>
            <input
              id="profile-phone-input"
              type="text"
              value={userProfile.phone || ""}
              onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
              placeholder="Ex: (11) 98888-5555"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none"
            />
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">
            URL de foto de perfil (ícone do abrigo ou foto pessoal)
          </label>
          <input
            id="profile-pic-input"
            type="text"
            value={userProfile.profilePic}
            onChange={(e) => setUserProfile({ ...userProfile, profilePic: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-400 transition"
          />
        </div>

        {userProfile.role === "adotante" && (
          <div className="grid grid-cols-2 gap-4 pt-1">
            {/* Yard check */}
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100/50 transition">
              <input
                id="profile-yard-checkbox"
                type="checkbox"
                checked={userProfile.hasYard}
                onChange={(e) => setUserProfile({ ...userProfile, hasYard: e.target.checked })}
                className="accent-[#ff4b6e] w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-slate-700 block">Tenho quintal grande</span>
                <span className="text-[10px] text-slate-400">Totalmente cercado e seguro</span>
              </div>
            </label>

            {/* Other Pets check */}
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100/50 transition">
              <input
                id="profile-otherpets-checkbox"
                type="checkbox"
                checked={userProfile.otherPets}
                onChange={(e) => setUserProfile({ ...userProfile, otherPets: e.target.checked })}
                className="accent-[#ff4b6e] w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-slate-700 block">Já tenho outros animais</span>
                <span className="text-[10px] text-slate-400">Gato, cachorro ou aves domésticas</span>
              </div>
            </label>
          </div>
        )}

        {/* Info Card banner */}
        <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl flex gap-3 text-xs text-slate-650 mt-4 leading-relaxed">
          <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-rose-800">Preenchimento Automático Gemini</span>
            <p className="text-[10px] text-neutral-500 mt-0.5">
              Pronto! O robô de IA agora sabe se você tem quintal e outros amiguinhos. Ele usará essas referências fofas em próximas conversas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            id="profile-save-btn"
            onClick={handleSave}
            className="bg-gradient-to-r from-[#ff4b6e] to-[#ff7e40] text-white py-3 px-4 rounded-xl font-display font-bold text-xs tracking-wide shadow-md hover:brightness-105 active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Confirmar e Salvar
          </button>

          <button
            onClick={handleLogout}
            className="border border-rose-200 text-rose-600 hover:bg-rose-50 py-3 px-4 rounded-xl font-display font-medium text-xs tracking-wide transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut size={13} />
            Sair da Conta (Logout)
          </button>
        </div>

        {/* ZONA DE PERIGO */}
        <div className="mt-8 pt-6 border-t border-rose-100">
          <h4 className="text-[10px] font-black uppercase text-rose-500 tracking-wider mb-2.5 flex items-center gap-1">
            <span>⚠️</span> <span>Zona de Perigo / Gerenciar Contas ({accounts.length})</span>
          </h4>
          <div className="p-4 bg-rose-50/20 border border-rose-100 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-700">Excluir Minha Conta Atual</p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Apaga permanentemente seu cadastro e dados salvos no sistema, realizando logout.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      "Você tem certeza ABSOLUTA de que deseja EXCLUIR permanentemente a sua conta atual? Esta ação é irreversível e se deslogará imediatamente!"
                    )
                  ) {
                    handleDeleteAccount(userProfile.email);
                  }
                }}
                className="bg-rose-100 hover:bg-rose-200 text-rose-700 py-1.5 px-3 rounded-xl text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Trash2 size={11} />
                Excluir Minha Conta
              </button>
            </div>

            {/* Other system accounts */}
            <div className="pt-3.5 border-t border-slate-100/80">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">
                Excluir Outras Contas Cadastradas no App:
              </p>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {accounts.map((profile) => {
                  const isMe = profile.email.toLowerCase() === userProfile.email.toLowerCase();
                  return (
                    <div
                      key={profile.email}
                      className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 text-xs hover:border-slate-200 transition"
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-bold text-slate-700 truncate text-[11px]">
                          {profile.name} {isMe && <span className="text-[9px] text-[#ff4b6e] font-normal">(Você)</span>}
                        </span>
                        <span className="text-[9px] text-slate-400 truncate mt-0.5">{profile.email}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            profile.role === "doador"
                              ? "bg-orange-50 text-orange-600 border border-orange-100"
                              : "bg-rose-50 text-rose-600 border border-rose-100"
                          }`}
                        >
                          {profile.role === "doador" ? "Doador" : "Adotante"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Tem certeza de que deseja excluir permanentemente a conta de ${profile.name} (${profile.email})?`
                              )
                            ) {
                              handleDeleteAccount(profile.email);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Excluir Conta do Sistema"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
