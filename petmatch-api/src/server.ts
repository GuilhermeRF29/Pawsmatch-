// src/server.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './middleware/auth';

const app = express();
const prisma = new PrismaClient();

// Middlewares (o limit: '50mb' é crucial para receber imagens Base64)
app.use(cors());
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

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor HTTP rodando com TypeScript na porta ${PORT}`);
});
