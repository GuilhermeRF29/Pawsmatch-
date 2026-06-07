import { Pet } from "./types";

export const INITIAL_PETS: Pet[] = [
  {
    id: "pet-1",
    name: "Rex",
    type: "Cachorro",
    breed: "Golden Retriever",
    age: "1 ano",
    gender: "Macho",
    size: "Médio",
    photo: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600",
    bio: "Amo correr atrás de borboletas, roer chinelos velhos (com muito arrependimento depois) e receber carinho na barriguinha! Sou extremamente dócil, brincalhão e estou procurando uma família cheia de amor para dar rabanadas eternas de alegria.",
    location: "São Paulo, SP",
    shelterName: "ONG Patas Unidas",
    contactEmail: "contato@patasunidas.org",
    contactPhone: "(11) 98888-1111"
  },
  {
    id: "pet-2",
    name: "Mel",
    type: "Cachorro",
    breed: "Buldogue Francês",
    age: "2 anos",
    gender: "Fêmea",
    size: "Pequeno",
    photo: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600",
    bio: "Dizem que eu ronco feito um motorzinho quando durmo, mas na verdade estou cantando ópera em canções de amor! Amo passeios curtos, ganhar sachê especial e dormir esparramada no sofá bem coladinha em você.",
    location: "Rio de Janeiro, RJ",
    shelterName: "Abrigo Amigos de Quatro Patas",
    contactEmail: "rio@amigos4patas.com.br",
    contactPhone: "(21) 97777-2222"
  },
  {
    id: "pet-5",
    name: "Pipoca",
    type: "Cachorro",
    breed: "Vira-lata (SDR)",
    age: "6 meses",
    gender: "Fêmea",
    size: "Médio",
    photo: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600",
    bio: "Oi! Sou muito serelepe, risonha e tagarela (gosto de pedir atenção com gritinhos!). Me encontraram abandonada perto de uma padaria e agora estou prontinha para iluminar seus dias com brincadeiras de correr atrás da bolinha.",
    location: "Curitiba, PR",
    shelterName: "Adote um Anjo no PR",
    contactEmail: "contato@adoteumanjopr.org",
    contactPhone: "(41) 95555-4444"
  },
  {
    id: "pet-6",
    name: "Barthô",
    type: "Cachorro",
    breed: "Labrador Retriever",
    age: "4 anos",
    gender: "Macho",
    size: "Grande",
    photo: "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&q=80&w=600",
    bio: "Parceiro número um para trilhas, natação e caminhadas ao ar livre! Se você jogar um galho ou bola de tênis, eu serei o cão mais feliz do mundo. Sou incrivelmente carinhoso, me dou muito bem com crianças e outros pets. Um amor gigante!",
    location: "Porto Alegre, RS",
    shelterName: "Amparo Animal RS",
    contactEmail: "rs@amparoanimal.org",
    contactPhone: "(51) 94444-5555"
  },
  {
    id: "pet-7",
    name: "Simba",
    type: "Gato",
    breed: "Frajola",
    age: "1 ano e meio",
    gender: "Macho",
    size: "Médio",
    photo: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600",
    bio: "O gato mais sociável de todos! Sou campeão em dar cabeçadas de amor nas pernas e empacotar correspondências sentando em cima do papel. Quero uma família que adore conversar comigo, pois respondo a cada miado!",
    location: "São Paulo, SP",
    shelterName: "Adote com Amor",
    contactEmail: "sp@adotecomamor.org",
    contactPhone: "(11) 93333-6666"
  }
];

export const INITIAL_USER_PROFILE = {
  name: "Adotante Inspirador",
  email: "adotante@paws.com",
  role: "adotante" as const,
  location: "São Paulo, SP",
  otherPets: false,
  hasYard: true,
  profilePic: "https://images.unsplash.com/photo-1537151625747-7ae85e565156?auto=format&fit=crop&q=80&w=150"
};
