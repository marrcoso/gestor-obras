import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db, Tenant, User } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-erp-obras-2026';

export class AuthController {
  public async register(req: Request, res: Response) {
    try {
      const { nomeConstrutora, nomeUsuario, email, senha, telefoneWhatsapp } = req.body;

      if (!nomeConstrutora || !nomeUsuario || !email || !senha) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
      }

      const store = db.getStore();
      const userExists = store.users.some((u) => u.email.toLowerCase() === email.toLowerCase());

      if (userExists) {
        return res.status(400).json({ error: 'Email já cadastrado na plataforma' });
      }

      const tenantId = uuidv4();
      const userId = uuidv4();
      const senhaHash = await bcrypt.hash(senha, 10);
      const now = new Date().toISOString();

      const newTenant: Tenant = {
        id: tenantId,
        nome_fantasia: nomeConstrutora,
        email_contato: email,
        telefone: telefoneWhatsapp,
        plano: 'STARTER',
        max_obras_ativas: 5,
        ativo: true,
        created_at: now,
        updated_at: now
      };

      const newUser: User = {
        id: userId,
        tenant_id: tenantId,
        nome: nomeUsuario,
        email: email.toLowerCase(),
        senha_hash: senhaHash,
        telefone_whatsapp: telefoneWhatsapp,
        perfil: 'ADMIN',
        ativo: true,
        created_at: now,
        updated_at: now
      };

      store.tenants.push(newTenant);
      store.users.push(newUser);
      db.saveLocalStore();

      const token = jwt.sign(
        {
          userId: newUser.id,
          tenantId: newUser.tenant_id,
          email: newUser.email,
          perfil: newUser.perfil,
          nome: newUser.nome
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.status(201).json({
        token,
        user: {
          id: newUser.id,
          nome: newUser.nome,
          email: newUser.email,
          perfil: newUser.perfil,
          tenant_id: newUser.tenant_id
        },
        tenant: newTenant
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Erro ao registrar construtora' });
    }
  }

  public async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      const store = db.getStore();
      const user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.ativo);

      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const isMatch = await bcrypt.compare(senha, user.senha_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const tenant = store.tenants.find((t) => t.id === user.tenant_id);

      const token = jwt.sign(
        {
          userId: user.id,
          tenantId: user.tenant_id,
          email: user.email,
          perfil: user.perfil,
          nome: user.nome
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.json({
        token,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          perfil: user.perfil,
          tenant_id: user.tenant_id,
          telefone_whatsapp: user.telefone_whatsapp
        },
        tenant
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Erro ao efetuar login' });
    }
  }

  public async me(req: Request, res: Response) {
    const store = db.getStore();
    const user = store.users.find((u) => u.id === req.user?.userId);
    const tenant = store.tenants.find((t) => t.id === req.tenantId);

    if (!user || !tenant) {
      return res.status(404).json({ error: 'Usuário ou empresa não encontrados' });
    }

    return res.json({
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
        tenant_id: user.tenant_id,
        telefone_whatsapp: user.telefone_whatsapp
      },
      tenant
    });
  }

  public async createTeamMember(req: Request, res: Response) {
    try {
      const { nome, email, senha, perfil, telefoneWhatsapp } = req.body;
      const tenantId = req.tenantId!;

      if (!nome || !email || !senha || !perfil) {
        return res.status(400).json({ error: 'Dados incompletos para criação de usuário' });
      }

      const store = db.getStore();
      const emailExists = store.users.some(
        (u) => u.tenant_id === tenantId && u.email.toLowerCase() === email.toLowerCase()
      );

      if (emailExists) {
        return res.status(400).json({ error: 'Email já cadastrado para este time' });
      }

      const senhaHash = await bcrypt.hash(senha, 10);
      const newUser: User = {
        id: uuidv4(),
        tenant_id: tenantId,
        nome,
        email: email.toLowerCase(),
        senha_hash: senhaHash,
        telefone_whatsapp: telefoneWhatsapp,
        perfil,
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      store.users.push(newUser);
      db.saveLocalStore();

      return res.status(201).json({
        id: newUser.id,
        nome: newUser.nome,
        email: newUser.email,
        perfil: newUser.perfil,
        telefone_whatsapp: newUser.telefone_whatsapp
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async listTeamMembers(req: Request, res: Response) {
    const store = db.getStore();
    const members = store.users
      .filter((u) => u.tenant_id === req.tenantId)
      .map((u) => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
        perfil: u.perfil,
        telefone_whatsapp: u.telefone_whatsapp,
        ativo: u.ativo,
        created_at: u.created_at
      }));

    return res.json(members);
  }
}

export const authController = new AuthController();
