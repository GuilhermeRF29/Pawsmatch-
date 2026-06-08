// src/server.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './middleware/auth';
import Porte = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middlewares (o limit: '50mb' é crucial para receber imagens Base64)
app.use(cors({
  origin: 'http://localhost:3000'
}));
app.use(express.json({ limit: '50mb' }));

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// ==========================================
// ROTAS DE AUTENTICAÇÃO (/auth)
// ==========================================

// POST /auth/register
app.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const {
      name, email, password, role, location, profilePic,
      shelterName, phone, hasYard, otherPets
    } = req.body;

    // 1. Verifica se o usuário já existe
    const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }

    // 2. Criptografa a senha (Hash)
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(password, saltRounds);

    // 3. Salva no banco de dados mapeando os campos
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome: name,
        email: email,
        senha: senhaHash,
        tipo_perfil: role === 'doador' ? 'doador' : 'adotante',
        cidade_uf: location,
        foto_perfil: profilePic,
        nome_abrigo: shelterName,
        telefone: phone,
        tem_quintal: hasYard,
        outros_pets: otherPets
      }
    });

    // 4. Gera o Token JWT
    const token = jwt.sign(
      { id: novoUsuario.id, role: novoUsuario.tipo_perfil },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retorna sucesso (removendo a senha do objeto de retorno por segurança)
    const { senha: _, ...usuarioSemSenha } = novoUsuario;
    res.status(201).json({ message: 'Usuário criado com sucesso', token, user: usuarioSemSenha });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno ao registrar usuário.' });
  }
});

// POST /auth/login
app.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Busca o usuário pelo e-mail
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    // 2. Compara a senha enviada com o Hash do banco
    const senhaValida = await bcrypt.compare(password, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    // 3. Gera o Token JWT
    const token = jwt.sign(
      { id: usuario.id, role: usuario.tipo_perfil },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { senha: _, ...usuarioSemSenha } = usuario;
    res.status(200).json({ message: 'Login realizado com sucesso', token, user: usuarioSemSenha });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
});

// GET /users/me
app.get('/users/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Pegamos o ID que veio do middleware
    const userId = (req as any).user.id;

    // Busca o usuário no banco
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo_perfil: true,
        telefone: true,
        cidade_uf: true,
        foto_perfil: true,
        nome_abrigo: true,
        tem_quintal: true,
        outros_pets: true,
        data_cadastro: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil.' });
  }
});

// PUT /users/me
app.put('/users/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, location, phone, profilePic, hasYard, otherPets } = req.body;

    // Atualiza o usuário no banco com base no ID extraído do Token
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: userId },
      data: {
        // Usamos campos opcionais para permitir atualização parcial
        nome: name,
        cidade_uf: location,
        telefone: phone,
        foto_perfil: profilePic,
        tem_quintal: hasYard,
        outros_pets: otherPets
      },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo_perfil: true,
        cidade_uf: true,
        telefone: true,
        foto_perfil: true,
        nome_abrigo: true,
        tem_quintal: true,
        outros_pets: true
      }
    });

    res.json({ message: 'Perfil atualizado com sucesso!', user: usuarioAtualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
});

// DELETE /users/me
app.delete('/users/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // O Prisma deletará o usuário e, graças ao "ON DELETE CASCADE" que definimos
    // no banco, todos os registros relacionados (pets, matches, etc.) serão apagados automaticamente.
    await prisma.usuario.delete({
      where: { id: userId }
    });

    res.status(200).json({ message: 'Conta excluída com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir a conta.' });
  }
});

// GET /pets
app.get('/pets', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Busca IDs de pets com os quais o usuário já interagiu (match ou rejeição)
    // Isso é importante para que o mesmo pet não apareça duas vezes no "Deck"
    const interacoes = await prisma.match.findMany({
      where: { usuarioId: userId },
      select: { petId: true }
    });

    const petIdsInteragidos = interacoes.map(i => i.petId);

    // Busca apenas pets que o usuário AINDA NÃO interagiu
    const petsDisponiveis = await prisma.pet.findMany({
      where: {
        NOT: {
          id: { in: petIdsInteragidos },
          donoId: userId // Opcional: O usuário não vê os próprios pets
        }
      }
    });

    res.json(petsDisponiveis);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pets para o deck.' });
  }
});

// GET /pets/me
app.get('/pets/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Busca todos os pets onde o donoId é igual ao ID do usuário autenticado
    const meusPets = await prisma.pet.findMany({
      where: {
        doadorId: userId
      },
      orderBy: {
        data_cadastro: 'desc' // Mostra os mais recentes primeiro
      }
    });

    res.json(meusPets);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar seus pets cadastrados.' });
  }
});

// POST /pets - Cadastrar novo pet
app.post('/pets', authMiddleware, async (req: Request, res: Response) => {
  try {
    const doadorId = (req as any).user.id;
    const { name, type, breed, age, gender, size, photo, bio, location } = req.body;

	console.log("ID do usuário extraído do token:", (req as any).user.id);

    const novoPet = await prisma.pet.create({
      data: {
        nome: name,
        especie: type, // Prisma converterá para o Enum Especie
        raca: breed,
        idade_desc: age,
        sexo: gender,   // Prisma converterá para o Enum Sexo
        porte: size === 'Médio' ? 'Medio' : (size as Porte),
        foto: photo,
        bio: bio,
        localizacao: location,
        doadorId: doadorId
      }
    });

    res.status(201).json(novoPet);
  } catch (error: any) {
    console.error("Erro detalhado:", error); // Isso imprime no SEU terminal
    res.status(500).json({ error: 'Erro ao cadastrar pet.', detalhe: error.message });
  }
});

// PUT /pets/:id - Atualizar pet
app.put('/pets/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doadorId = (req as any).user.id;

    // Verificamos se o pet realmente pertence a este doador antes de atualizar
    const petExistente = await prisma.pet.findFirst({
      where: { id: parseInt(id), doadorId }
    });

    if (!petExistente) return res.status(404).json({ error: 'Pet não encontrado ou sem permissão.' });

    // Atualização
    const petAtualizado = await prisma.pet.update({
      where: { id: parseInt(id) },
      data: req.body // Prisma ignora campos não enviados
    });

    res.json(petAtualizado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar pet.' });
  }
});

// DELETE /pets/:id - Remover pet
app.delete('/pets/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doadorId = (req as any).user.id;

    // A deleção também precisa verificar a propriedade
    const deletado = await prisma.pet.deleteMany({
      where: { id: parseInt(id), doadorId }
    });

    if (deletado.count === 0) return res.status(404).json({ error: 'Pet não encontrado ou sem permissão.' });

    res.status(200).json({ message: 'Pet removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir pet.' });
  }
});

app.post('/swipes', authMiddleware, async (req: Request, res: Response) => {
  try {
    const adotanteId = (req as any).user.id;
    const { petId, action } = req.body;

    // 1. Registra o swipe
    await prisma.swipe.create({
      data: { adotanteId, petId: parseInt(petId), acao: action }
    });

    // 2. Se for "like", verifica se já existe uma relação (aqui simplificado)
    if (action === 'like') {
      // Cria o registro de Match
      const novoMatch = await prisma.match.create({
        data: { adotanteId, petId: parseInt(petId) }
      });
      return res.status(201).json({ match: novoMatch });
    }

    res.status(200).json({ message: 'Swipe registrado.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar swipe.' });
  }
});

app.get('/matches', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role; // Adicione isso no seu middleware de auth

    const matches = await prisma.match.findMany({
      where: userRole === 'adotante'
        ? { adotanteId: userId }
        : { pet: { doadorId: userId } },
      include: { pet: true, adotante: true } // Traz dados do pet e do usuário
    });

    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar matches.' });
  }
});

app.patch('/matches/:id/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { visitStatus, visitDate, visitTime, adoptionStatus, adoptionDate, adoptionTime } = req.body;

    const matchAtualizado = await prisma.match.update({
      where: { id: parseInt(id) },
      data: {
        status_visita: visitStatus,
        data_visita: visitDate ? new Date(visitDate) : undefined,
        hora_visita: visitTime,
        status_adocao: adoptionStatus,
        data_adocao: adoptionDate ? new Date(adoptionDate) : undefined,
        hora_adocao: adoptionTime
      }
    });

    res.json(matchAtualizado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status.' });
  }
});

app.delete('/matches/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await prisma.match.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao desfazer match.' });
  }
});

// GET /matches/:matchId/messages
app.get('/matches/:matchId/messages', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;

    // Opcional: Validar se o usuário logado realmente participa deste match
    // Para simplificar, buscamos as mensagens diretamente
    const mensagens = await prisma.mensagem.findMany({
      where: { matchId: parseInt(matchId) },
      orderBy: { data_envio: 'asc' } // Do mais antigo para o mais novo
    });

    res.json(mensagens);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar histórico de mensagens.' });
  }
});

// POST /matches/:matchId/messages
app.post('/matches/:matchId/messages', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    const { text } = req.body;
    const userId = (req as any).user.id;

    // 1. Identificar quem está enviando (Adotante ou Doador?)
    const match = await prisma.match.findUnique({
      where: { id: parseInt(matchId) },
      select: { adotanteId: true, pet: { select: { doadorId: true } } }
    });

    if (!match) return res.status(404).json({ error: 'Match não encontrado.' });

    // Se o usuário logado for o adotante, remetente é 'user', senão é 'pet'
    const remetente = userId === match.adotanteId ? 'user' : 'pet';

    // 2. Salvar a mensagem
    const novaMensagem = await prisma.mensagem.create({
      data: {
        matchId: parseInt(matchId),
        texto: text,
        remetente: remetente
      }
    });

    // 3. (Opcional) Atualizar o cache de 'ultima_mensagem' no Match para a sidebar
    await prisma.match.update({
      where: { id: parseInt(matchId) },
      data: { ultima_mensagem: text }
    });

    res.status(201).json(novaMensagem);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar mensagem.' });
  }
});

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor HTTP rodando com TypeScript na porta ${PORT}`);
});
