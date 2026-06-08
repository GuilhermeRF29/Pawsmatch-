import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const USERS_DB_PATH = path.join(process.cwd(), "users_db.json");
const PETS_DB_PATH = path.join(process.cwd(), "pets_db.json");
const MATCHES_DB_PATH = path.join(process.cwd(), "matches_db.json");
const MESSAGES_DB_PATH = path.join(process.cwd(), "messages_db.json");
const SWIPES_DB_PATH = path.join(process.cwd(), "swipes_db.json");

const JWT_SECRET = process.env.JWT_SECRET || "paws-secret-cupid-love-2026-key";

// Helper functions for Users
function loadUsers() {
  if (!fs.existsSync(USERS_DB_PATH)) {
    const initialDb = {
      "adotante@paws.com": {
        password: "Password1!",
        profile: {
          name: "Adotante Inspirador",
          email: "adotante@paws.com",
          role: "adotante",
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
          role: "doador",
          location: "Campinas, SP",
          otherPets: false,
          hasYard: true,
          profilePic: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=150",
          shelterName: "ONG Abraço de Quatro Patas",
          phone: "(19) 98765-4321"
        }
      }
    };
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
  try {
    return JSON.parse(fs.readFileSync(USERS_DB_PATH, "utf-8"));
  } catch (e) {
    return {};
  }
}

function saveUsers(users: any) {
  fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2));
}

// Helper functions for Pets
function loadPets() {
  if (!fs.existsSync(PETS_DB_PATH)) {
    // Seed example pets and assign them to the default donor 'abrigo@paws.com'
    const initialPets = [
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
        shelterName: "ONG Abraço de Quatro Patas",
        contactEmail: "abrigo@paws.com",
        contactPhone: "(19) 98765-4321",
        isAdopted: false
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
        shelterName: "ONG Abraço de Quatro Patas",
        contactEmail: "abrigo@paws.com",
        contactPhone: "(19) 98765-4321",
        isAdopted: false
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
        shelterName: "ONG Abraço de Quatro Patas",
        contactEmail: "abrigo@paws.com",
        contactPhone: "(19) 98765-4321",
        isAdopted: false
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
        shelterName: "ONG Abraço de Quatro Patas",
        contactEmail: "abrigo@paws.com",
        contactPhone: "(19) 98765-4321",
        isAdopted: false
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
        shelterName: "ONG Abraço de Quatro Patas",
        contactEmail: "abrigo@paws.com",
        contactPhone: "(19) 98765-4321",
        isAdopted: false
      }
    ];
    fs.writeFileSync(PETS_DB_PATH, JSON.stringify(initialPets, null, 2));
    return initialPets;
  }
  try {
    return JSON.parse(fs.readFileSync(PETS_DB_PATH, "utf-8"));
  } catch (e) {
    return [];
  }
}

function savePets(pets: any) {
  fs.writeFileSync(PETS_DB_PATH, JSON.stringify(pets, null, 2));
}

// Helper functions for Matches
function loadMatches() {
  if (!fs.existsSync(MATCHES_DB_PATH)) {
    fs.writeFileSync(MATCHES_DB_PATH, JSON.stringify([], null, 2));
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(MATCHES_DB_PATH, "utf-8"));
  } catch (e) {
    return [];
  }
}

function saveMatches(matches: any) {
  fs.writeFileSync(MATCHES_DB_PATH, JSON.stringify(matches, null, 2));
}

// Helper functions for Messages
function loadMessages() {
  if (!fs.existsSync(MESSAGES_DB_PATH)) {
    fs.writeFileSync(MESSAGES_DB_PATH, JSON.stringify([], null, 2));
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(MESSAGES_DB_PATH, "utf-8"));
  } catch (e) {
    return [];
  }
}

function saveMessages(messages: any) {
  fs.writeFileSync(MESSAGES_DB_PATH, JSON.stringify(messages, null, 2));
}

// Helper functions for Swipes
function loadSwipes() {
  if (!fs.existsSync(SWIPES_DB_PATH)) {
    fs.writeFileSync(SWIPES_DB_PATH, JSON.stringify([], null, 2));
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(SWIPES_DB_PATH, "utf-8"));
  } catch (e) {
    return [];
  }
}

function saveSwipes(swipes: any) {
  fs.writeFileSync(SWIPES_DB_PATH, JSON.stringify(swipes, null, 2));
}

// Native HS256 JWT Utility functions
function base64url(str: string): string {
  return Buffer.from(str).toString("base64url");
}

function base64urlDecode(str: string): string {
  return Buffer.from(str, "base64url").toString("utf-8");
}

function signJWT(payload: any): string {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyJWT(token: string): any | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");
  if (signature !== expectedSignature) return null;
  try {
    return JSON.parse(base64urlDecode(encodedPayload));
  } catch (e) {
    return null;
  }
}

// Middleware Helper
function getAuthUser(req: express.Request): any | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  return verifyJWT(token);
}

// Gemini AI Persona Generator function
async function generatePetReply(
  petName: string,
  petType: string,
  petBio: string,
  petAge: string,
  userProfile: any,
  conversation: { sender: string; text: string }[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    console.warn("GEMINI_API_KEY is not defined. Using adaptive mock responses.");
    const lastUserMessage = conversation && conversation.length > 0 
      ? conversation[conversation.length - 1].text 
      : "Olá!";
      
    let reply = "";
    const lowerMsg = lastUserMessage.toLowerCase();
    const userName = userProfile?.name || "humano";
    const userLoc = userProfile?.location || "por aí";
    const hasYard = userProfile?.hasYard;
    const otherPets = userProfile?.otherPets;
    
    if (petType === "Gato" || petType === "Gata") {
      if (lowerMsg.includes("oi") || lowerMsg.includes("olá") || lowerMsg.includes("ola") || lowerMsg.includes("tudo bem")) {
        reply = `Miau! Olá, ${userName}! *grita por sachê* Fiquei muito feliz com o nosso match! Que tipo de carinho e aventuras você mais gosta?`;
      } else if (lowerMsg.includes("comida") || lowerMsg.includes("sachê") || lowerMsg.includes("comer") || lowerMsg.includes("sache") || lowerMsg.includes("petisco")) {
        reply = `Prrrr... Falou a palavra mágica! É verdade que você vai me dar sachê de salmão? Eu amo comer e tirar sonecas na sua barriga de tarde!`;
      } else if (lowerMsg.includes("onde") || lowerMsg.includes("mora") || lowerMsg.includes("abrigo") || lowerMsg.includes("visita")) {
        reply = `Miau! Eu moro temporariamente no abrigo de adoção, mas já estou sonhando com ${userLoc}! Vi no seu perfil que você mora lá. Quando você vem me ver de perto? 🥺`;
      } else if (lowerMsg.includes("brincar") || lowerMsg.includes("brinquedo") || lowerMsg.includes("brinca")) {
        reply = `Miau! Adoro caçar bolinhas de papel e aquela luzinha vermelha misteriosa! Se me adotar, teremos altas aventuras à meia-noite corre-corre!`;
      } else if (lowerMsg.includes("quintal") || lowerMsg.includes("apartamento") || lowerMsg.includes("casa")) {
        reply = `Miau! Sabe, ${hasYard ? "como você tem quintal, promete colocar telas de segurança? Eu sou um pouco explorador!" : "apartamentos são perfeitos para mim, amo olhar a janela com tela de proteção!"} Eu adoraria deitar no seu sofá!`;
      } else if (lowerMsg.includes("outro") || lowerMsg.includes("outro pet") || lowerMsg.includes("amigo") || lowerMsg.includes("cachorro")) {
        reply = `Miau! ${otherPets ? "Vi que você já tem outros animaizinhos! Que ótimo, adoro brincar com novos amiguinhos após uma adaptação lenta!" : "Eba, serei o rei ou rainha absoluto do seu lar, com carinho exclusivo só para mim!"}`;
      } else {
        reply = `Miau! Que legal isso! Sabia que eu amo dormir quietinho? Vi no seu perfil que seu lar é perfeito para mim. Vamos marcar de nos conhecer no abrigo neste sábado e assinar o compromisso de amor?`;
      }
    } else {
      if (lowerMsg.includes("oi") || lowerMsg.includes("olá") || lowerMsg.includes("ola") || lowerMsg.includes("tudo bem")) {
        reply = `Au au! Olá, ${userName}! *correndo em círculos e batendo a patinha* Estava roendo meu osso favorito e meu rabo começou a abanar sozinho quando te vi! Tudo ótimo e com você?`;
      } else if (lowerMsg.includes("comida") || lowerMsg.includes("comer") || lowerMsg.includes("petisco") || lowerMsg.includes("biscoito")) {
        reply = `Au au au! Petisco?! Delícia! Prometo fazer cara de de coitado se você me der um pedacinho de biscoito! Fome de leão! 🦴`;
      } else if (lowerMsg.includes("onde") || lowerMsg.includes("mora") || lowerMsg.includes("abrigo") || lowerMsg.includes("visita")) {
        reply = `Au! Eu fico guardadinho no abrigo, olhando o sol e esperando você vir me buscar... Moro em ${userLoc} ou bem pertinho! Quando podemos dar uma volta na praça juntos?`;
      } else if (lowerMsg.includes("brincar") || lowerMsg.includes("brinquedo") || lowerMsg.includes("bolinha") || lowerMsg.includes("brinca") || lowerMsg.includes("passear") || lowerMsg.includes("passeio")) {
        reply = `Au! Passear! Passeio! *pega a coleira com a boca* Eu amo correr e pegar bolinha! Sou campeão mundial de corrida! Vamos ao parque?`;
      } else if (lowerMsg.includes("truque") || lowerMsg.includes("senta") || lowerMsg.includes("deita") || lowerMsg.includes("pata")) {
        reply = `Au! *sento e dou a patinha direita na hora* Viu como eu já sei truques? Sou muito obediente e vou te encher de lambidas de agradecimento!`;
      } else if (lowerMsg.includes("quintal") || lowerMsg.includes("apartamento") || lowerMsg.includes("casa")) {
        reply = `Au au! ${hasYard ? "Eba! Você tem quintal! Vou correr feito um foguete para gastar energia!" : "Eu me adapto super bem em apartamento, contanto que a gente faça passeios diários para eu ver outros cãozinhos!"} O que acha?`;
      } else if (lowerMsg.includes("outro") || lowerMsg.includes("outro pet") || lowerMsg.includes("amigo") || lowerMsg.includes("gato")) {
        reply = `Au! ${otherPets ? "Você já tem outros amiguinhos? Que sensacional, eu amo fazer parte de uma matilha cheia de brincadeiras!" : "Que legal, vou ter seu amor e sua atenção toda para mim! Vou ser seu guardião número um!"}`;
      } else {
        reply = `Au au au! *lambida super carinhosa na sua bochecha* Que incrível conversar com você! Sabe o que eu mais quero nessa vida? Ter um nome de verdade que você escolher e dormir quentinho nos seus pés! Me adota? 🥺`;
      }
    }
    return `[Demonstração] ${reply}`;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemInstruction = `Você é um animalzinho de estimação fofo chamado ${petName}, que é um ${petType} de idade ${petAge}. Você está em um abrigo de adoção e deu Match com o usuário no Tinder de Animais!
    
Sua personalidade, histórico e bio:
"${petBio}"

Perfil do usuário que quer te adotar:
- Nome: ${userProfile?.name || "Usuário do Tinder"}
- Localização: ${userProfile?.location || "não especificada"}
- Tem quintal seguro: ${userProfile?.hasYard ? "Sim, possui quintal" : "Não, mora em apartamento/outro tipo de moradia"}
- Tem outros animais: ${userProfile?.otherPets ? "Sim, já tem outros pets" : "Não tem no momento"}

Diretrizes de resposta:
1. Responda em PORTUGUÊS com extrema fofura, carisma e entusiasmo genuíno.
2. Comporte-se como o animal: cachorros podem usar onomatopeias ocasionais como 'Au au!', '*abana o rabo*', '*lambida*' ou referências a brinquedos; gatos podem ronronar '*prrrr*', miar '*miau*' ou pedir sachês; aves podem piar, etc. Use de forma charmosa, amigável e descontraída em itálico para ações.
3. Demonstre muito interesse em ser adotado! Pergunte sobre a rotina dele, as atividades dele, mostre empolgação e comente espontaneamente detalhes do perfil dele (se tem quintal ou outros animais, faça referências brincalhonas a isso).
4. Mantenha as respostas de chat curtas, ágeis, animadas e interativas, ideais para um aplicativo de mensagens de celular. Evite parágrafos longos desnecessários.
5. Nunca quebre o personagem de um amiguinho pet que fala e está ansioso por um lar protetor. Escreva na primeira pessoa ("eu").`;

    const formattedContents = conversation.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.95,
        maxOutputTokens: 600,
      }
    });

    return response.text || "Au, au! Fiquei com vergonha agora... pode falar de novo?";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return "Miau/Au au! Deu um soninho agora... mas continuo te amando! (Erro ao processar IA)";
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Ensure databases are initialized on startup
  loadUsers();
  loadPets();
  loadMatches();
  loadMessages();
  loadSwipes();

  // JWT Registration Route
  app.post("/api/auth/register", (req, res) => {
    const { email, password, role, name, location, phone, shelterName, hasYard, otherPets, profilePic } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "E-mail, senha e nome são obrigatórios." });
    }
    const users = loadUsers();
    const emailKey = email.trim().toLowerCase();
    if (users[emailKey]) {
      return res.status(400).json({ error: "E-mail já cadastrado." });
    }

    const newProfile = {
      name: name.trim(),
      email: email.trim(),
      role: role || "adotante",
      location: location || "São Paulo, SP",
      otherPets: role === "adotante" ? !!otherPets : false,
      hasYard: role === "adotante" ? !!hasYard : false,
      profilePic: profilePic || "https://images.unsplash.com/photo-1537151625747-7ae85e565156?auto=format&fit=crop&q=80&w=150",
      shelterName: role === "doador" ? shelterName : undefined,
      phone: phone || undefined
    };

    users[emailKey] = { password, profile: newProfile };
    saveUsers(users);

    const token = signJWT(newProfile);
    return res.json({ token, profile: newProfile });
  });

  // JWT Login Route
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }
    const users = loadUsers();
    const emailKey = email.trim().toLowerCase();
    const user = users[emailKey];
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "E-mail ou senha incorretos." });
    }
    const token = signJWT(user.profile);
    return res.json({ token, profile: user.profile });
  });

  // JWT Fetch Active User Route
  app.get("/api/auth/me", (req, res) => {
    const profile = getAuthUser(req);
    if (!profile) {
      return res.status(401).json({ error: "Token inválido ou expirado." });
    }
    return res.json({ profile });
  });

  // JWT Update Active User Route
  app.put("/api/auth/me", (req, res) => {
    const profile = getAuthUser(req);
    if (!profile) {
      return res.status(401).json({ error: "Token inválido ou expirado." });
    }
    const users = loadUsers();
    const emailKey = profile.email.trim().toLowerCase();
    if (!users[emailKey]) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const { name, location, phone, shelterName, hasYard, otherPets, profilePic } = req.body;

    const updatedProfile = {
      ...users[emailKey].profile,
      name: name !== undefined ? name : users[emailKey].profile.name,
      location: location !== undefined ? location : users[emailKey].profile.location,
      phone: phone !== undefined ? phone : users[emailKey].profile.phone,
      shelterName: shelterName !== undefined ? shelterName : users[emailKey].profile.shelterName,
      hasYard: hasYard !== undefined ? !!hasYard : users[emailKey].profile.hasYard,
      otherPets: otherPets !== undefined ? !!otherPets : users[emailKey].profile.otherPets,
      profilePic: profilePic !== undefined ? profilePic : users[emailKey].profile.profilePic,
    };

    users[emailKey].profile = updatedProfile;
    saveUsers(users);

    const token = signJWT(updatedProfile);
    return res.json({ token, profile: updatedProfile });
  });

  // Fetch all accounts route (useful for management)
  app.get("/api/auth/accounts", (req, res) => {
    const users = loadUsers();
    const accounts = Object.values(users).map((u: any) => u.profile);
    return res.json({ accounts });
  });

  // Exclude account route
  app.delete("/api/auth/accounts/:email", (req, res) => {
    const profile = getAuthUser(req);
    if (!profile) {
      return res.status(401).json({ error: "Token inválido ou expirado." });
    }

    const emailToDelete = req.params.email.trim().toLowerCase();
    const users = loadUsers();
    if (!users[emailToDelete]) {
      return res.status(404).json({ error: "Conta não encontrada." });
    }

    delete users[emailToDelete];
    saveUsers(users);

    // Simulated Cascade Delete: Deleting user's pets, swipes, matches, and messages
    let pets = loadPets();
    let matches = loadMatches();
    let messages = loadMessages();
    let swipes = loadSwipes();

    if (profile.role === "doador" && profile.email.toLowerCase() === emailToDelete) {
      // If donor deleted, delete their pets and matches for those pets
      const userPetIds = pets.filter((p: any) => p.contactEmail.toLowerCase() === emailToDelete).map((p: any) => p.id);
      pets = pets.filter((p: any) => p.contactEmail.toLowerCase() !== emailToDelete);
      matches = matches.filter((m: any) => !userPetIds.includes(m.pet.id));
      const matchIds = matches.filter((m: any) => userPetIds.includes(m.pet.id)).map((m: any) => m.id);
      messages = messages.filter((msg: any) => !matchIds.includes(msg.matchId));
    } else if (profile.role === "adotante" && profile.email.toLowerCase() === emailToDelete) {
      // If adopter deleted, delete their swipes and matches
      swipes = swipes.filter((s: any) => s.adotanteEmail.toLowerCase() !== emailToDelete);
      const userMatchIds = matches.filter((m: any) => m.adotanteEmail.toLowerCase() === emailToDelete).map((m: any) => m.id);
      matches = matches.filter((m: any) => m.adotanteEmail.toLowerCase() !== emailToDelete);
      messages = messages.filter((msg: any) => !userMatchIds.includes(msg.matchId));
    }

    savePets(pets);
    saveMatches(matches);
    saveMessages(messages);
    saveSwipes(swipes);

    return res.json({ success: true });
  });

  // ==========================================
  // PETS ENDPOINTS
  // ==========================================

  // GET /api/pets
  app.get("/api/pets", (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Não autorizado." });

    const allPets = loadPets();
    
    if (user.role === "adotante") {
      // Filter out pets that the adopter has already swiped on
      const swipes = loadSwipes();
      const userSwipedPetIds = swipes
        .filter((s: any) => s.adotanteEmail.toLowerCase() === user.email.toLowerCase())
        .map((s: any) => s.petId);

      // Return pets that are not adopted and have not been swiped on
      const availablePets = allPets.filter(
        (p: any) => !p.isAdopted && !userSwipedPetIds.includes(p.id)
      );
      return res.json(availablePets);
    } else {
      // Donors see all active pets
      return res.json(allPets.filter((p: any) => !p.isAdopted));
    }
  });

  // GET /api/pets/me
  app.get("/api/pets/me", (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Não autorizado." });

    const allPets = loadPets();
    const myPets = allPets.filter(
      (p: any) => p.contactEmail.toLowerCase() === user.email.toLowerCase()
    );
    return res.json(myPets);
  });

  // POST /api/pets
  app.post("/api/pets", (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Não autorizado." });

    const { name, type, breed, age, gender, size, photo, bio, location } = req.body;
    if (!name || !type || !photo) {
      return res.status(400).json({ error: "Nome, espécie e foto são obrigatórios." });
    }

    const newPet = {
      id: `custom-pet-${Date.now()}`,
      name,
      type,
      breed: breed || "Vira-lata",
      age: age || "Filhote",
      gender: gender || "Macho",
      size: size || "Médio",
      photo,
      bio: bio || "Procurando um lar amoroso...",
      location: location || user.location || "São Paulo, SP",
      shelterName: user.shelterName || "Doador Particular",
      contactEmail: user.email,
      contactPhone: user.phone || "(11) 99999-9999",
      isAdopted: false
    };

    const pets = loadPets();
    pets.unshift(newPet);
    savePets(pets);

    return res.status(201).json(newPet);
  });

  // PUT /api/pets/:id
  app.put("/api/pets/:id", (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Não autorizado." });

    const pets = loadPets();
    const index = pets.findIndex((p: any) => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Pet não encontrado." });

    // Verify ownership
    if (pets[index].contactEmail.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(403).json({ error: "Sem permissão." });
    }

    pets[index] = { ...pets[index], ...req.body };
    savePets(pets);

    return res.json(pets[index]);
  });

  // DELETE /api/pets/:id
  app.delete("/api/pets/:id", (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Não autorizado." });

    const pets = loadPets();
    const index = pets.findIndex((p: any) => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Pet não encontrado." });

    // Verify ownership
    if (pets[index].contactEmail.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(403).json({ error: "Sem permissão." });
    }

    pets.splice(index, 1);
    savePets(pets);

    // Cascade delete swipes and matches
    let swipes = loadSwipes();
    swipes = swipes.filter((s: any) => s.petId !== req.params.id);
    saveSwipes(swipes);

    let matches = loadMatches();
    const matchIds = matches.filter((m: any) => m.pet.id === req.params.id).map((m: any) => m.id);
    matches = matches.filter((m: any) => m.pet.id !== req.params.id);
    saveMatches(matches);

    let messages = loadMessages();
    messages = messages.filter((msg: any) => !matchIds.includes(msg.matchId));
    saveMessages(messages);

    return res.json({ success: true });
  });

  // ==========================================
  // SWIPES & MATCHES ENDPOINTS
  // ==========================================

  // POST /api/swipes
  app.post("/api/swipes", (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Não autorizado." });

    const { petId, action } = req.body;
    if (!petId || !action) return res.status(400).json({ error: "Dados incompletos." });

    // Save swipe
    const swipes = loadSwipes();
    swipes.push({
      id: `swipe-${Date.now()}`,
      adotanteEmail: user.email,
      petId,
      action,
      timestamp: new Date().toISOString()
    });
    saveSwipes(swipes);

    // If like/super like, establish a match immediately (100% chance for test ease)
    if (action === "like" || action === "right" || action === "super") {
      const pets = loadPets();
      const swipedPet = pets.find((p: any) => p.id === petId);
      if (!swipedPet) return res.status(404).json({ error: "Pet não encontrado." });

      const newMatch = {
        id: `match-${Date.now()}`,
        pet: swipedPet,
        matchedAt: new Date().toISOString(),
        lastMessage: "",
        unreadCount: 1,
        adotanteEmail: user.email,
        adotanteName: user.name,
        adotantePic: user.profilePic,
        visitStatus: "nenhum",
        adoptionStatus: "nenhum"
      };

      // Auto greeting from pet
      const introGreeting = {
        id: `msg-intro-${Date.now()}`,
        matchId: newMatch.id,
        sender: "pet",
        text: `Olá! Nós do abrigo ${swipedPet.shelterName} ficamos extremamente felizes com seu interesse no(a) ${swipedPet.name}. Estamos prontos para conversar sobre o processo de adoção responsável! Sinta-se à vontade para tirar dúvidas por aqui ou sugerir um agendamento de visita. 🐾`,
        timestamp: new Date().toISOString()
      };

      newMatch.lastMessage = introGreeting.text;

      const matches = loadMatches();
      matches.unshift(newMatch);
      saveMatches(matches);

      const messages = loadMessages();
      messages.push(introGreeting);
      saveMessages(messages);

      return res.json({ matched: true, match: newMatch, initialMessage: introGreeting });
    }

    return res.json({ matched: false });
  });

  // GET /api/matches
  app.get("/api/matches", (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Não autorizado." });

    const matches = loadMatches();
    const userMatches = matches.filter((match: any) => {
      if (user.role === "doador") {
        return match.pet.contactEmail.toLowerCase() === user.email.toLowerCase();
      } else {
        return match.adotanteEmail.toLowerCase() === user.email.toLowerCase();
      }
    });

    return res.json(userMatches);
  });

  // PATCH /api/matches/:id/status
  app.patch("/api/matches/:id/status", (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Não autorizado." });

    const matches = loadMatches();
    const index = matches.findIndex((m: any) => m.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Match não encontrado." });

    const currentMatch = matches[index];
    const { visitStatus, visitDate, visitTime, adoptionStatus, adoptionDate, adoptionTime } = req.body;

    // Build update
    const updatedMatch = {
      ...currentMatch,
      visitStatus: visitStatus !== undefined ? visitStatus : currentMatch.visitStatus,
      visitDate: visitDate !== undefined ? visitDate : currentMatch.visitDate,
      visitTime: visitTime !== undefined ? visitTime : currentMatch.visitTime,
      adoptionStatus: adoptionStatus !== undefined ? adoptionStatus : currentMatch.adoptionStatus,
      adoptionDate: adoptionDate !== undefined ? adoptionDate : currentMatch.adoptionDate,
      adoptionTime: adoptionTime !== undefined ? adoptionTime : currentMatch.adoptionTime,
    };

    // Formulate system message depending on changes
    let systemMsgText = "";
    const isDoador = user.role === "doador";

    if (visitStatus !== undefined && visitStatus !== currentMatch.visitStatus) {
      if (visitStatus === "agendada") {
        const formattedDate = new Date(updatedMatch.visitDate + "T00:00:00").toLocaleDateString("pt-BR");
        systemMsgText = `*Visita aceita e confirmada pelo Abrigo!* 🐾 Visita agendada para o dia ${formattedDate} às ${updatedMatch.visitTime}!`;
      } else if (visitStatus === "cancelada") {
        systemMsgText = `*Agendamento de visita desmarcado.*`;
      } else if (visitStatus === "proposta_adotante" || visitStatus === "proposta_doador") {
        const formattedDate = new Date(updatedMatch.visitDate + "T00:00:00").toLocaleDateString("pt-BR");
        systemMsgText = isDoador 
          ? `*O doador propôs uma nova data e horário para a visita:* Nova proposta para o dia **${formattedDate} às ${updatedMatch.visitTime}**. Aguardando aceitação do adotante.`
          : `*O adotante propôs o agendamento de uma visita:* Proposta para o dia **${formattedDate} às ${updatedMatch.visitTime}**. Aguardando aceitação do abrigo/doador.`;
      }
    }

    if (adoptionStatus !== undefined && adoptionStatus !== currentMatch.adoptionStatus) {
      if (adoptionStatus === "agendado") {
        const formattedDate = new Date(updatedMatch.adoptionDate + "T00:00:00").toLocaleDateString("pt-BR");
        systemMsgText = `*Adoção autorizada pelo Doador/Abrigo!* 🏠🎉 A entrega do pet ${currentMatch.pet.name} foi agendada para o dia ${formattedDate} às ${updatedMatch.adoptionTime}! Traga uma caixa de transporte segura ou coleira adequada para buscá-lo.`;
      } else if (adoptionStatus === "cancelada") {
        systemMsgText = `*Agendamento de busca de adoção desmarcado.*`;
      } else if (adoptionStatus === "proposta_adotante" || adoptionStatus === "proposta_doador") {
        const formattedDate = new Date(updatedMatch.adoptionDate + "T00:00:00").toLocaleDateString("pt-BR");
        systemMsgText = isDoador
          ? `*O abrigo/doador propôs uma nova data para busca do pet para adoção:* Nova proposta para o dia **${formattedDate} às ${updatedMatch.adoptionTime}**. Aguardando aceitação do adotante.`
          : `*O adotante aceitou os termos e assinou o Termo de Adoção!* 📝 Proposta enviada para buscar o pet no dia **${formattedDate} às ${updatedMatch.adoptionTime}**. Aguardando aceitação do abrigo/doador.`;
      } else if (adoptionStatus === "adotado") {
        systemMsgText = `🎉 Adoção Confirmada! O processo de adoção de ${currentMatch.pet.name} foi concluído com sucesso! O amiguinho já está em seu novo lar maravilhoso! Muito obrigado por adotar de forma responsável! ❤️🐾`;
        
        // Mark pet as adopted in pets db
        const pets = loadPets();
        const petIdx = pets.findIndex((p: any) => p.id === currentMatch.pet.id);
        if (petIdx !== -1) {
          pets[petIdx].isAdopted = true;
          savePets(pets);
        }
        updatedMatch.pet.isAdopted = true;
      }
    }

    let systemMessage = null;
    if (systemMsgText) {
      systemMessage = {
        id: `system-msg-${Date.now()}`,
        matchId: currentMatch.id,
        sender: isDoador ? "pet" : "user",
        text: systemMsgText,
        timestamp: new Date().toISOString()
      };
      
      const messages = loadMessages();
      messages.push(systemMessage);
      saveMessages(messages);

      updatedMatch.lastMessage = systemMsgText;
    }

    matches[index] = updatedMatch;
    saveMatches(matches);

    return res.json({ match: updatedMatch, systemMessage });
  });

  // DELETE /api/matches/:id
  app.delete("/api/matches/:id", (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Não autorizado." });

    const matches = loadMatches();
    const index = matches.findIndex((m: any) => m.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Match não encontrado." });

    matches.splice(index, 1);
    saveMatches(matches);

    // Delete messages
    let messages = loadMessages();
    messages = messages.filter((msg: any) => msg.matchId !== req.params.id);
    saveMessages(messages);

    return res.status(204).send();
  });

  // ==========================================
  // MESSAGES ENDPOINTS
  // ==========================================

  // GET /api/matches/:matchId/messages
  app.get("/api/matches/:matchId/messages", (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Não autorizado." });

    const messages = loadMessages();
    const matchMessages = messages.filter((msg: any) => msg.matchId === req.params.matchId);
    return res.json(matchMessages);
  });

  // POST /api/matches/:matchId/messages
  app.post("/api/matches/:matchId/messages", async (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Não autorizado." });

    const { text } = req.body;
    const { matchId } = req.params;
    if (!text) return res.status(400).json({ error: "Texto vazio." });

    const matches = loadMatches();
    const matchIndex = matches.findIndex((m: any) => m.id === matchId);
    if (matchIndex === -1) return res.status(404).json({ error: "Match não encontrado." });

    const match = matches[matchIndex];
    const isDoador = user.role === "doador";
    const senderRole = isDoador ? "pet" : "user";

    const userMsg = {
      id: `msg-${Date.now()}`,
      matchId: matchId,
      sender: senderRole,
      text: text,
      timestamp: new Date().toISOString()
    };

    const messages = loadMessages();
    messages.push(userMsg);

    // Update match's last message and make it unread
    match.lastMessage = text;
    if (isDoador) {
      match.unreadCount = 0; // Donor read it
    } else {
      match.unreadCount = (match.unreadCount || 0) + 1;
    }

    const responseMessages = [userMsg];

    // Trigger Gemini reply if the sender is Adotante (talking to the pet)
    if (!isDoador) {
      // Find full chat logs for context
      const chatLogs = messages.filter((m: any) => m.matchId === matchId);
      
      // Call Gemini dynamically
      const petReplyText = await generatePetReply(
        match.pet.name,
        match.pet.type,
        match.pet.bio,
        match.pet.age,
        user,
        chatLogs.map(m => ({ sender: m.sender, text: m.text }))
      );

      const petReplyMsg = {
        id: `msg-reply-${Date.now()}`,
        matchId: matchId,
        sender: "pet",
        text: petReplyText,
        timestamp: new Date().toISOString()
      };

      messages.push(petReplyMsg);
      match.lastMessage = petReplyText;
      match.unreadCount = 0; // AI auto replies, so Adotante sees it immediately
      responseMessages.push(petReplyMsg);
    }

    saveMessages(messages);
    saveMatches(matches);

    return res.status(201).json({ messages: responseMessages });
  });

  // ==========================================
  // LEGACY SIMULATION CHAT
  // ==========================================
  app.post("/api/chat", async (req, res) => {
    try {
      const { petName, petType, petBio, petAge, userProfile, conversation } = req.body;
      const reply = await generatePetReply(petName, petType, petBio, petAge, userProfile, conversation);
      return res.json({ reply });
    } catch (error: any) {
      res.status(500).json({ error: "Erro ao processar conversa.", details: error.message });
    }
  });

  // Serve static assets in production, otherwise use Vite middlewares
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
