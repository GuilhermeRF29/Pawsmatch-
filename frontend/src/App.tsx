import * as React from "react";
import { useState, useEffect } from "react";
import { INITIAL_PETS, INITIAL_USER_PROFILE } from "./data";
import { Pet, Match, Message, UserProfile, ActiveTab, PetType, PetGender, PetSize } from "./types";

// Components
import MatchModal from "./components/MatchModal";
import PetFilter from "./components/PetFilter";
import VisitModal from "./components/VisitModal";
import AdoptionModal from "./components/AdoptionModal";

// Screens
import AuthScreen from "./screens/AuthScreen";
import SwipeScreen from "./screens/SwipeScreen";
import MyPetsScreen from "./screens/MyPetsScreen";
import ChatScreen from "./screens/ChatScreen";
import ProfileScreen from "./screens/ProfileScreen";
import AddPetScreen from "./screens/AddPetScreen";

import {
  Heart,
  MessageSquare,
  User,
  PlusCircle,
  Sparkles,
  CheckCircle2,
  Home,
  LogOut,
} from "lucide-react";

export default function App() {
  // State variables
  const [pets, setPets] = useState<Pet[]>([]);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("paws_user_profile");
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!localStorage.getItem("paws_token");
  });

  const [matches, setMatches] = useState<Match[]>([]);

  const [messages, setMessages] = useState<Message[]>([]);

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

  // Load initial session with JWT validation
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("paws_token");
      if (!token) {
        setIsLoggedIn(false);
        return;
      }
      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUserProfile(data.profile);
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem("paws_token");
          setIsLoggedIn(false);
        }
      } catch (e) {
        console.error("Erro ao verificar sessão JWT:", e);
        const savedProfile = localStorage.getItem("paws_user_profile");
        if (savedProfile) {
          setUserProfile(JSON.parse(savedProfile));
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      }
    };

    checkSession();
  }, []);

  // Fetch pets and matches once logged in, and poll matches list every 4 seconds
  useEffect(() => {
    if (!isLoggedIn) {
      setPets([]);
      setMatches([]);
      setMessages([]);
      return;
    }

    const token = localStorage.getItem("paws_token");
    
    const fetchPetsAndMatches = () => {
      // Fetch pets
      fetch("/api/pets", {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setPets(data);
        })
        .catch(err => console.error("Erro ao buscar pets:", err));

      // Fetch matches
      fetch("/api/matches", {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setMatches(prev => {
              // Only update state if matches contents have actually changed
              if (JSON.stringify(prev) !== JSON.stringify(data)) {
                return data;
              }
              return prev;
            });
          }
        })
        .catch(err => console.error("Erro ao buscar matches:", err));
    };

    fetchPetsAndMatches();

    const interval = setInterval(fetchPetsAndMatches, 4000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Fetch messages for selected match, and poll current chat messages every 3 seconds
  useEffect(() => {
    if (!selectedMatchId || !isLoggedIn) return;
    const token = localStorage.getItem("paws_token");

    const fetchMessages = () => {
      fetch(`/api/matches/${selectedMatchId}/messages`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setMessages(prev => {
              const otherMessages = prev.filter(m => m.matchId !== selectedMatchId);
              const currentMessages = prev.filter(m => m.matchId === selectedMatchId);
              
              // Only update state if messages content has actually changed
              if (JSON.stringify(currentMessages) !== JSON.stringify(data)) {
                return [...otherMessages, ...data];
              }
              return prev;
            });
          }
        })
        .catch(err => console.error("Erro ao carregar mensagens:", err));
    };

    fetchMessages();

    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedMatchId, isLoggedIn]);

  // Persist profile backup
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem("paws_user_profile", JSON.stringify(userProfile));
    }
  }, [userProfile]);

  const showFlash = (text: string, type: "success" | "info" = "success") => {
    setFlashMessage({ text, type });
    setTimeout(() => {
      setFlashMessage(null);
    }, 4000);
  };

  const handleLoginSuccess = (profile: UserProfile, token: string) => {
    setUserProfile(profile);
    localStorage.setItem("paws_user_profile", JSON.stringify(profile));
    localStorage.setItem("paws_token", token);
    setIsLoggedIn(true);
    setActiveTab(profile.role === "doador" ? "my-listed-pets" : "swipe");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("paws_token");
    localStorage.removeItem("paws_user_profile");
    showFlash("Sessão finalizada. Até logo!", "info");
  };

  // Filter logic on current available pets
  const filteredPets = pets.filter((pet) => {
    if (pet.isAdopted) return false;
    const isMatched = matches.some((m) => m.pet.id === pet.id);
    if (isMatched) return false;
    if (filterType !== "Todos" && pet.type !== filterType) return false;
    if (filterGender !== "Todos" && pet.gender !== filterGender) return false;
    if (filterSize !== "Todos" && pet.size !== filterSize) return false;
    return true;
  });

  const currentPet = filteredPets[0] || null;

  const resetFilters = () => {
    setFilterType("Todos");
    setFilterGender("Todos");
    setFilterSize("Todos");
    showFlash("Todos os filtros redefinidos!", "info");
  };

  // Swipe Action
  const handleSwipe = async (direction: "left" | "right" | "super") => {
    if (!currentPet) return;

    const token = localStorage.getItem("paws_token");
    try {
      const res = await fetch("/api/swipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ petId: currentPet.id, action: direction })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.matched && data.match) {
          setMatches((prev) => [data.match, ...prev]);
          if (data.initialMessage) {
            setMessages((prev) => [...prev, data.initialMessage]);
          }
          setCelebrationPet(currentPet);
        } else {
          if (direction === "right" || direction === "super") {
            showFlash(`Você curtiu ${currentPet.name}, mas ele está dormindo agora...`);
          } else {
            showFlash(`${currentPet.name} foi pulado(a). Outros petinhos te esperam!`, "info");
          }
        }
      }
    } catch (e) {
      console.error("Erro ao registrar swipe:", e);
    }

    setPets((prev) => {
      const filtered = prev.filter((p) => p.id !== currentPet.id);
      return filtered;
    });
  };

  const handleSelectChat = (matchId: string) => {
    setSelectedMatchId(matchId);
    setActiveTab("matches");
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, unreadCount: 0 } : m)));
  };

  const displayedMatches = matches.filter((match) => {
    if (userProfile.role === "doador") {
      const matchesMyPet =
        match.pet.contactEmail.toLowerCase() === userProfile.email.toLowerCase() ||
        match.pet.shelterName.toLowerCase() === (userProfile.shelterName || "").toLowerCase() ||
        match.pet.id.startsWith("custom-pet-");
      return matchesMyPet || !match.adotanteEmail;
    } else {
      return !match.adotanteEmail || match.adotanteEmail.toLowerCase() === userProfile.email.toLowerCase();
    }
  });

  const activeChatMatch = displayedMatches.find((m) => m.id === selectedMatchId) || null;

  const handleSendMessage = async (text: string) => {
    if (!selectedMatchId) return;
    const token = localStorage.getItem("paws_token");

    try {
      const res = await fetch(`/api/matches/${selectedMatchId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.messages && Array.isArray(data.messages)) {
          setMessages((prev) => [...prev, ...data.messages]);
          const lastMsgText = data.messages[data.messages.length - 1].text;
          setMatches((prev) =>
            prev.map((m) => (m.id === selectedMatchId ? { ...m, lastMessage: lastMsgText } : m))
          );
        }
      }
    } catch (e) {
      console.error("Erro ao enviar mensagem:", e);
    }
  };

  const handlePublishPet = async (createdPet: Pet) => {
    const token = localStorage.getItem("paws_token");
    try {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(createdPet)
      });
      if (res.ok) {
        const newPet = await res.json();
        setPets((prev) => [newPet, ...prev]);
        showFlash(`${newPet.name} foi inserido(a) na lista do Cupido! Comece a deslizar.`);
        setActiveTab(userProfile.role === "doador" ? "my-listed-pets" : "swipe");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePet = async (petId: string) => {
    const token = localStorage.getItem("paws_token");
    try {
      const res = await fetch(`/api/pets/${petId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setPets((prev) => prev.filter((p) => p.id !== petId));
        showFlash("Pet removido com sucesso.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAsAdopted = async (pet: Pet) => {
    const token = localStorage.getItem("paws_token");
    const matchingChats = matches.filter((m) => m.pet.id === pet.id);
    if (matchingChats.length > 0) {
      const match = matchingChats[0];
      try {
        const res = await fetch(`/api/matches/${match.id}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ adoptionStatus: "adotado" })
        });
        if (res.ok) {
          const data = await res.json();
          setMatches((prev) =>
            prev.map((m) => (m.id === match.id ? { ...m, ...data.match } : m))
          );
          if (data.systemMessage) setMessages((prev) => [...prev, data.systemMessage]);
          setPets((prev) => prev.map((p) => (p.id === pet.id ? { ...p, isAdopted: true } : p)));
          showFlash(`Parabéns! ${pet.name} agora está marcado como adotado! 🎉`, "success");
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleAcceptVisit = async (match: Match) => {
    const token = localStorage.getItem("paws_token");
    try {
      const res = await fetch(`/api/matches/${match.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ visitStatus: "agendada" })
      });
      if (res.ok) {
        const data = await res.json();
        setMatches((prev) => prev.map((m) => (m.id === match.id ? { ...m, ...data.match } : m)));
        if (data.systemMessage) setMessages((prev) => [...prev, data.systemMessage]);
        showFlash("Visita aceita e agendamento confirmado com sucesso!", "success");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelVisit = async (match: Match) => {
    const token = localStorage.getItem("paws_token");
    try {
      const res = await fetch(`/api/matches/${match.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ visitStatus: "cancelada" })
      });
      if (res.ok) {
        const data = await res.json();
        setMatches((prev) => prev.map((m) => (m.id === match.id ? { ...m, ...data.match } : m)));
        if (data.systemMessage) setMessages((prev) => [...prev, data.systemMessage]);
        showFlash("Visita de adoção desmarcada.", "info");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcceptAdoption = async (match: Match) => {
    const token = localStorage.getItem("paws_token");
    try {
      const res = await fetch(`/api/matches/${match.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ adoptionStatus: "agendado" })
      });
      if (res.ok) {
        const data = await res.json();
        setMatches((prev) => prev.map((m) => (m.id === match.id ? { ...m, ...data.match } : m)));
        if (data.systemMessage) setMessages((prev) => [...prev, data.systemMessage]);
        showFlash("Adoção autorizada! Entrega agendada com sucesso.", "success");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelAdoption = async (match: Match) => {
    const token = localStorage.getItem("paws_token");
    try {
      const res = await fetch(`/api/matches/${match.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ adoptionStatus: "cancelada" })
      });
      if (res.ok) {
        const data = await res.json();
        setMatches((prev) => prev.map((m) => (m.id === match.id ? { ...m, ...data.match } : m)));
        if (data.systemMessage) setMessages((prev) => [...prev, data.systemMessage]);
        showFlash("Agendamento de adoção desmarcado.", "info");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePetProfile = async (petId: string) => {
    const token = localStorage.getItem("paws_token");
    try {
      const res = await fetch(`/api/pets/${petId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        // Re-fetch pets and matches
        const petsRes = await fetch("/api/pets", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const petsData = await petsRes.json();
        if (Array.isArray(petsData)) setPets(petsData);

        const matchesRes = await fetch("/api/matches", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const matchesData = await matchesRes.json();
        if (Array.isArray(matchesData)) setMatches(matchesData);

        if (activeChatMatch && activeChatMatch.pet.id === petId) {
          setSelectedMatchId(null);
        }
        showFlash("Cadastro do pet removido com sucesso.", "success");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnmatch = async (matchId: string) => {
    if (window.confirm("Deseja realmente desfazer este Match? O petinho ficará triste...")) {
      const token = localStorage.getItem("paws_token");
      try {
        const res = await fetch(`/api/matches/${matchId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          setMatches((prev) => prev.filter((m) => m.id !== matchId));
          if (selectedMatchId === matchId) {
            setSelectedMatchId(null);
          }
          showFlash("Match desfeito.", "info");
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSimulateAdoption = async (match: Match) => {
    const token = localStorage.getItem("paws_token");
    try {
      const res = await fetch(`/api/matches/${match.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ adoptionStatus: "adotado" })
      });
      if (res.ok) {
        const data = await res.json();
        setMatches((prev) => prev.map((m) => (m.id === match.id ? { ...m, ...data.match } : m)));
        if (data.systemMessage) setMessages((prev) => [...prev, data.systemMessage]);
        setPets((prev) => prev.map((p) => (p.id === match.pet.id ? { ...p, isAdopted: true } : p)));
        showFlash(`Parabéns! Você confirmou a retirada e adotou ${match.pet.name}! 🎉`, "success");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmVisit = async () => {
    if (!tempVisitDate || !tempVisitTime || !selectedMatchId) {
      alert("Por favor, preencha a data e o horário da visita!");
      return;
    }

    const token = localStorage.getItem("paws_token");
    const isDoador = userProfile.role === "doador";
    const statusToSet = isDoador ? "proposta_doador" : "proposta_adotante";

    try {
      const res = await fetch(`/api/matches/${selectedMatchId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          visitStatus: statusToSet,
          visitDate: tempVisitDate,
          visitTime: tempVisitTime
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMatches((prev) =>
          prev.map((m) => (m.id === selectedMatchId ? { ...m, ...data.match } : m))
        );
        if (data.systemMessage) {
          setMessages((prev) => [...prev, data.systemMessage]);
        }
        
        const formattedDate = new Date(tempVisitDate + "T00:00:00").toLocaleDateString("pt-BR");
        const flashMsgText = isDoador
          ? `Nova proposta de visita enviada ao adotante para o dia ${formattedDate} às ${tempVisitTime}!`
          : `Proposta de visita enviada para o dia ${formattedDate}!`;
        showFlash(flashMsgText, "success");
        setIsSchedulingVisit(false);
      }
    } catch (e) {
      console.error("Erro ao propor visita:", e);
    }
  };

  const handleConfirmAdoption = async () => {
    if (!tempAdoptionDate || !tempAdoptionTime || !selectedMatchId) {
      alert("Por favor, preencha a data e o horário da busca do pet!");
      return;
    }

    const token = localStorage.getItem("paws_token");
    const isDoador = userProfile.role === "doador";
    const statusToSet = isDoador ? "proposta_doador" : "proposta_adotante";

    try {
      const res = await fetch(`/api/matches/${selectedMatchId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          adoptionStatus: statusToSet,
          adoptionDate: tempAdoptionDate,
          adoptionTime: tempAdoptionTime
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMatches((prev) =>
          prev.map((m) => (m.id === selectedMatchId ? { ...m, ...data.match } : m))
        );
        if (data.systemMessage) {
          setMessages((prev) => [...prev, data.systemMessage]);
        }
        
        const formattedDate = new Date(tempAdoptionDate + "T00:00:00").toLocaleDateString("pt-BR");
        const flashMsgText = isDoador
          ? `Nova proposta de data de retirada de adoção enviada para o dia ${formattedDate} às ${tempAdoptionTime}!`
          : `Termo assinado e proposta de adoção enviada com sucesso para o dia ${formattedDate}!`;
        showFlash(flashMsgText, "success");
        setIsSchedulingAdoption(false);
      }
    } catch (e) {
      console.error("Erro ao propor adoção:", e);
    }
  };

  if (!isLoggedIn) {
    return (
      <AuthScreen
        onLoginSuccess={handleLoginSuccess}
        showFlash={showFlash}
      />
    );
  }

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
      <VisitModal
        isOpen={isSchedulingVisit}
        activeChatMatch={activeChatMatch}
        userProfile={userProfile}
        tempVisitDate={tempVisitDate}
        setTempVisitDate={setTempVisitDate}
        tempVisitTime={tempVisitTime}
        setTempVisitTime={setTempVisitTime}
        onClose={() => setIsSchedulingVisit(false)}
        onConfirm={handleConfirmVisit}
      />

      {/* Adoption Scheduling Modal */}
      <AdoptionModal
        isOpen={isSchedulingAdoption}
        activeChatMatch={activeChatMatch}
        userProfile={userProfile}
        tempAdoptionDate={tempAdoptionDate}
        setTempAdoptionDate={setTempAdoptionDate}
        tempAdoptionTime={tempAdoptionTime}
        setTempAdoptionTime={setTempAdoptionTime}
        onClose={() => setIsSchedulingAdoption(false)}
        onConfirm={handleConfirmAdoption}
      />

      {/* Top Header Navigation */}
      <header className="h-16 sm:h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-10 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-tr from-[#ff4b6e] to-[#ff7e40] rounded-xl flex items-center justify-center shadow-md animate-pulse shrink-0">
            <svg className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
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
                    activeTab === "swipe" ? "bg-white text-slate-800 shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
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
                    activeTab === "matches" ? "bg-white text-slate-800 shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
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
                    activeTab === "profile" ? "bg-white text-slate-800 shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
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
                    activeTab === "my-listed-pets" ? "bg-white text-slate-800 shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Meus Pets
                </button>
                <button
                  id="tab-btn-add-pet"
                  onClick={() => setActiveTab("add-pet")}
                  className={`px-3 sm:px-5 py-1.5 rounded-full text-xs font-semibold transition duration-200 flex items-center gap-1 cursor-pointer ${
                    activeTab === "add-pet" ? "bg-white text-slate-800 shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
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
                    activeTab === "matches" ? "bg-white text-slate-800 shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
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
                    activeTab === "profile" ? "bg-white text-slate-800 shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
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

          <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-rose-500 transition cursor-pointer" title="Sair / Logout">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Recent Matches */}
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
                const isDoadorRole = userProfile.role === "doador";
                const displayPhoto = isDoadorRole ? match.adotantePic || "https://images.unsplash.com/photo-1537151625747-7ae85e565156?auto=format&fit=crop&q=80&w=150" : match.pet.photo;
                const displayName = isDoadorRole ? match.adotanteName || match.adotanteEmail || "Adotante Interessado" : match.pet.name;
                const displaySub = isDoadorRole ? `Pet: ${match.pet.name}` : match.pet.age;

                return (
                  <div
                    key={match.id}
                    id={`match-sidebar-item-${match.id}`}
                    onClick={() => handleSelectChat(match.id)}
                    className={`flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer transition ${
                      isActive ? "bg-rose-50/70 border border-rose-100" : "hover:bg-slate-50/80 border border-transparent"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img src={displayPhoto} alt={displayName} className="w-13 h-13 rounded-xl object-cover border border-slate-100 shadow-xs" referrerPolicy="no-referrer" />
                      {(match.unreadCount || 0) > 0 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">
                          {match.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800 truncate block">{displayName}</span>
                        <span className="text-[9px] text-[#ff4b6e] font-display font-medium">{displaySub}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{match.lastMessage || "Comece a conversar!"}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

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

        {/* Center: Main Content */}
        <section className="flex-1 bg-[#F8F9FB] flex flex-col items-center justify-center p-2 xs:p-4 sm:p-8 relative overflow-y-auto">
          {activeTab === "swipe" && (
            <SwipeScreen
              userProfile={userProfile}
              filteredPets={filteredPets}
              currentPet={currentPet}
              onSwipe={handleSwipe}
              onResetFilters={resetFilters}
              setIsMobileFiltersOpen={setIsMobileFiltersOpen}
              filterType={filterType}
              filterGender={filterGender}
              filterSize={filterSize}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "my-listed-pets" && (
            <MyPetsScreen
              pets={pets}
              userProfile={userProfile}
              onDeletePet={handleDeletePet}
              onMarkAsAdopted={handleMarkAsAdopted}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "add-pet" && <AddPetScreen userProfile={userProfile} onPublishPet={handlePublishPet} />}

          {activeTab === "profile" && (
            <ProfileScreen
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              handleLogout={handleLogout}
              showFlash={showFlash}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "matches" && (
            <ChatScreen
              displayedMatches={displayedMatches}
              selectedMatchId={selectedMatchId}
              setSelectedMatchId={setSelectedMatchId}
              userProfile={userProfile}
              messages={messages}
              onSendMessage={handleSendMessage}
              onAcceptVisit={handleAcceptVisit}
              onCancelVisit={handleCancelVisit}
              onAcceptAdoption={handleAcceptAdoption}
              onCancelAdoption={handleCancelAdoption}
              onDeletePetProfile={handleDeletePetProfile}
              onUnmatch={handleUnmatch}
              onSimulateAdoption={handleSimulateAdoption}
              setIsSchedulingVisit={setIsSchedulingVisit}
              setIsSchedulingAdoption={setIsSchedulingAdoption}
              setTempVisitDate={setTempVisitDate}
              setTempVisitTime={setTempVisitTime}
              setTempAdoptionDate={setTempAdoptionDate}
              setTempAdoptionTime={setTempAdoptionTime}
              showFlash={showFlash}
            />
          )}
        </section>

        {/* Right Sidebar: Preferences / Cupid Interactive filters */}
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
