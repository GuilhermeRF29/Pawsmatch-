export type PetType = "Cachorro" | "Gato";
export type PetGender = "Macho" | "Fêmea";
export type PetSize = "Pequeno" | "Médio" | "Grande";

export type UserRole = "adotante" | "doador";

export interface Pet {
  id: string;
  name: string;
  type: PetType;
  breed: string;
  age: string;
  gender: PetGender;
  size: PetSize;
  photo: string;
  bio: string;
  location: string;
  shelterName: string;
  contactEmail: string;
  contactPhone: string;
  isAdopted?: boolean;
}

export interface Match {
  id: string;
  pet: Pet;
  matchedAt: string;
  lastMessage?: string;
  unreadCount?: number;
  visitDate?: string;
  visitTime?: string;
  visitStatus?: "agendada" | "cancelada" | "proposta_adotante" | "proposta_doador";
  adoptionDate?: string;
  adoptionTime?: string;
  adoptionStatus?: "agendado" | "cancelado" | "proposta_adotante" | "proposta_doador" | "adotado";
  adotanteEmail?: string;
  adotanteName?: string;
  adotantePic?: string;
}

export interface Message {
  id: string;
  matchId: string;
  sender: "user" | "pet";
  text: string;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  location: string;
  otherPets: boolean;
  hasYard: boolean;
  profilePic: string;
  shelterName?: string; // específico para doador
  phone?: string;
}

export type ActiveTab = "swipe" | "matches" | "profile" | "add-pet" | "my-listed-pets";
