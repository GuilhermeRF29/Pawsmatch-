import * as React from "react";
import { useState, useEffect } from "react";
import { INITIAL_PETS, INITIAL_USER_PROFILE } from "./data";
import { Pet, Match, Message, UserProfile, ActiveTab, PetType, PetGender, PetSize } from "./types";
import SwipeCard from "./components/SwipeCard";
import PetFilter from "./components/PetFilter";
import MatchModal from "./components/MatchModal";
import { 
  Heart, 
  MessageSquare, 
  User, 
  PlusCircle, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Send, 
  AlertCircle, 
  Info, 
  Home, 
  Trash2, 
  Plus, 
  Briefcase, 
  Loader2,
  LogOut,
  Users,
  ShieldAlert
} from "lucide-react";

export default function App() {
  // State variables
  const [pets, setPets] = useState<Pet[]>(() => {
    const saved = localStorage.getItem("paws_pets");
    const loaded: Pet[] = saved ? JSON.parse(saved) : INITIAL_PETS;
    return loaded.filter(pet => pet.type === "Cachorro" || pet.type === "Gato");
  });
  
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("paws_user_profile");
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("paws_is_logged_in") === "true";
  });

  // Auth Forms States
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
  const [selectedAvatar, setSelectedAvatar] = useState("https://images.unsplash.com/photo-1537151625747-7ae85e565156?auto=format&fit=crop&q=80&w=150");

  // Local database for registered user credentials with initialized demo accounts
  const [registeredUsers, setRegisteredUsers] = useState<Record<string, { password?: string; profile: UserProfile }>>(() => {
    const saved = localStorage.getItem("paws_users_db");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const initialDb = {
      "adotante@paws.com": {
        password: "Password1!",
        profile: {
          name: "Adotante Inspirador",
          email: "adotante@paws.com",
          role: "adotante" as const,
          location: "São Paulo, SP",
          otherPets: false,
          hasYard: true,
          profilePic: "https://images.unsplash.com/photo-1537151625747-7ae85e565156?auto=format&fit=crop&q=80&w=150"
        }
      },
      "abrigo@paws.com": {
        password: "Password1!",
        profile: {
          name: "Abraço de Quatro Patas NGO",
          email: "abrigo@paws.com",
          role: "doador" as const,
          location: "Campinas, SP",
          otherPets: false,
          hasYard: true,
          profilePic: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=150",
          shelterName: "ONG Abraço de Quatro Patas",
          phone: "(19) 98765-4321"
        }
      }
    };
    localStorage.setItem("paws_users_db", JSON.stringify(initialDb));
    return initialDb;
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem("paws_matches");
    return saved ? JSON.parse(saved) : [];
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("paws_messages");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const savedProfile = localStorage.getItem("paws_user_profile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile) as UserProfile;
        return parsed.role === "doador" ? "my-listed-pets" : "swipe";
      } catch (e) {}
    }
    return "swipe";
  });
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // New Pet Form State
  const [newPet, setNewPet] = useState<Partial<Pet>>({
    name: "",
    type: "Cachorro",
    breed: "",
    age: "",
    gender: "Macho",
    size: "Médio",
    photo: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600",
    bio: "",
    location: "São Paulo, SP",
    shelterName: "Abrigo do Luar",
    contactEmail: "adocao@abrigodoluar.org",
    contactPhone: "(11) 99999-9999"
  });

  // Filtering States
  const [filterType, setFilterType] = useState<PetType | "Todos">("Todos");
  const [filterGender, setFilterGender] = useState<PetGender | "Todos">("Todos");
  const [filterSize, setFilterSize] = useState<PetSize | "Todos">("Todos");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Modern Alert state
  const [flashMessage, setFlashMessage] = useState<{ text: string; type: "success" | "info" } | null>(null);

  // Active show matched celebration modal
  const [celebrationPet, setCelebrationPet] = useState<Pet | null>(null);

  // Visit scheduling states
  const [isSchedulingVisit, setIsSchedulingVisit] = useState(false);
  const [tempVisitDate, setTempVisitDate] = useState("");
  const [tempVisitTime, setTempVisitTime] = useState("");

  // Adoption scheduling states
  const [isSchedulingAdoption, setIsSchedulingAdoption] = useState(false);
  const [tempAdoptionDate, setTempAdoptionDate] = useState("");
  const [tempAdoptionTime, setTempAdoptionTime] = useState("");
  const [schedulingType, setSchedulingType] = useState<"visita" | "adocao">("visita");

  // Persist back dependencies
  useEffect(() => {
    localStorage.setItem("paws_pets", JSON.stringify(pets));
  }, [pets]);

  useEffect(() => {
    localStorage.setItem("paws_user_profile", JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("paws_matches", JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem("paws_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("paws_users_db", JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  const showFlash = (text: string, type: "success" | "info" = "success") => {
    setFlashMessage({ text, type });
    setTimeout(() => {
      setFlashMessage(null);
    }, 4000);
  };

  // Direct simulator for demo roles
  const loginDemoAccount = (role: "adotante" | "doador") => {
    if (role === "adotante") {
      const demoProfile: UserProfile = {
        name: "Adotante Inspirador",
        email: "adotante@paws.com",
        role: "adotante",
        location: "São Paulo, SP",
        otherPets: false,
        hasYard: true,
        profilePic: "https://images.unsplash.com/photo-1537151625747-7ae85e565156?auto=format&fit=crop&q=80&w=150"
      };
      setUserProfile(demoProfile);
      localStorage.setItem("paws_user_profile", JSON.stringify(demoProfile));
      setIsLoggedIn(true);
      localStorage.setItem("paws_is_logged_in", "true");
      setActiveTab("swipe");
      showFlash("Entrou como Adotante de Teste! Explore e curta os pets.", "success");
    } else {
      const demoProfile: UserProfile = {
        name: "Abraço de Quatro Patas NGO",
        email: "abrigo@paws.com",
        role: "doador",
        location: "Campinas, SP",
        otherPets: false,
        hasYard: true,
        profilePic: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=150",
        shelterName: "ONG Abraço de Quatro Patas",
        phone: "(19) 98765-4321"
      };
      setUserProfile(demoProfile);
      localStorage.setItem("paws_user_profile", JSON.stringify(demoProfile));
      setIsLoggedIn(true);
      localStorage.setItem("paws_is_logged_in", "true");
      setActiveTab("my-listed-pets");
      showFlash("Entrou como Doador de Teste! Cadastre e gerencie pets.", "success");
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
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
        alert("Suas credenciais não são seguras! A senha precisa atender aos seguintes critérios:\n\n• Pelo menos uma Letra Maiúscula\n• Pelo menos um número\n• Pelo menos um caractere especial (ex: !, @, #, $, %)");
        return;
      }

      const roleSelected = registerRole;
      const newProfile: UserProfile = {
        name: authName.trim(),
        email: authEmail.trim(),
        role: roleSelected,
        location: authLocation.trim(),
        otherPets: roleSelected === "adotante" ? authOtherPets : false,
        hasYard: roleSelected === "adotante" ? authHasYard : false,
        profilePic: selectedAvatar,
        shelterName: roleSelected === "doador" ? (authShelterName.trim() || authName.trim()) : undefined,
        phone: authPhone.trim() || undefined
      };

      // Store user credentials in our local registeredUsers database
      const updatedUsers = {
        ...registeredUsers,
        [authEmail.trim().toLowerCase()]: {
          password: authPassword,
          profile: newProfile
        }
      };
      setRegisteredUsers(updatedUsers);
      localStorage.setItem("paws_users_db", JSON.stringify(updatedUsers));

      setUserProfile(newProfile);
      localStorage.setItem("paws_user_profile", JSON.stringify(newProfile));
      setIsLoggedIn(true);
      localStorage.setItem("paws_is_logged_in", "true");
      
      const targetTab = roleSelected === "doador" ? "my-listed-pets" : "swipe";
      setActiveTab(targetTab);
      showFlash(`Cadastro realizado com sucesso! Bem-vindo(a) ${newProfile.name} 🐾`, "success");
    } else {
      if (!authPassword) {
        alert("Por favor, digite a senha!");
        return;
      }

      const emailKey = authEmail.trim().toLowerCase();
      const existingUser = registeredUsers[emailKey];

      if (existingUser) {
        if (existingUser.password !== authPassword) {
          alert("Senha incorreta! Por favor, verifique suas credenciais ou utilize os botões rápidos de teste abaixo.");
          return;
        }
        
        // Log in valid user
        setUserProfile(existingUser.profile);
        localStorage.setItem("paws_user_profile", JSON.stringify(existingUser.profile));
        setIsLoggedIn(true);
        localStorage.setItem("paws_is_logged_in", "true");
        
        const targetTab = existingUser.profile.role === "doador" ? "my-listed-pets" : "swipe";
        setActiveTab(targetTab);
        showFlash(`Bem-vindo(a) de volta, ${existingUser.profile.name}! 🎉`, "success");
      } else {
        // Let the user know the email/password is not in database, but facilitate them by offering dynamic signup
        alert("E-mail não encontrado nos registros do aplicativo. Por favor, use a aba 'Cadastrar Conta' para criar uma nova conta primeiro!");
        return;
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("paws_is_logged_in");
    showFlash("Sessão finalizada. Até logo!", "info");
  };

  if (!isLoggedIn) {
    const AVATARS = [
      { id: "1", url: "https://images.unsplash.com/photo-1537151625747-7ae85e565156?auto=format&fit=crop&q=80&w=150" },
      { id: "2", url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=150" },
      { id: "3", url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=150" },
      { id: "4", url: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=150" },
      { id: "5", url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=150" },
      { id: "6", url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=150" }
    ];

    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans leading-relaxed text-slate-800">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Coluna Esquerda: Apresentação Visual da marca/slogan */}
          <div className="md:col-span-5 bg-gradient-to-br from-[#ff4b6e] to-[#ff7e40] p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Ambient pattern dots */}
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-[25deg] text-white">
              <svg className="w-72 h-72" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>

            <div className="z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-sm">
                  <svg className="w-5.5 h-5.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
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

            {/* Testimonials or safety stats details inside landing */}
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

          {/* Coluna Direita: Formulários de Login/Cadastro interativo */}
          <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
            
            {/* Toggle switch between Login & Register */}
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
                  {/* ROLE SELECTION BUTTON CARDS - ADOTANTE vs DOADOR */}
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
                        <span className="text-[10px] text-slate-400 leading-tight block">Quero ver pets fofos, dar matches e adotar</span>
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
                        <span className="text-[10px] text-slate-400 leading-tight block">Gerencio abrigo e cadastro pets de resgate</span>
                      </div>
                    </button>
                  </div>

                  {/* CAMPOS COMUNS DE REGISTRO */}
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
                <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">E-mail de Acesso</label>
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
                <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Senha de Acesso</label>
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
                    <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Requisitos de Segurança da Senha:</span>
                    <div className="flex flex-col gap-1 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className={/[A-Z]/.test(authPassword) ? "text-emerald-600 font-bold flex items-center gap-1" : "text-slate-400 flex items-center gap-1"}>
                          <span>{/[A-Z]/.test(authPassword) ? "✓" : "○"}</span>
                          <span>Letra Maiúscula</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={/[0-9]/.test(authPassword) ? "text-emerald-600 font-bold flex items-center gap-1" : "text-slate-400 flex items-center gap-1"}>
                          <span>{/[0-9]/.test(authPassword) ? "✓" : "○"}</span>
                          <span>Contém Número</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={/[!@#$%^&*(),.?":{}|<>\-_]/.test(authPassword) ? "text-emerald-600 font-bold flex items-center gap-1" : "text-slate-400 flex items-center gap-1"}>
                          <span>{/[!@#$%^&*(),.?":{}|<>\-_]/.test(authPassword) ? "✓" : "○"}</span>
                          <span>Caractere Especial (ex: !, @, #, $, %)</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {authMode === "login" && (
                  <p className="text-[9px] text-slate-400 mt-1">
                    Dica: Usuários de teste pré-cadastrados usam a senha <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-bold text-xxs">Password1!</span>
                  </p>
                )}
              </div>

              {authMode === "register" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Localização (Cidade, UF)</label>
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
                      <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">WhatsApp / Telefone</label>
                      <input
                        type="text"
                        placeholder="Ex: (11) 98888-2222"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* CAMPOS ESPECÍFICOS DE ADOTANTE */}
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

                  {/* CAMPOS ESPECÍFICOS DE DOADOR */}
                  {registerRole === "doador" && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Nome da ONG / Abrigo (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: Associação Protetores da Vida"
                        value={authShelterName}
                        onChange={(e) => setAuthShelterName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white"
                      />
                    </div>
                  )}

                  {/* SELETOR DE AVATAR RÁPIDO */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Escolha sua foto de perfil / ícone</label>
                    <div className="flex gap-2.5 items-center overflow-x-auto py-1">
                      {AVATARS.map((av) => {
                        const isChosen = selectedAvatar === av.url;
                        return (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() => setSelectedAvatar(av.url)}
                            className={`w-11 h-11 rounded-full relative shrink-0 border-2 transition overflow-hidden cursor-pointer ${
                              isChosen ? "border-[#ff4b6e] scale-110 shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
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

              {/* AUTH BOTÃO ENVIAR FORMULARIO */}
              <button
                type="submit"
                className="w-full mt-4 bg-gradient-to-r from-[#ff4b6e] to-[#ff7e40] text-white py-3 rounded-2xl font-display font-black text-xs uppercase tracking-widest shadow-md hover:brightness-105 active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{authMode === "register" ? "Finalizar Cadastro 🐾" : "Acessar Conta PetMatch 🐾"}</span>
              </button>
            </form>

            {/* SEPARADOR PARA ACESSO RÁPIDO DO AVALIADOR */}
            <div className="relative flex items-center my-6">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-[9px] font-black uppercase text-slate-300 tracking-widest">Acesso Rápido para Teste</span>
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

            {/* GERENCIADOR DE CONTAS (EXCLUIR AS CONTAS) */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                📂 Contas Cadastradas no Sistema ({Object.keys(registeredUsers).length})
              </span>
              
              {Object.keys(registeredUsers).length === 0 ? (
                <p className="text-[10px] text-slate-400 italic">Nenhuma conta no banco de dados local.</p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {(Object.entries(registeredUsers) as [string, { password?: string; profile: UserProfile }][]).map(([email, info]) => {
                    const isDoador = info.profile.role === "doador";
                    return (
                      <div 
                        key={email} 
                        className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition"
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="font-bold text-slate-700 truncate text-[11px]">{info.profile.name}</span>
                          <span className="text-[9px] text-slate-400 truncate mt-0.5">{email}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            isDoador ? "bg-orange-50 text-orange-600 border border-orange-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                          }`}>
                            {isDoador ? "Doador" : "Adotante"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Tem certeza de que deseja excluir permanentemente a conta de ${info.profile.name} (${email})?`)) {
                                const newUsers = { ...registeredUsers };
                                delete newUsers[email];
                                setRegisteredUsers(newUsers);
                                showFlash(`A conta ${email} foi excluída com sucesso!`, "info");
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


  // Code successfully reorganized above early-return.

  // Filter logic on current available pets
  const filteredPets = pets.filter((pet) => {
    // 1. Hide already adopted pets
    if (pet.isAdopted) return false;
    // 2. Hide matches
    const isMatched = matches.some((m) => m.pet.id === pet.id);
    if (isMatched) return false;
    // 3. Keep filters
    if (filterType !== "Todos" && pet.type !== filterType) return false;
    if (filterGender !== "Todos" && pet.gender !== filterGender) return false;
    if (filterSize !== "Todos" && pet.size !== filterSize) return false;
    return true;
  });

  // Top card pet (index 0 or last depending on stack approach)
  const currentPet = filteredPets[0] || null;

  // Recurse filters
  const resetFilters = () => {
    setFilterType("Todos");
    setFilterGender("Todos");
    setFilterSize("Todos");
    showFlash("Todos os filtros redefinidos!", "info");
  };

  // Swipe Action
  const handleSwipe = (direction: "left" | "right" | "super") => {
    if (!currentPet) return;

    if (direction === "right" || direction === "super") {
      // 80% chance of a match for fun / engagement!
      const isMatch = Math.random() < 0.85;
      
      if (isMatch) {
        const newMatch: Match = {
          id: `match-${Date.now()}`,
          pet: currentPet,
          matchedAt: new Date().toISOString(),
          lastMessage: direction === "super" ? "Super Gostei!" : "Match Recente",
          unreadCount: 1,
          adotanteEmail: userProfile.email,
          adotanteName: userProfile.name,
          adotantePic: userProfile.profilePic
        };

        // Prepopulate first sweet greeting to start off the discussion from the shelter/donor
        const introGreeting: Message = {
          id: `msg-intro-${Date.now()}`,
          matchId: newMatch.id,
          sender: "pet",
          text: `Olá! Nós do abrigo ${currentPet.shelterName} ficamos extremamente felizes com seu interesse no(a) ${currentPet.name}. Estamos prontos para conversar sobre o processo de adoção responsável! Sinta-se à vontade para tirar dúvidas por aqui ou sugerir um agendamento de visita. 🐾`,
          timestamp: new Date().toISOString()
        };

        newMatch.lastMessage = introGreeting.text;

        setMatches((prev) => [newMatch, ...prev]);
        setMessages((prev) => [...prev, introGreeting]);
        setCelebrationPet(currentPet);
      } else {
        showFlash(`Você curtiu ${currentPet.name}, mas ele está dormindo agora...`);
      }
    } else {
      showFlash(`${currentPet.name} foi pulado(a). Outtos petinhos te esperam!`, "info");
    }

    // Move to next pet by removing current from active list or mark in history
    // For local storage state simplicity, we can keep the pets array but mark as skipped locally if we want, or just rotate. Let's send him to back of deck so user can filter or see him later!
    setPets((prev) => {
      const target = prev.find((p) => p.id === currentPet.id);
      if (!target) return prev;
      const filtered = prev.filter((p) => p.id !== currentPet.id);
      return [...filtered, target]; // Append to the back
    });
  };

  // Set selected match and switch views
  const handleSelectChat = (matchId: string) => {
    setSelectedMatchId(matchId);
    setActiveTab("matches");
    // Clear unread
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, unreadCount: 0 } : m))
    );
  };

  const displayedMatches = matches.filter((match) => {
    if (userProfile.role === "doador") {
      // Doador sees matches with pets that belong to their shelter, or custom-pets
      const matchesMyPet = 
        match.pet.contactEmail === userProfile.email ||
        match.pet.shelterName === userProfile.shelterName ||
        match.pet.id.startsWith("custom-pet-");
      return matchesMyPet || !match.adotanteEmail;
    } else {
      // Adotante sees matches they personally started
      return !match.adotanteEmail || match.adotanteEmail === userProfile.email;
    }
  });

  const activeChatMatch = displayedMatches.find((m) => m.id === selectedMatchId) || null;
  const chatMessages = messages.filter((m) => m.matchId === selectedMatchId);

  // Send interactive user message directly as peer-to-peer reply
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChatMatch || isSendingMessage) return;

    const userText = inputMessage.trim();
    setInputMessage("");

    const isDoador = userProfile.role === "doador";
    const senderRole = isDoador ? "pet" : "user";

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      matchId: activeChatMatch.id,
      sender: senderRole,
      text: userText,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);

    // Update last message in Match
    setMatches((prev) =>
      prev.map((m) =>
        m.id === activeChatMatch.id ? { ...m, lastMessage: userText } : m
      )
    );
  };

  // Add new custom pet manually
  const handlePublishPet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPet.name || !newPet.breed || !newPet.bio) {
      alert("Por favor, preencha o nome, raça e descrição do pet!");
      return;
    }

    const created: Pet = {
      id: `custom-pet-${Date.now()}`,
      name: newPet.name,
      type: newPet.type as PetType,
      breed: newPet.breed,
      age: newPet.age || "Filhote",
      gender: newPet.gender as PetGender,
      size: newPet.size as PetSize,
      photo: newPet.photo || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600",
      bio: newPet.bio,
      location: newPet.location || "São Paulo, SP",
      shelterName: newPet.shelterName || userProfile.shelterName || userProfile.name,
      contactEmail: newPet.contactEmail || userProfile.email,
      contactPhone: newPet.contactPhone || userProfile.phone || "(11) 99999-5555"
    };

    setPets((prev) => [created, ...prev]);
    showFlash(`${created.name} foi inserido(a) na lista do Cupido! Comece a deslizar.`);
    
    if (userProfile.role === "doador") {
      setActiveTab("my-listed-pets");
    } else {
      setActiveTab("swipe");
    }
    
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
      location: "São Paulo, SP",
      shelterName: "Abrigo do Luar",
      contactEmail: "adocao@abrigodoluar.org",
      contactPhone: "(11) 99999-9999"
    });
  };

  // Perform virtual adoption simulation
  const handleSimulateAdoption = (match: Match) => {
    // Send confirmation message to the chat
    const confirmMsg: Message = {
      id: `msg-confirm-adopt-final-user-${Date.now()}`,
      matchId: match.id,
      sender: "pet",
      text: `🎉 Adoção Confirmada! O processo de adoção de ${match.pet.name} foi concluído com sucesso! O card do pet foi removido e a adoção foi consolidada com sucesso. Muito obrigado por adotar e dar um lar responsável! ❤️🐾`,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, confirmMsg]);

    // Keep match, but set status to adopted and update last message
    setMatches((prev) =>
      prev.map((m) =>
        m.id === match.id
          ? {
              ...m,
              adoptionStatus: "adotado",
              lastMessage: `Adoção Concluída! ${match.pet.name} foi adotado(a)! 🎉`,
            }
          : m
      )
    );

    // Mark pet as adopted in the state (so it stays in listings but becomes Adopted)
    setPets((prev) =>
      prev.map((p) => (p.id === match.pet.id ? { ...p, isAdopted: true } : p))
    );

    showFlash(`Parabéns! Você confirmou a retirada e adotou ${match.pet.name}! 🎉`, "success");
  };

  const handleUnmatch = (matchId: string) => {
    if (confirm("Deseja realmente desfazer este Match? O petinho ficará triste...")) {
      setMatches((prev) => prev.filter((m) => m.id !== matchId));
      if (selectedMatchId === matchId) {
        setSelectedMatchId(null);
      }
      showFlash("Match desfeito.", "info");
    }
  };

  return (
    <div className="w-full h-screen max-h-screen bg-[#F8F9FB] flex flex-col font-sans text-slate-800 overflow-hidden leading-snug">
      
      {/* Dynamic Flash Alert */}
      {flashMessage && (
        <div className="absolute top-22 left-1/2 -translate-x-1/2 z-50 bg-white border border-rose-100 shadow-xl rounded-2xl px-5 py-3 flex items-center gap-3 animate-bounce">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff4b6e]" />
          <span className="text-xs font-semibold text-slate-700">{flashMessage.text}</span>
        </div>
      )}

      {/* Love Celebration Overlay */}
      <MatchModal
        pet={celebrationPet}
        user={userProfile}
        onClose={() => setCelebrationPet(null)}
        onStartChat={() => {
          if (celebrationPet) {
            const correspondingMatch = matches.find((m) => m.pet.id === celebrationPet.id);
            if (correspondingMatch) {
              handleSelectChat(correspondingMatch.id);
            }
          }
          setCelebrationPet(null);
        }}
      />

      {/* Visit Scheduling Modal */}
      {isSchedulingVisit && activeChatMatch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 pb-2 border-b border-rose-50">
              <span className="text-2xl animate-bounce">📅</span>
              <div>
                <h3 className="text-lg font-black text-slate-800 font-display">
                  {userProfile.role === "doador" ? "Propor Novo Horário" : `Agendar Visita com ${activeChatMatch.pet.name}`}
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
                <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Escolha a Data da Visita</label>
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
                <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Escolha o Horário</label>
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
                <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">Atalhos de Horário Rápido</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const nextSat = new Date();
                      nextSat.setDate(nextSat.getDate() + ((6 - nextSat.getDay() + 7) % 7)); // Next Saturday
                      setTempVisitDate(nextSat.toISOString().split('T')[0]);
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
                      setTempVisitDate(tomorrow.toISOString().split('T')[0]);
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
                  <p>O abrigo <span className="font-bold text-slate-700">{activeChatMatch.pet.shelterName}</span> está localizado em <span className="font-bold text-slate-700">{activeChatMatch.pet.location}</span>. O telefone é {activeChatMatch.pet.contactPhone}.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsSchedulingVisit(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-650 py-3 rounded-xl text-xs font-bold text-center transition cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!tempVisitDate || !tempVisitTime) {
                    alert("Por favor, preencha a data e o horário da visita!");
                    return;
                  }
                  
                  const isDoador = userProfile.role === "doador";
                  const statusToSet = isDoador ? "proposta_doador" : "proposta_adotante";

                  // Save visit scheduling
                  setMatches(prev => prev.map(m => {
                    if (m.id === activeChatMatch.id) {
                      return {
                        ...m,
                        visitDate: tempVisitDate,
                        visitTime: tempVisitTime,
                        visitStatus: statusToSet
                      };
                    }
                    return m;
                  }));

                  // Prepopulate automated message with proposal or new counter-proposal
                  const formattedDate = new Date(tempVisitDate + "T00:00:00").toLocaleDateString('pt-BR');
                  
                  let notificationText = "";
                  if (isDoador) {
                    notificationText = `*O doador propôs uma nova data e horário para a visita:* Nova proposta para o dia **${formattedDate} às ${tempVisitTime}**. Aguardando aceitação do adotante.`;
                  } else {
                    notificationText = `*O adotante propôs o agendamento de uma visita:* Proposta para o dia **${formattedDate} às ${tempVisitTime}**. Aguardando aceitação do abrigo/doador.`;
                  }

                  const systemMsg: Message = {
                    id: `msg-visit-${Date.now()}`,
                    matchId: activeChatMatch.id,
                    sender: isDoador ? "pet" : "user",
                    text: notificationText,
                    timestamp: new Date().toISOString()
                  };

                  setMessages(prev => [...prev, systemMsg]);

                  const flashMessage = isDoador 
                    ? `Nova proposta de visita enviada ao adotante para o dia ${formattedDate} às ${tempVisitTime}!`
                    : `Proposta de visita enviada para o dia ${formattedDate}!`;
                  showFlash(flashMessage, "success");
                  setIsSchedulingVisit(false);
                }}
                className="w-full bg-gradient-to-r from-[#ff4b6e] to-[#ff7e40] text-white py-3 rounded-xl text-xs font-bold font-display shadow-md hover:brightness-105 active:scale-98 transition flex items-center justify-center cursor-pointer"
              >
                Confirmar Agendamento 🐾
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adoption Scheduling and Agreement Modal */}
      {isSchedulingAdoption && activeChatMatch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center gap-3 mb-4 pb-2 border-b border-emerald-50">
              <span className="text-2xl animate-bounce">🏠</span>
              <div>
                <h3 className="text-lg font-black text-slate-800 font-display">
                  {userProfile.role === "doador" ? "Propor Novo Horário de Retirada" : `Termo de Adoção de ${activeChatMatch.pet.name}`}
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
                  <span className="font-bold text-emerald-950 font-display text-[12px]">Termo de Adoção Responsável</span>
                </div>
                <div className="overflow-y-auto max-h-32 pr-1 space-y-2 scrollbar-thin">
                  <p className="font-bold text-emerald-900">Ao prosseguir, você declara e se compromete a:</p>
                  <p className="bg-white/65 p-1 rounded border border-emerald-50">• <strong>Proporcionar bem-estar:</strong> Garantir condições dignas de vida, ofertando ração de qualidade, abrigo seguro protegido e água limpa.</p>
                  <p className="bg-white/65 p-1 rounded border border-emerald-50">• <strong>Zelo sanitário:</strong> Manter a vacinação e vermifugação rigorosamente em dia, prestando socorro veterinário imediato se houver qualquer enfermidade.</p>
                  <p className="bg-white/65 p-1 rounded border border-emerald-50">• <strong>Guarda Definitiva:</strong> Jamais acorrentar o peludinho de forma contínua, abandoná-lo nas ruas, ou repassar sua guarda a terceiros sem prévia autorização e vistoria do abrigo criador.</p>
                  <p className="bg-white/65 p-1 rounded border border-emerald-50">• <strong>Acompanhamento:</strong> Permitir visitas de acompanhamento pós-adoção ou envio de fotos aos voluntários da instituição para comprovar o bem-estar contínuo.</p>
                </div>
                <div className="mt-2 text-[10px] text-emerald-800 font-semibold italic">
                  *Este termo equivale a uma declaração formal de intenção e responsabilidade de posse responsável.
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Escolha a Data para Buscar o Pet</label>
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
                <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Escolha o Horário da Entrega</label>
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
                <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">Sugerir Horários Rápidos</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const nextSat = new Date();
                      nextSat.setDate(nextSat.getDate() + ((6 - nextSat.getDay() + 7) % 7)); // Next Saturday
                      setTempAdoptionDate(nextSat.toISOString().split('T')[0]);
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
                      setTempAdoptionDate(tomorrow.toISOString().split('T')[0]);
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
                onClick={() => setIsSchedulingAdoption(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-650 py-3 rounded-xl text-xs font-bold text-center transition cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!tempAdoptionDate || !tempAdoptionTime) {
                    alert("Por favor, preencha a data e o horário da busca do pet!");
                    return;
                  }
                  
                  const isDoador = userProfile.role === "doador";
                  const statusToSet = isDoador ? "proposta_doador" : "proposta_adotante";

                  // Save adoption scheduling on the active match
                  setMatches(prev => prev.map(m => {
                    if (m.id === activeChatMatch.id) {
                      return {
                        ...m,
                        adoptionDate: tempAdoptionDate,
                        adoptionTime: tempAdoptionTime,
                        adoptionStatus: statusToSet
                      };
                    }
                    return m;
                  }));

                  // Create automated update string
                  const formattedDate = new Date(tempAdoptionDate + "T00:00:00").toLocaleDateString('pt-BR');
                  
                  let notificationText = "";
                  if (isDoador) {
                    notificationText = `*O abrigo/doador propôs uma nova data para busca do pet para adoção:* Nova proposta para o dia **${formattedDate} às ${tempAdoptionTime}**. Aguardando aceitação do adotante.`;
                  } else {
                    notificationText = `*O adotante aceitou os termos e assinou o Termo de Adoção!* 📝 Proposta enviada para buscar o pet no dia **${formattedDate} às ${tempAdoptionTime}**. Aguardando aceitação do abrigo/doador.`;
                  }

                  const systemMsg: Message = {
                    id: `msg-adopt-${Date.now()}`,
                    matchId: activeChatMatch.id,
                    sender: isDoador ? "pet" : "user",
                    text: notificationText,
                    timestamp: new Date().toISOString()
                  };

                  setMessages(prev => [...prev, systemMsg]);

                  const flashMessage = isDoador 
                    ? `Nova proposta de data de retirada de adoção enviada para o dia ${formattedDate} às ${tempAdoptionTime}!`
                    : `Termo assinado e proposta de adoção enviada com sucesso para o dia ${formattedDate}!`;
                  showFlash(flashMessage, "success");
                  setIsSchedulingAdoption(false);
                }}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl text-xs font-bold font-display shadow-md hover:brightness-105 active:scale-98 transition flex items-center justify-center cursor-pointer"
              >
                Assinar e Confirmar 🐾
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Navigation matching Sleek Theme */}
      <header className="h-16 sm:h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-10 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-tr from-[#ff4b6e] to-[#ff7e40] rounded-xl flex items-center justify-center shadow-md animate-pulse shrink-0">
            <svg className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-orange-500 font-display leading-tight">
              PetMatch
            </span>
            <span className="text-[8px] sm:text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none hidden xs:inline">
              Adoção Responsável
            </span>
          </div>
        </div>

        {/* Action Tabs Pills */}
        <div className="flex items-center gap-2 sm:gap-6">
          <div className="hidden md:flex bg-slate-100 p-1.5 rounded-full border border-slate-200/50">
            {userProfile.role === "adotante" ? (
              <>
                <button
                  id="tab-btn-swipe"
                  onClick={() => setActiveTab("swipe")}
                  className={`px-3 sm:px-5 py-1.5 rounded-full text-xs font-semibold transition duration-200 cursor-pointer ${
                    activeTab === "swipe"
                      ? "bg-white text-slate-800 shadow-sm font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Descoberta
                </button>
                <button
                  id="tab-btn-matches"
                  onClick={() => {
                    setActiveTab("matches");
                    if (displayedMatches.length > 0 && !selectedMatchId) {
                      setSelectedMatchId(displayedMatches[0].id);
                    }
                  }}
                  className={`px-3 sm:px-5 py-1.5 rounded-full text-xs font-semibold transition duration-200 relative cursor-pointer ${
                    activeTab === "matches"
                      ? "bg-white text-slate-800 shadow-sm font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Mensagens
                  {displayedMatches.some((m) => (m.unreadCount || 0) > 0) && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white" />
                  )}
                </button>
                <button
                  id="tab-btn-profile"
                  onClick={() => setActiveTab("profile")}
                  className={`px-3 sm:px-5 py-1.5 rounded-full text-xs font-semibold transition duration-200 cursor-pointer ${
                    activeTab === "profile"
                      ? "bg-white text-slate-800 shadow-sm font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Meu Perfil
                </button>
              </>
            ) : (
              <>
                <button
                  id="tab-btn-my-pets"
                  onClick={() => setActiveTab("my-listed-pets")}
                  className={`px-3 sm:px-5 py-1.5 rounded-full text-xs font-semibold transition duration-200 cursor-pointer ${
                    activeTab === "my-listed-pets"
                      ? "bg-white text-slate-800 shadow-sm font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Meus Pets
                </button>
                <button
                  id="tab-btn-add-pet"
                  onClick={() => setActiveTab("add-pet")}
                  className={`px-3 sm:px-5 py-1.5 rounded-full text-xs font-semibold transition duration-200 flex items-center gap-1 cursor-pointer ${
                    activeTab === "add-pet"
                      ? "bg-white text-slate-800 shadow-sm font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <PlusCircle size={13} />
                  <span>Cadastrar Pet</span>
                </button>
                <button
                  id="tab-btn-matches"
                  onClick={() => {
                    setActiveTab("matches");
                    if (displayedMatches.length > 0 && !selectedMatchId) {
                      setSelectedMatchId(displayedMatches[0].id);
                    }
                  }}
                  className={`px-3 sm:px-5 py-1.5 rounded-full text-xs font-semibold transition duration-200 relative cursor-pointer ${
                    activeTab === "matches"
                      ? "bg-white text-slate-800 shadow-sm font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Contatos
                  {displayedMatches.some((m) => (m.unreadCount || 0) > 0) && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white" />
                  )}
                </button>
                <button
                  id="tab-btn-profile"
                  onClick={() => setActiveTab("profile")}
                  className={`px-3 sm:px-5 py-1.5 rounded-full text-xs font-semibold transition duration-200 cursor-pointer ${
                    activeTab === "profile"
                      ? "bg-white text-slate-800 shadow-sm font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Abrigo / Conta
                </button>
              </>
            )}
          </div>

          <button
            id="avatar-btn-profile"
            onClick={() => setActiveTab("profile")}
            className="w-10 h-10 rounded-full border-2 border-rose-100 p-0.5 hover:border-rose-400 transition cursor-pointer"
            title="Ver Perfil"
          >
            <img
              src={userProfile.profilePic}
              alt={userProfile.name}
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>

          <button
            onClick={handleLogout}
            className="p-2 text-zinc-400 hover:text-rose-500 transition cursor-pointer"
            title="Sair / Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Container - Sleek Sidebar layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Recent Matches / active conversations list */}
        <aside className="w-80 bg-white border-r border-slate-100 hidden md:flex flex-col p-6 shrink-0 z-10">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-rose-50">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#ff4b6e] font-display">
              {userProfile.role === "doador" ? "Contatos sobre os Pets" : "Seus Matches Recentes"} ({displayedMatches.length})
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Total</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {displayedMatches.length === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2.5">
                  <Heart size={16} className="text-zinc-400" />
                </div>
                {userProfile.role === "doador" ? (
                  <>
                    <p className="text-xs font-bold text-slate-500">Nenhum adotante ainda</p>
                    <p className="text-[10px] text-slate-400 mt-1">Quando adotantes curtirem seus pets, as conversas aparecerão aqui!</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-bold text-slate-500">Nenhum Match ainda</p>
                    <p className="text-[10px] text-slate-400 mt-1">Deslize para a direita nas fotos dos pets para dar match!</p>
                  </>
                )}
              </div>
            ) : (
              displayedMatches.map((match) => {
                const isActive = selectedMatchId === match.id && activeTab === "matches";
                
                // If logged in as donor, represent the chat with adopter image/name and pet context
                const isDoadorRole = userProfile.role === "doador";
                const displayPhoto = isDoadorRole 
                  ? (match.adotantePic || "https://images.unsplash.com/photo-1537151625747-7ae85e565156?auto=format&fit=crop&q=80&w=150")
                  : match.pet.photo;
                const displayName = isDoadorRole 
                  ? (match.adotanteName || match.adotanteEmail || "Adotante Interessado")
                  : match.pet.name;
                const displaySub = isDoadorRole
                  ? `Pet: ${match.pet.name}`
                  : match.pet.age;

                return (
                  <div
                    key={match.id}
                    id={`match-sidebar-item-${match.id}`}
                    onClick={() => handleSelectChat(match.id)}
                    className={`flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer transition ${
                      isActive 
                        ? "bg-rose-50/70 border border-rose-100" 
                        : "hover:bg-slate-50/80 border border-transparent"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={displayPhoto}
                        alt={displayName}
                        className="w-13 h-13 rounded-xl object-cover border border-slate-100 shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                      {(match.unreadCount || 0) > 0 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">
                          {match.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800 truncate block">
                          {displayName}
                        </span>
                        <span className="text-[9px] text-[#ff4b6e] font-display font-medium">
                          {displaySub}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {match.lastMessage || "Comece a conversar!"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Prompt card promo widget bottom matching Sleek design */}
          <div className="mt-6 p-4 bg-gradient-to-br from-[#ff4b6e] to-[#ff7e40] rounded-3xl text-white shadow-md relative overflow-hidden shrink-0">
            <div className="absolute right-[-15px] bottom-[-15px] opacity-15 rotate-[20deg] text-white">
              <Sparkles size={100} />
            </div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-85 mb-1 flex items-center gap-1">
              <CheckCircle2 size={10} />
              Dica Protetora
            </p>
            <p className="text-xs leading-relaxed font-sans font-medium text-white/95">
              {userProfile.role === "doador" 
                ? "Responda prontamente aos interessados para garantir que os pets encontrem boas famílias com agilidade e amor!" 
                : "Agende uma visita de adaptação no abrigo antes de adotar. O convívio inicial é perfeito para selar a amizade!"}
            </p>
          </div>
        </aside>

        {/* Center: Interactive Main Content */}
        <section className="flex-1 bg-[#F8F9FB] flex flex-col items-center justify-center p-2 xs:p-4 sm:p-8 relative overflow-y-auto">
          
          {/* TAB: Swipe View */}
          {activeTab === "swipe" && (
            <div className="w-full max-w-[440px] h-[480px] xs:h-[520px] md:h-[580px] flex flex-col relative">
              {/* Floating Mobile Filter Trigger Button for Adotante */}
              {userProfile.role === "adotante" && (
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
              {userProfile.role === "doador" ? (
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
                    onSwipe={handleSwipe}
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
                    onClick={resetFilters}
                    className="mt-6 px-6 py-2.5 bg-gradient-to-r from-[#ff4b6e] to-[#ff7e40] text-white rounded-full text-xs font-bold font-display shadow-md hover:brightness-105 active:scale-95 transition cursor-pointer"
                  >
                    Remover Todos os Filtros
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: My Listed Pets (Para Doadores / Abrigos) */}
          {activeTab === "my-listed-pets" && (
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

              {pets.filter(p => p.contactEmail === userProfile.email || p.shelterName === userProfile.shelterName || p.id.startsWith("custom-pet-")).length === 0 ? (
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
                  {pets
                    .filter(p => p.contactEmail === userProfile.email || p.shelterName === userProfile.shelterName || p.id.startsWith("custom-pet-"))
                    .map((pet) => (
                      <div key={pet.id} className="relative bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition duration-200">
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
                              if (window.confirm(`Tem certeza que deseja excluir o perfil e remover o cadastro de ${pet.name}?`)) {
                                setPets(prev => prev.filter(p => p.id !== pet.id));
                                showFlash(`${pet.name} foi removido com sucesso.`);
                              }
                            }}
                            className="absolute top-3 left-3 w-8 h-8 rounded-xl bg-white/95 hover:bg-rose-600 hover:text-white backdrop-blur-md text-rose-500 flex items-center justify-center shadow-md transition duration-200 border border-rose-100 cursor-pointer z-10"
                            title="Excluir cadastro do pet"
                          >
                            <Trash2 size={15} />
                          </button>
                          <div className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold rounded-full text-white ${pet.isAdopted ? "bg-emerald-500" : "bg-orange-500"}`}>
                            {pet.isAdopted ? "Adotado! 🎉" : "Disponível"}
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-sm text-slate-800">{pet.name}</span>
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">{pet.type}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{pet.breed} • {pet.age}</p>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed italic">"{pet.bio}"</p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between gap-2 shrink-0">
                            {!pet.isAdopted && (
                              <button
                                onClick={() => {
                                  // 1. Find matches for this pet
                                  const matchingChats = matches.filter(m => m.pet.id === pet.id);
                                  
                                  // 2. If there are chats, append a confirmation message to each & update match status
                                  if (matchingChats.length > 0) {
                                    const newMsgs = matchingChats.map(m => ({
                                      id: `msg-adopt-conf-${m.id}-${Date.now()}`,
                                      matchId: m.id,
                                      sender: "pet" as const,
                                      text: `🎉 Adoção Confirmada! O processo de adoção de ${pet.name} foi concluído com sucesso pelo doador/abrigo! O amiguinho já está em seu novo lar maravilhoso! Muito obrigado por adotar de forma responsável! ❤️🐾`,
                                      timestamp: new Date().toISOString()
                                    }));
                                    setMessages((prev) => [...prev, ...newMsgs]);

                                    // Update matches status to adopted
                                    setMatches((prev) => prev.map(m => m.pet.id === pet.id ? { ...m, adoptionStatus: "adotado", lastMessage: `Adoção Concluída! ${pet.name} foi adotado(a)! 🎉` } : m));
                                  }

                                  // 3. Keep pet card in list but mark as adopted
                                  setPets((prev) => prev.map(p => p.id === pet.id ? { ...p, isAdopted: true } : p));

                                  // 4. Show success banner
                                  showFlash(`Parabéns! ${pet.name} agora está marcado como adotado e seu card continuará listado para você! Uma mensagem de confirmação foi enviada para o chat do adotante! 🎉`, "success");
                                }}
                                className="flex-1 bg-emerald-50 text-emerald-600 border border-emerald-250 hover:bg-emerald-100/50 py-1.5 px-2 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 size={10} />
                                Marcar Adotado
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (window.confirm(`Tem certeza que deseja excluir o perfil e remover o cadastro de ${pet.name}?`)) {
                                  setPets(prev => prev.filter(p => p.id !== pet.id));
                                  showFlash(`${pet.name} foi removido com sucesso.`);
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
          )}

          {/* TAB: Matches List (Useful for mobile where left sidebar is hidden, or for actual conversation view) */}
          {activeTab === "matches" && (
            <div className="w-full max-w-4xl h-full flex flex-col md:flex-row bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
              
              {/* Mobile match selector (visible only on small devices since sidebar is hidden) */}
              <div className={`w-full md:w-80 border-r border-slate-100 flex flex-col shrink-0 ${selectedMatchId ? "hidden md:flex" : "flex flex-1"} md:max-h-full md:h-full overflow-y-auto p-4 md:hidden`}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff4b6e] mb-3 block">Conversas Ativas</span>
                <div className="flex flex-col gap-3 overflow-y-auto pb-2">
                  {displayedMatches.map((match) => {
                    const isActive = selectedMatchId === match.id;
                    const isDoadorRole = userProfile.role === "doador";
                    const displayPhoto = isDoadorRole 
                      ? (match.adotantePic || "https://images.unsplash.com/photo-1537151625747-7ae85e565156?auto=format&fit=crop&q=80&w=150")
                      : match.pet.photo;
                    const displayName = isDoadorRole 
                      ? (match.adotanteName || match.adotanteEmail || "Adotante Interessado")
                      : match.pet.name;
                    const displaySub = isDoadorRole
                      ? `Pet: ${match.pet.name}`
                      : match.pet.age;

                    return (
                      <div
                        key={match.id}
                        id={`mob-match-${match.id}`}
                        onClick={() => handleSelectChat(match.id)}
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
                      ? (activeChatMatch.adotantePic || "https://images.unsplash.com/photo-1537151625747-7ae85e565156?auto=format&fit=crop&q=80&w=150")
                      : activeChatMatch.pet.photo;
                    const headerName = isDoadorRole 
                      ? (activeChatMatch.adotanteName || activeChatMatch.adotanteEmail || "Adotante Interessado")
                      : activeChatMatch.pet.name;
                    const headerSub = isDoadorRole
                      ? `Interessado(a) em: ${activeChatMatch.pet.name} (${activeChatMatch.pet.breed})`
                      : `${activeChatMatch.pet.breed} • ${activeChatMatch.pet.age}`;

                    return (
                      <div className="h-14.5 bg-white border-b border-slate-100 px-4 sm:px-6 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {/* Back to chats button for mobile only */}
                          <button
                            type="button"
                            onClick={() => setSelectedMatchId(null)}
                            className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-[#ff4b6e] transition cursor-pointer flex items-center justify-center shrink-0"
                            title="Voltar para conversas"
                          >
                            <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
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
                              <span className="font-black text-xs text-slate-800 font-display">
                                {headerName}
                              </span>
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Online" />
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {headerSub}
                            </span>
                          </div>
                        </div>

                        {/* Chat Header Actions */}
                        <div className="flex items-center gap-2">
                          {userProfile.role !== "doador" && (
                            activeChatMatch.visitStatus === "agendada" ? (
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
                            )
                          )}
                          {/* Adoption Flow Actions */}
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
                                onClick={() => handleSimulateAdoption(activeChatMatch)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-3.2 py-1 text-[10px] font-bold tracking-wide transition flex items-center gap-1 cursor-pointer animate-pulse"
                                title="Clique para confirmar que você buscou o pet no abrigo e concluir a adoção!"
                              >
                                <CheckCircle2 size={11} className="text-emerald-100" />
                                Confirmar Retirada! 🏁
                              </button>
                            ) : activeChatMatch.adoptionStatus === "proposta_adotante" ? (
                              <button
                                onClick={() => showFlash("Você já enviou a proposta de adoção! Aguardando o doador aceitar.", "info")}
                                className="bg-indigo-50 border border-indigo-200 text-indigo-850 rounded-full px-3.2 py-1 text-[10px] font-bold tracking-wide transition flex items-center gap-1 cursor-pointer"
                              >
                                <span>🐾 Proposta Enviada</span>
                              </button>
                            ) : activeChatMatch.adoptionStatus === "proposta_doador" ? (
                              <button
                                onClick={() => showFlash("Você recebeu uma contraproposta de agendamento de adoção! Responda abaixo na conversa.", "info")}
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
                          ) : (
                            // Donor role views statuses
                            activeChatMatch.adoptionStatus === "adotado" ? (
                              <span className="bg-teal-50 border border-teal-200 text-teal-850 rounded-full px-3.2 py-1 text-[10px] font-bold tracking-wide">
                                🎉 Adotado!
                              </span>
                            ) : activeChatMatch.adoptionStatus === "agendado" ? (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Você gostaria de confirmar e finalizar a adoção de ${activeChatMatch.pet.name}? Isso removerá o card do pet e enviará a mensagem de confirmação para o chat!`)) {
                                    handleSimulateAdoption(activeChatMatch);
                                  }
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-3.2 py-1 text-[10px] font-bold tracking-wide transition flex items-center gap-1 cursor-pointer animate-pulse shadow-xs"
                                title="Clique para concluir a adoção e remover o card do pet!"
                              >
                                🏁 Concluir Adoção
                              </button>
                            ) : activeChatMatch.adoptionStatus === "proposta_adotante" ? (
                              <button
                                onClick={() => showFlash("Você recebeu uma proposta de adoção responsável! Verifique a caixa amarela de decisão abaixo.", "info")}
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
                            )
                          )}

                          <button
                            id={`btn-chat-unmatch-${activeChatMatch.pet.id}`}
                            onClick={() => {
                              if (userProfile.role === "doador") {
                                if (window.confirm(`Tem certeza de que deseja excuir o perfil e remover permanentemente o cadastro de ${activeChatMatch.pet.name}?`)) {
                                  // 1. Find matches for this pet
                                  const matchingChats = matches.filter(m => m.pet.id === activeChatMatch.pet.id);
                                  
                                  // 2. If there are chats, append a confirmation message to each & update match status
                                  if (matchingChats.length > 0) {
                                    const newMsgs = matchingChats.map(m => ({
                                      id: `msg-adopt-conf-${m.id}-${Date.now()}`,
                                      matchId: m.id,
                                      sender: "pet" as const,
                                      text: `🎉 Cadastro Removido! O amiguinho ${activeChatMatch.pet.name} teve seu perfil removido do sistema pelo abrigo/doador responsável. Agradecemos pelo carinho e interesse! ❤️🐾`,
                                      timestamp: new Date().toISOString()
                                    }));
                                    setMessages((prev) => [...prev, ...newMsgs]);

                                    // Update matches status
                                    setMatches((prev) => prev.map(m => m.pet.id === activeChatMatch.pet.id ? { ...m, lastMessage: `Perfil do pet removido pelo doador` } : m));
                                  }

                                  // 3. Remove pet card from listings
                                  setPets((prev) => prev.filter(p => p.id !== activeChatMatch.pet.id));

                                  // 4. Show success banner
                                  showFlash(`${activeChatMatch.pet.name} foi removido com sucesso de seus cadastros.`, "success");
                                }
                              } else {
                                handleUnmatch(activeChatMatch.id);
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
                    
                    {/* Welcome Notice Alert Info */}
                    {(() => {
                      const isDoadorRole = userProfile.role === "doador";
                      const headerName = isDoadorRole 
                        ? (activeChatMatch.adotanteName || activeChatMatch.adotanteEmail || "Adotante Interessado")
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
                              O adotante <span className="font-bold">{activeChatMatch.adotanteName || activeChatMatch.adotanteEmail || "Interessado"}</span> quer agendar uma visita para conhecer o pet <span className="font-bold">{activeChatMatch.pet.name}</span>.
                            </p>
                            <p className="text-[11.5px] font-extrabold text-[#ff4b6e] mt-1 font-mono">
                              Horário sugerido: {new Date(activeChatMatch.visitDate + "T00:00:00").toLocaleDateString('pt-BR')} às {activeChatMatch.visitTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              // Accept Visit
                              setMatches(prev => prev.map(m => m.id === activeChatMatch.id ? { ...m, visitStatus: "agendada" } : m));
                              
                              // Send text notification
                              const formattedDate = new Date(activeChatMatch.visitDate + "T00:00:00").toLocaleDateString('pt-BR');
                              const textMsg = `*Visita aceita e confirmada pelo Abrigo!* 🐾 Visita agendada para o dia ${formattedDate} às ${activeChatMatch.visitTime}!`;
                              const confirmMsg: Message = {
                                id: `msg-confirm-${Date.now()}`,
                                matchId: activeChatMatch.id,
                                sender: "pet",
                                text: textMsg,
                                timestamp: new Date().toISOString()
                              };
                              setMessages(prev => [...prev, confirmMsg]);
                              showFlash("Visita aceita e agendamento confirmado com sucesso!", "success");
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer grow text-center shadow-xs"
                          >
                            Aceitar Visita ✓
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              // Open change time window for counter-proposal
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
                              Sugerido dia <span className="font-bold">{new Date(activeChatMatch.visitDate + "T00:00:00").toLocaleDateString('pt-BR')}</span> às <span className="font-bold">{activeChatMatch.visitTime}</span>. Aguardando aceitação do adotante {activeChatMatch.adotanteName || ""}.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setMatches(prev => prev.map(m => m.id === activeChatMatch.id ? { ...m, visitStatus: "cancelada" } : m));
                            showFlash("Proposta de reagendamento cancelada.", "info");
                          }}
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
                              O abrigo <span className="font-bold">{activeChatMatch.pet.shelterName}</span> sugeriu uma nova data e horário para a visita do pet <span className="font-bold">{activeChatMatch.pet.name}</span>.
                            </p>
                            <p className="text-[11.5px] font-extrabold text-[#ff4b6e] mt-1 font-mono">
                              Horário sugerido: {new Date(activeChatMatch.visitDate + "T00:00:00").toLocaleDateString('pt-BR')} às {activeChatMatch.visitTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              // Accept counterproposal
                              setMatches(prev => prev.map(m => m.id === activeChatMatch.id ? { ...m, visitStatus: "agendada" } : m));
                              
                              // Send text notification
                              const formattedDate = new Date(activeChatMatch.visitDate + "T00:00:00").toLocaleDateString('pt-BR');
                              const textMsg = `*Visita aceita e confirmada pelo Adotante!* 🐾 Visita agendada para o dia ${formattedDate} às ${activeChatMatch.visitTime}!`;
                              const confirmMsg: Message = {
                                id: `msg-confirm-${Date.now()}`,
                                matchId: activeChatMatch.id,
                                sender: "user",
                                text: textMsg,
                                timestamp: new Date().toISOString()
                              };
                              setMessages(prev => [...prev, confirmMsg]);
                              showFlash("Visita aceita e agendamento confirmado com sucesso!", "success");
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer grow text-center shadow-xs"
                          >
                            Aceitar Novo Horário ✓
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              // Open change time window for another proposal
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
                              Dia <span className="font-bold">{new Date(activeChatMatch.visitDate + "T00:00:00").toLocaleDateString('pt-BR')}</span> às <span className="font-bold">{activeChatMatch.visitTime}</span>. Aguardando aceitação de {activeChatMatch.pet.shelterName}.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setMatches(prev => prev.map(m => m.id === activeChatMatch.id ? { ...m, visitStatus: "cancelada" } : m));
                            showFlash("Proposta de visita cancelada.", "info");
                          }}
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
                              Dia <span className="font-bold">{new Date(activeChatMatch.visitDate + "T00:00:00").toLocaleDateString('pt-BR')}</span> às <span className="font-bold">{activeChatMatch.visitTime}</span> no abrigo <span className="font-bold">{activeChatMatch.pet.shelterName}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setMatches(prev => prev.map(m => m.id === activeChatMatch.id ? { ...m, visitStatus: "cancelada" } : m));
                              showFlash("Visita de adoção desmarcada.", "info");
                            }}
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
                              O adotante <span className="font-bold">{activeChatMatch.adotanteName || activeChatMatch.adotanteEmail || "Interessado"}</span> assinou o Termo de Posse Responsável e quer agendar a busca do amiguinho <span className="font-bold">{activeChatMatch.pet.name}</span>.
                            </p>
                            <p className="text-[11.5px] font-extrabold text-emerald-800 mt-1 font-mono bg-white/50 px-2 py-1 rounded inline-block">
                              Data/Horário de busca sugeridos: {new Date(activeChatMatch.adoptionDate + "T00:00:00").toLocaleDateString('pt-BR')} às {activeChatMatch.adoptionTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              // Accept Adoption
                              setMatches(prev => prev.map(m => m.id === activeChatMatch.id ? { ...m, adoptionStatus: "agendado" } : m));
                              
                              // Send text notification
                              const formattedDate = new Date(activeChatMatch.adoptionDate + "T00:00:00").toLocaleDateString('pt-BR');
                              const textMsg = `*Adoção autorizada pelo Doador/Abrigo!* 🏠🎉 A entrega do pet ${activeChatMatch.pet.name} foi agendada para o dia ${formattedDate} às ${activeChatMatch.adoptionTime}! Traga uma caixa de transporte segura ou coleira adequada para buscá-lo.`;
                              const confirmMsg: Message = {
                                id: `msg-confirm-adopt-${Date.now()}`,
                                matchId: activeChatMatch.id,
                                sender: "pet",
                                text: textMsg,
                                timestamp: new Date().toISOString()
                              };
                              setMessages(prev => [...prev, confirmMsg]);
                              showFlash("Adoção autorizada! Entrega agendada com sucesso.", "success");
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer grow text-center shadow-xs"
                          >
                            Confirmar e Agendar Adoção ✓
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              // Open change time window for counter-proposal for adoption
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
                              Sugerido dia <span className="font-bold">{new Date(activeChatMatch.adoptionDate + "T00:00:00").toLocaleDateString('pt-BR')}</span> às <span className="font-bold">{activeChatMatch.adoptionTime}</span>. Aguardando aceitação do adotante.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setMatches(prev => prev.map(m => m.id === activeChatMatch.id ? { ...m, adoptionStatus: "cancelado" } : m));
                            showFlash("Proposta de alteração de entrega cancelada.", "info");
                          }}
                          className="bg-orange-105 hover:bg-orange-200 text-orange-900 font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer shrink-0"
                        >
                          Cancelar Proposta
                        </button>
                      </div>
                    )}

                    {/* Active Adoption Counter-Proposal received by Adotante */}
                    {userProfile.role === "adotante" && activeChatMatch.adoptionStatus === "proposta_doador" && (
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-250 flex flex-col gap-3 text-xs text-emerald-950 shadow-sm animate-in fade-in duration-200">
                        <div className="flex gap-2.5 items-center">
                          <span className="text-xl">📬</span>
                          <div>
                            <p className="font-bold text-emerald-950">Contraproposta de Recebimento de Pet! 🎉</p>
                            <p className="text-[11px] text-emerald-850 leading-normal font-sans">
                              O abrigo <span className="font-bold">{activeChatMatch.pet.shelterName}</span> sugeriu que você venha buscar no novo horário.
                            </p>
                            <p className="text-[11.5px] font-extrabold text-emerald-900 mt-1 font-mono bg-white/50 px-2 py-1 rounded inline-block">
                              Horário sugerido: {new Date(activeChatMatch.adoptionDate + "T00:00:00").toLocaleDateString('pt-BR')} às {activeChatMatch.adoptionTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              // Accept counterproposal
                              setMatches(prev => prev.map(m => m.id === activeChatMatch.id ? { ...m, adoptionStatus: "agendado" } : m));
                              
                              // Send text notification
                              const formattedDate = new Date(activeChatMatch.adoptionDate + "T00:00:00").toLocaleDateString('pt-BR');
                              const textMsg = `*Data de busca do pet confirmada pelo Adotante!* 🐾 Adoção programada para o dia ${formattedDate} às ${activeChatMatch.adoptionTime}!`;
                              const confirmMsg: Message = {
                                id: `msg-confirm-adopt-${Date.now()}`,
                                matchId: activeChatMatch.id,
                                sender: "user",
                                text: textMsg,
                                timestamp: new Date().toISOString()
                              };
                              setMessages(prev => [...prev, confirmMsg]);
                              showFlash("Data de adoção aceita e agendamento confirmado!", "success");
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer grow text-center shadow-xs"
                          >
                            Aceitar Novo Horário ✓
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              // Open change time window for another proposal
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
                              Dia <span className="font-bold">{new Date(activeChatMatch.adoptionDate + "T00:00:00").toLocaleDateString('pt-BR')}</span> às <span className="font-bold">{activeChatMatch.adoptionTime}</span>. Aguardando aceitação de {activeChatMatch.pet.shelterName}.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setMatches(prev => prev.map(m => m.id === activeChatMatch.id ? { ...m, adoptionStatus: "cancelado" } : m));
                            showFlash("Proposta de adoção cancelada.", "info");
                          }}
                          className="bg-orange-105 hover:bg-orange-200 text-orange-900 font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer shrink-0"
                        >
                          Cancelar Proposta
                        </button>
                      </div>
                    )}

                    {/* Active Adoption Information Alert Banner */}
                    {activeChatMatch.adoptionStatus === "agendado" && (
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-250 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-emerald-950 shadow-sm animate-in fade-in duration-200">
                        <div className="flex gap-2.5 items-center">
                          <span className="text-xl">✨</span>
                          <div>
                            <p className="font-bold text-emerald-950">Adoção Confirmada & Agendada! 🎉</p>
                            <p className="text-[10.5px] text-emerald-800 font-medium font-sans">
                              Data confirmada para buscar o pet: <span className="font-bold">{new Date(activeChatMatch.adoptionDate + "T00:00:00").toLocaleDateString('pt-BR')}</span> às <span className="font-bold">{activeChatMatch.adoptionTime}</span> no abrigo <span className="font-bold">{activeChatMatch.pet.shelterName}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setMatches(prev => prev.map(m => m.id === activeChatMatch.id ? { ...m, adoptionStatus: "cancelado" } : m));
                              showFlash("Adoção/Retirada desmarcada.", "info");
                            }}
                            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer"
                          >
                            Desmarcar Retirada
                          </button>
                        </div>
                      </div>
                    )}

                    {chatMessages.map((msg) => {
                      const isDoadorRole = userProfile.role === "doador";
                      // If I am donor, messages sent by 'pet' are Mine. If adopter, sent by 'user' are Mine.
                      const isMe = isDoadorRole ? msg.sender === "pet" : msg.sender === "user";
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl p-3.5 text-xs ${
                              isMe
                                ? "bg-gradient-to-r from-[#ff4b6e] to-[#ff7e40] text-white shadow-sm rounded-br-none"
                                : "bg-white text-slate-800 border border-slate-100 shadow-xs rounded-bl-none"
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed font-sans">{msg.text}</p>
                            <span className={`text-[8px] block text-right mt-1.5 ${isMe ? "text-white/70" : "text-slate-400"}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {isSendingMessage && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 rounded-2xl rounded-bl-none p-3.5 text-xs flex items-center gap-2 text-slate-500 border border-slate-200">
                          <Loader2 size={13} className="animate-spin text-slate-400" />
                          <span>{activeChatMatch.pet.name} está escrevendo com as patinhas...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input form Footer */}
                  <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
                    <input
                      id="chat-message-input"
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={userProfile.role === "doador" 
                        ? `Responda para ${activeChatMatch.adotanteName || activeChatMatch.adotanteEmail || "adotante"}...` 
                        : `Escreva uma mensagem carinhosa para o ${activeChatMatch.pet.name}...`}
                      disabled={isSendingMessage}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 placeholder:text-slate-400 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400 transition"
                      autoComplete="off"
                    />
                    <button
                      id="chat-send-btn"
                      type="submit"
                      disabled={!inputMessage.trim() || isSendingMessage}
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-r from-[#ff4b6e] to-[#ff7e40] text-white flex items-center justify-center transition focus:outline-rose-400 cursor-pointer ${
                        !inputMessage.trim() || isSendingMessage ? "opacity-60 cursor-not-allowed" : "hover:brightness-105 active:scale-95"
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
          )}

          {/* TAB: Profile View */}
          {activeTab === "profile" && (
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
                  <label className="text-xs font-semibold text-slate-500 block mb-1">URL de foto de perfil (ícone do abrigo ou foto pessoal)</label>
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
                <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl flex gap-3 text-xs text-slate-600 mt-4 leading-relaxed">
                  <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-800">
                      {userProfile.role === "doador" ? "Credencial De Protetor Parcial" : "Preenchimento Automático Gemini"}
                    </span>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      {userProfile.role === "doador" 
                        ? "Por estar logado como Doador, suas alterações são replicadas instantaneamente aos campos de novos pets que cadastrar!" 
                        : "Pronto! O robô de IA agora sabe se você tem quintal e outros amiguinhos. Ele usará essas referências fofas em próximas conversas."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <button
                    id="profile-save-btn"
                    onClick={() => {
                      showFlash("Perfil atualizado e salvo com sucesso!", "success");
                      setActiveTab(userProfile.role === "doador" ? "my-listed-pets" : "swipe");
                    }}
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

                {/* ZONA DE PERIGO: GERENCIAMENTO E EXCLUSÃO DE CONTAS */}
                <div className="mt-8 pt-6 border-t border-rose-100">
                  <h4 className="text-[10px] font-black uppercase text-rose-500 tracking-wider mb-2.5 flex items-center gap-1">
                    <span>⚠️</span> <span>Zona de Perigo / Gerenciar Contas ({Object.keys(registeredUsers).length})</span>
                  </h4>
                  <div className="p-4 bg-rose-50/20 border border-rose-100 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-700">Excluir Minha Conta Atual</p>
                        <p className="text-[10px] text-slate-500 leading-tight">Apaga permanentemente seu cadastro e dados salvos no sistema, realizando logout.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Você tem certeza ABSOLUTA de que deseja EXCLUIR permanentemente a sua conta atual? Esta ação é irreversível e se deslogará imediatamente!")) {
                            const myEmail = userProfile.email.trim().toLowerCase();
                            const newUsers = { ...registeredUsers };
                            delete newUsers[myEmail];
                            setRegisteredUsers(newUsers);
                            handleLogout();
                            showFlash("Sua conta foi excluída com sucesso de nossos registros.", "info");
                          }
                        }}
                        className="bg-rose-100 hover:bg-rose-200 text-rose-700 py-1.5 px-3 rounded-xl text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Trash2 size={11} />
                        Excluir Minha Conta
                      </button>
                    </div>

                    {/* Outras contas do sistema */}
                    <div className="pt-3.5 border-t border-slate-100/80">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">
                        Excluir Outras Contas Cadastradas no App:
                      </p>
                      <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                        {(Object.entries(registeredUsers) as [string, { password?: string; profile: UserProfile }][]).map(([email, info]) => {
                          const isMe = email.toLowerCase() === userProfile.email.toLowerCase();
                          return (
                            <div key={email} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 text-xs hover:border-slate-200 transition">
                              <div className="flex flex-col min-w-0 pr-2">
                                <span className="font-bold text-slate-700 truncate text-[11px]">
                                  {info.profile.name} {isMe && <span className="text-[9px] text-[#ff4b6e] font-normal">(Você)</span>}
                                </span>
                                <span className="text-[9px] text-slate-400 truncate mt-0.5">{email}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                  info.profile.role === "doador" ? "bg-orange-50 text-orange-600 border border-orange-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                                }`}>
                                  {info.profile.role === "doador" ? "Doador" : "Adotante"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Tem certeza de que deseja excluir permanentemente a conta de ${info.profile.name} (${email})?`)) {
                                      const newUsers = { ...registeredUsers };
                                      delete newUsers[email];
                                      setRegisteredUsers(newUsers);
                                      if (isMe) {
                                        handleLogout();
                                        showFlash("Sua conta foi excluída com sucesso de nossos registros.", "info");
                                      } else {
                                        showFlash(`A conta ${email} foi excluída com sucesso!`, "info");
                                      }
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
          )}

          {/* TAB: Add/Register Pet */}
          {activeTab === "add-pet" && (
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
          )}
        </section>

        {/* Right Sidebar: Preferences / Cupid Interactive filters & care advice matching Sleek UI */}
        <aside className="w-80 bg-white border-l border-slate-100 hidden lg:flex flex-col p-6 shrink-0 z-10 overflow-y-auto justify-between">
          <div className="space-y-6">
            <PetFilter
              selectedType={filterType}
              onSelectType={setFilterType}
              selectedGender={filterGender}
              onSelectGender={setFilterGender}
              selectedSize={filterSize}
              onSelectSize={setFilterSize}
              onResetFilters={resetFilters}
            />

            {/* Quick Stats list or recommendations based on current selected breed */}
            <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-200/50">
                <div className="w-6 h-6 rounded-md bg-rose-100 text-[#ff4b6e] flex items-center justify-center">
                  <CheckCircle2 size={13} fill="currentColor" className="text-rose-50" />
                </div>
                <span className="text-xs font-bold text-slate-700 font-display">Pet Seguro</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
                Todos os amigos listados foram vacinados, vermifugados e possuem termo de responsabilidade de abrigo verificado pelo PetMatch.
              </p>
            </div>
          </div>

          {/* User profile recap block info card matching Sleek layout */}
          <div className="mt-6">
            <div className="p-4 bg-[#F8F9FB] rounded-[1.5rem] border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs font-black text-slate-800 font-display">Parceiro Verificado</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                As ONGs cadastradas respondem pelo chat no aplicativo simulando a voz dos pets para incentivar a adoção afetiva e segura.
              </p>
            </div>
          </div>
        </aside>

      </div>

      {/* Bottom Navigation for Mobile Devices */}
      <nav className="md:hidden h-16 bg-white border-t border-slate-100 flex items-center justify-around px-2 shrink-0 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] selection:bg-rose-100">
        {userProfile.role === "adotante" ? (
          <>
            <button
              onClick={() => setActiveTab("swipe")}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === "swipe" ? "text-[#ff4b6e] font-bold" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Sparkles size={18} className={activeTab === "swipe" ? "scale-110 text-[#ff4b6e]" : ""} />
              <span className="text-[9px] font-bold mt-1 font-display">Descoberta</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("matches");
                if (displayedMatches.length > 0 && !selectedMatchId) {
                  setSelectedMatchId(displayedMatches[0].id);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative cursor-pointer ${
                activeTab === "matches" ? "text-[#ff4b6e] font-bold" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <MessageSquare size={18} className={activeTab === "matches" ? "scale-110 text-[#ff4b6e]" : ""} />
              <span className="text-[9px] font-bold mt-1 font-display">Mensagens</span>
              {displayedMatches.some((m) => (m.unreadCount || 0) > 0) && (
                <span className="absolute top-1 right-5 w-2 h-2 bg-rose-500 rounded-full border border-white animate-ping" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === "profile" ? "text-[#ff4b6e] font-bold" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <User size={18} className={activeTab === "profile" ? "scale-110 text-[#ff4b6e]" : ""} />
              <span className="text-[9px] font-bold mt-1 font-display">Perfil</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab("my-listed-pets")}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === "my-listed-pets" ? "text-[#ff4b6e] font-bold" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Home size={18} className={activeTab === "my-listed-pets" ? "scale-110 text-[#ff4b6e]" : ""} />
              <span className="text-[9px] font-bold mt-1 font-display">Meus Pets</span>
            </button>
            <button
              onClick={() => setActiveTab("add-pet")}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === "add-pet" ? "text-[#ff4b6e] font-bold" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <PlusCircle size={18} className={activeTab === "add-pet" ? "scale-110 text-[#ff4b6e]" : ""} />
              <span className="text-[9px] font-bold mt-1 font-display">Cadastrar</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("matches");
                if (displayedMatches.length > 0 && !selectedMatchId) {
                  setSelectedMatchId(displayedMatches[0].id);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative cursor-pointer ${
                activeTab === "matches" ? "text-[#ff4b6e] font-bold" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <MessageSquare size={18} className={activeTab === "matches" ? "scale-110 text-[#ff4b6e]" : ""} />
              <span className="text-[9px] font-bold mt-1 font-display">Contatos</span>
              {displayedMatches.some((m) => (m.unreadCount || 0) > 0) && (
                <span className="absolute top-1 right-4 w-2 h-2 bg-rose-500 rounded-full border border-white animate-ping" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === "profile" ? "text-[#ff4b6e] font-bold" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <User size={18} className={activeTab === "profile" ? "scale-110 text-[#ff4b6e]" : ""} />
              <span className="text-[9px] font-bold mt-1 font-display">Conta</span>
            </button>
          </>
        )}
      </nav>

      {/* Mobile Filters slide-up modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-rose-100 overflow-hidden flex flex-col p-6 max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-rose-50 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <span className="font-extrabold text-sm text-slate-800 font-display">Ajustar Preferências</span>
              </div>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="text-slate-400 hover:text-rose-500 p-1 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 pb-4">
              <PetFilter
                selectedType={filterType}
                onSelectType={setFilterType}
                selectedGender={filterGender}
                onSelectGender={setFilterGender}
                selectedSize={filterSize}
                onSelectSize={setFilterSize}
                onResetFilters={resetFilters}
              />
            </div>
            
            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold text-xs py-3 rounded-xl shadow-md tracking-wider cursor-pointer mt-2 shrink-0 hover:brightness-105 active:scale-98 transition flex items-center justify-center"
            >
              Ver {filteredPets.length} Pets Compatíveis 🐾
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
