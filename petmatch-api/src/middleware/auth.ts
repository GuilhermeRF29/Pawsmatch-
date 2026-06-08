import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]; // Espera "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    (req as any).user = decoded; // Adiciona o ID do usuário ao objeto da requisição
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido.' });
  }
};
