import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const USERS_DB_PATH = path.join(process.cwd(), "users_db.json");
const JWT_SECRET = process.env.JWT_SECRET || "paws-secret-cupid-love-2026-key";

// Helper function to load and save users on server database file
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
    const data = fs.readFileSync(USERS_DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

function saveUsers(users: any) {
  fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2));
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Ensure database file is initialized on startup
  loadUsers();

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
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token não fornecido." });
    }
    const token = authHeader.split(" ")[1];
    const profile = verifyJWT(token);
    if (!profile) {
      return res.status(401).json({ error: "Token inválido ou expirado." });
    }
    return res.json({ profile });
  });

  // Fetch all accounts route (useful for management)
  app.get("/api/auth/accounts", (req, res) => {
    const users = loadUsers();
    const accounts = Object.values(users).map((u: any) => u.profile);
    return res.json({ accounts });
  });

  // Exclude account route
  app.delete("/api/auth/accounts/:email", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token não fornecido." });
    }
    const token = authHeader.split(" ")[1];
    const requesterProfile = verifyJWT(token);
    if (!requesterProfile) {
      return res.status(401).json({ error: "Token inválido ou expirado." });
    }

    const emailToDelete = req.params.email.trim().toLowerCase();
    const users = loadUsers();
    if (!users[emailToDelete]) {
      return res.status(404).json({ error: "Conta não encontrada." });
    }

    delete users[emailToDelete];
    saveUsers(users);
    return res.json({ success: true });
  });

  // API Route for Pet Chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { petName, petType, petBio, petAge, userProfile, conversation } = req.body;

      // Handle fallback if API key is not present or is the placeholder
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        console.warn("GEMINI_API_KEY is not defined. Using adaptive mock responses.");
        
        // Return structured playful mockup responses so that testing the app meets a premium standard
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
        } else { // Cachorro ou outros
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
        
        return res.json({ reply: `[Demonstração] ${reply}` });
      }

      // Initialize Gemini Client inside request dynamically
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

      const formattedContents = conversation.map((msg: { sender: string; text: string }) => {
        return {
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        };
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.95,
          maxOutputTokens: 600,
        }
      });

      const reply = response.text || "Au, au! Fiquei com vergonha agora... pode falar de novo?";
      return res.json({ reply });

    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Erro ao processar conversa com o pet.", details: error.message });
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
