import * as React from "react";
import { useState, useEffect } from "react";
import { UserProfile } from "../types";
import { Trash2 } from "lucide-react";

interface AuthScreenProps {
  onLoginSuccess: (profile: UserProfile, token: string) => void;
  showFlash: (text: string, type?: "success" | "info") => void;
}

const AVATARS = [
  { id: "1", url: "https://images.unsplash.com/photo-1537151625747-7ae85e565156?auto=format&fit=crop&q=80&w=150" },
  { id: "2", url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=150" },
  { id: "3", url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=150" },
  { id: "4", url: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=150" },
  { id: "5", url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=150" },
  { id: "6", url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=150" }
];

export default function AuthScreen({
  onLoginSuccess,
  showFlash,
}: AuthScreenProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [registerRole, setRegisterRole] = useState<"adotante" | "doador">("adotante");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authLocation, setAuthLocation] = useState("São Paulo, SP");
  const [authPhone, setAuthPhone] = useState("");
  const [authShelterName, setAuthShelterName] = useState("");
  const [authHasYard, setAuthHasYard] = useState(false);
  const [authOtherPets, setAuthOtherPets] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].url);

  // Local state for fetched accounts
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

  const loginDemoAccount = async (role: "adotante" | "doador") => {
    const email = role === "adotante" ? "adotante@paws.com" : "abrigo@paws.com";
    const password = "Password1!";

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        onLoginSuccess(data.profile, data.token);
        showFlash(`Entrou como ${role === "adotante" ? "Adotante" : "Doador"} de Teste!`, "success");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Erro ao fazer login demo.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro de conexão com o servidor.");
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim()) {
      alert("Por favor, preencha o e-mail!");
      return;
    }

    if (authMode === "register") {
      if (!authName.trim()) {
        alert("Por favor, preencha o seu nome!");
        return;
      }
      if (!authPassword) {
        alert("Por favor, preencha a senha!");
        return;
      }

      // Password Requirement: uppercase letter, number, and special character
      const hasUpperCase = /[A-Z]/.test(authPassword);
      const hasNumber = /[0-9]/.test(authPassword);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>\-_]/.test(authPassword);

      if (!hasUpperCase || !hasNumber || !hasSpecialChar) {
        alert(
          "Suas credenciais não são seguras! A senha precisa atender aos seguintes critérios:\n\n• Pelo menos uma Letra Maiúscula\n• Pelo menos um número\n• Pelo menos um caractere especial (ex: !, @, #, $, %)"
        );
        return;
      }

      const roleSelected = registerRole;
      const registrationPayload = {
        email: authEmail.trim(),
        password: authPassword,
        role: roleSelected,
        name: authName.trim(),
        location: authLocation.trim(),
        otherPets: roleSelected === "adotante" ? authOtherPets : false,
        hasYard: roleSelected === "adotante" ? authHasYard : false,
        profilePic: selectedAvatar,
        shelterName: roleSelected === "doador" ? (authShelterName.trim() || authName.trim()) : undefined,
        phone: authPhone.trim() || undefined
      };

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(registrationPayload)
        });

        if (res.ok) {
          const data = await res.json();
          onLoginSuccess(data.profile, data.token);
          showFlash(`Cadastro realizado com sucesso! Bem-vindo(a) ${data.profile.name} 🐾`, "success");
        } else {
          const errorData = await res.json();
          alert(errorData.error || "Erro ao realizar cadastro.");
        }
      } catch (err) {
        console.error(err);
        alert("Erro de conexão ao realizar o cadastro.");
      }
    } else {
      if (!authPassword) {
        alert("Por favor, digite a senha!");
        return;
      }

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authEmail.trim(), password: authPassword })
        });

        if (res.ok) {
          const data = await res.json();
          onLoginSuccess(data.profile, data.token);
          showFlash(`Bem-vindo(a) de volta, ${data.profile.name}! 🎉`, "success");
        } else {
          const errorData = await res.json();
          alert(errorData.error || "Erro ao fazer login.");
        }
      } catch (err) {
        console.error(err);
        alert("Erro de conexão ao fazer login.");
      }
    }
  };

  const handleDeleteAccount = async (email: string) => {
    try {
      const res = await fetch(`/api/auth/accounts/${encodeURIComponent(email)}`, {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer demo-token"
        }
      });

      if (res.ok) {
        showFlash(`A conta ${email} foi excluída com sucesso!`, "info");
        fetchAccounts(); // refresh list
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Erro ao deletar conta.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro de conexão ao deletar a conta.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans leading-relaxed text-slate-800">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Coluna Esquerda: Apresentação Visual */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#ff4b6e] to-[#ff7e40] p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-[25deg] text-white">
            <svg className="w-72 h-72" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>

          <div className="z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-5.5 h-5.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <span className="text-3xl font-black tracking-tight font-display text-white">PetMatch</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-4 font-display">
              O amor verdadeiro tem quatro patas.
            </h2>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              Conectamos protetores que salvam vidas a famílias que buscam um amiguinho leal. Cadastre-se em segundos e faça parte dessa corrente de afeto!
            </p>
          </div>

          <div className="space-y-4 border-t border-white/20 pt-6 z-10">
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                ✓
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">Perfis Customizados</h4>
                <p className="text-[11px] text-white/70 leading-normal">
                  Filtros específicos para adotantes comprometidos ou abrigo gerenciador eficaz.
                </p>
              </div>
            </div>
            <p className="text-[10px] text-white/50 text-left">
              PetMatch © 2026 • Termo de Adoção Virtual e Ficha Sanitária inclusos.
            </p>
          </div>
        </div>

        {/* Coluna Direita: Formulários de Login/Cadastro */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          {/* Toggle switch */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-8 w-fit border border-slate-200/40">
            <button
              type="button"
              onClick={() => setAuthMode("register")}
              className={`px-5 py-2 rounded-xl text-xs font-bold font-display transition duration-200 cursor-pointer ${
                authMode === "register"
                  ? "bg-white text-[#ff4b6e] shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Cadastrar Conta
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className={`px-5 py-2 rounded-xl text-xs font-bold font-display transition duration-200 cursor-pointer ${
                authMode === "login"
                  ? "bg-white text-[#ff4b6e] shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Acessar Login
            </button>
          </div>

          <h3 className="text-xl font-black text-slate-800 mb-1 font-display">
            {authMode === "register" ? "Crie sua conta fofa" : "Bem-vindo de volta!"}
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            {authMode === "register"
              ? "Escolha abaixo se deseja adotar ou se é um abrigo parceiro."
              : "Digite suas credenciais abaixo para entrar e interagir com pets."}
          </p>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === "register" && (
              <>
                {/* ROLE SELECTION */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setRegisterRole("adotante")}
                    className={`p-4 rounded-2xl border-2 text-left transition duration-200 flex flex-col justify-between h-28 relative cursor-pointer ${
                      registerRole === "adotante"
                        ? "border-[#ff4b6e] bg-rose-50/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-lg">🐶</span>
                      {registerRole === "adotante" && (
                        <span className="w-2.5 h-2.5 bg-[#ff4b6e] rounded-full" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-800 block">Sou Adotante</span>
                      <span className="text-[10px] text-slate-400 leading-tight block">
                        Quero ver pets fofos, dar matches e adotar
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegisterRole("doador")}
                    className={`p-4 rounded-2xl border-2 text-left transition duration-200 flex flex-col justify-between h-28 relative cursor-pointer ${
                      registerRole === "doador"
                        ? "border-[#ff4b6e] bg-rose-50/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-lg">🏠</span>
                      {registerRole === "doador" && (
                        <span className="w-2.5 h-2.5 bg-[#ff4b6e] rounded-full" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-800 block">Sou Doador</span>
                      <span className="text-[10px] text-slate-400 leading-tight block">
                        Gerencio abrigo e cadastro pets de resgate
                      </span>
                    </div>
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                    {registerRole === "doador" ? "Nome da ONG ou Protetor" : "Seu Nome Completo"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={registerRole === "doador" ? "Ex: Abrigo Patas de Ouro" : "Ex: Mariana Silva"}
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-400 transition"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                E-mail de Acesso
              </label>
              <input
                type="email"
                required
                placeholder="Ex: seuemail@paws.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-400 transition"
              />
              {authMode === "login" && (
                <p className="text-[9px] text-slate-400 mt-1">
                  Dica: Insira e-mails contendo "abrigo" ou "doador" para acessar como Doador se estivesse pré-carregado, ou clique em Cadastro.
                </p>
              )}
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                Senha de Acesso
              </label>
              <input
                type="password"
                required
                placeholder={authMode === "register" ? "Crie uma senha forte" : "Digite sua senha"}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-400 transition"
              />

              {authMode === "register" && (
                <div className="mt-2 p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                    Requisitos de Segurança da Senha:
                  </span>
                  <div className="flex flex-col gap-1 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={
                          /[A-Z]/.test(authPassword)
                            ? "text-emerald-600 font-bold flex items-center gap-1"
                            : "text-slate-400 flex items-center gap-1"
                        }
                      >
                        <span>{/[A-Z]/.test(authPassword) ? "✓" : "○"}</span>
                        <span>Letra Maiúscula</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={
                          /[0-9]/.test(authPassword)
                            ? "text-emerald-600 font-bold flex items-center gap-1"
                            : "text-slate-400 flex items-center gap-1"
                        }
                      >
                        <span>{/[0-9]/.test(authPassword) ? "✓" : "○"}</span>
                        <span>Contém Número</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={
                          /[!@#$%^&*(),.?":{}|<>\-_]/.test(authPassword)
                            ? "text-emerald-600 font-bold flex items-center gap-1"
                            : "text-slate-400 flex items-center gap-1"
                        }
                      >
                        <span>{/[!@#$%^&*(),.?":{}|<>\-_]/.test(authPassword) ? "✓" : "○"}</span>
                        <span>Caractere Especial (ex: !, @, #, $, %)</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {authMode === "login" && (
                <p className="text-[9px] text-slate-400 mt-1">
                  Dica: Usuários de teste pré-cadastrados usam a senha{" "}
                  <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-bold text-xxs">
                    Password1!
                  </span>
                </p>
              )}
            </div>

            {authMode === "register" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                      Localização (Cidade, UF)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Rio de Janeiro, RJ"
                      value={authLocation}
                      onChange={(e) => setAuthLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                      WhatsApp / Telefone
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: (11) 98888-2222"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white"
                    />
                  </div>
                </div>

                {/* ADOTANTE FIELDS */}
                {registerRole === "adotante" && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100/50 transition">
                      <input
                        type="checkbox"
                        checked={authHasYard}
                        onChange={(e) => setAuthHasYard(e.target.checked)}
                        className="accent-[#ff4b6e]"
                      />
                      <span className="text-[11px] font-bold text-slate-600">Possuo quintal seguro</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100/50 transition">
                      <input
                        type="checkbox"
                        checked={authOtherPets}
                        onChange={(e) => setAuthOtherPets(e.target.checked)}
                        className="accent-[#ff4b6e]"
                      />
                      <span className="text-[11px] font-bold text-slate-600">Já tenho outros pets</span>
                    </label>
                  </div>
                )}

                {/* DOADOR FIELDS */}
                {registerRole === "doador" && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                      Nome da ONG / Abrigo (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Associação Protetores da Vida"
                      value={authShelterName}
                      onChange={(e) => setAuthShelterName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white"
                    />
                  </div>
                )}

                {/* AVATAR SELECTOR */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                    Escolha sua foto de perfil / ícone
                  </label>
                  <div className="flex gap-2.5 items-center overflow-x-auto py-1">
                    {AVATARS.map((av) => {
                      const isChosen = selectedAvatar === av.url;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setSelectedAvatar(av.url)}
                          className={`w-11 h-11 rounded-full relative shrink-0 border-2 transition overflow-hidden cursor-pointer ${
                            isChosen
                              ? "border-[#ff4b6e] scale-110 shadow-sm"
                              : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={av.url} alt="avatar" className="w-full h-full object-cover" />
                          {isChosen && (
                            <div className="absolute inset-0 bg-[#ff4b6e]/10 flex items-center justify-center text-xs font-bold text-[#ff4b6e]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full mt-4 bg-gradient-to-r from-[#ff4b6e] to-[#ff7e40] text-white py-3 rounded-2xl font-display font-black text-xs uppercase tracking-widest shadow-md hover:brightness-105 active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{authMode === "register" ? "Finalizar Cadastro 🐾" : "Acessar Conta PetMatch 🐾"}</span>
            </button>
          </form>

          {/* QUICK DEMO BUTTONS */}
          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-[9px] font-black uppercase text-slate-300 tracking-widest">
              Acesso Rápido para Teste
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => loginDemoAccount("adotante")}
              className="px-4 py-2.5 border border-dashed border-rose-300 bg-rose-50/10 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Adotante de Teste</span>
            </button>
            <button
              type="button"
              onClick={() => loginDemoAccount("doador")}
              className="px-4 py-2.5 border border-dashed border-orange-300 bg-orange-50/10 text-orange-600 hover:bg-orange-50 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Doador de Teste</span>
            </button>
          </div>

          {/* REGISTERED USERS MANAGEMENT */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2">
              📂 Contas Cadastradas no Sistema ({accounts.length})
            </span>

            {accounts.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic">Nenhuma conta no banco de dados local.</p>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {accounts.map((profile) => {
                  const isDoador = profile.role === "doador";
                  return (
                    <div
                      key={profile.email}
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition"
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-bold text-slate-700 truncate text-[11px]">
                          {profile.name}
                        </span>
                        <span className="text-[9px] text-slate-400 truncate mt-0.5">{profile.email}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            isDoador
                              ? "bg-orange-50 text-orange-600 border border-orange-100"
                              : "bg-rose-50 text-rose-600 border border-rose-100"
                          }`}
                        >
                          {isDoador ? "Doador" : "Adotante"}
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
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-white transition cursor-pointer"
                          title="Excluir Conta do Sistema"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
