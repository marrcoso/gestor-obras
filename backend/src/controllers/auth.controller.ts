import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db, Tenant, User, Subscription, PLAN_LIMITS } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-erp-obras-2026';

export class AuthController {
  public async register(req: Request, res: Response) {
    try {
      const {
        nomeConstrutora,
        nomeUsuario,
        email,
        senha,
        telefoneWhatsapp,
        estadoUf,
        segmentoAtuacao,
        cnpjCpf
      } = req.body;

      if (!nomeConstrutora || !nomeUsuario || !email || !senha) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios (Construtora, Nome, Email e Senha)' });
      }

      if (typeof senha !== 'string' || senha.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'Informe um endereço de e-mail válido' });
      }

      const store = db.getStore();
      const userExists = store.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());

      if (userExists) {
        return res.status(400).json({ error: 'Este e-mail já está cadastrado na plataforma' });
      }

      const tenantId = uuidv4();
      const userId = uuidv4();
      const senhaHash = await bcrypt.hash(senha, 10);
      const now = new Date();
      const nowIso = now.toISOString();
      const trialExpiration = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const newTenant: Tenant = {
        id: tenantId,
        nome_fantasia: nomeConstrutora.trim(),
        email_contato: email.trim().toLowerCase(),
        telefone: telefoneWhatsapp?.trim() || undefined,
        cnpj: cnpjCpf?.trim() || undefined,
        segmento_atuacao: segmentoAtuacao?.trim() || undefined,
        estado_uf: (estadoUf?.trim() || 'SP').toUpperCase(),
        plano: 'STARTER',
        max_obras_ativas: PLAN_LIMITS.STARTER.max_obras_ativas,
        ativo: true,
        created_at: nowIso,
        updated_at: nowIso
      };

      const newUser: User = {
        id: userId,
        tenant_id: tenantId,
        nome: nomeUsuario.trim(),
        email: email.trim().toLowerCase(),
        senha_hash: senhaHash,
        telefone_whatsapp: telefoneWhatsapp?.trim() || undefined,
        perfil: 'ADMIN',
        ativo: true,
        created_at: nowIso,
        updated_at: nowIso
      };

      const newSubscription: Subscription = {
        id: uuidv4(),
        tenant_id: tenantId,
        plano: 'STARTER',
        status: 'TRIAL',
        ciclo: 'MENSAL',
        valor: PLAN_LIMITS.STARTER.preco_mensal,
        data_inicio: nowIso,
        data_expiracao: trialExpiration,
        data_proximo_vencimento: trialExpiration,
        dias_trial_total: 7,
        created_at: nowIso,
        updated_at: nowIso
      };

      store.tenants.push(newTenant);
      store.users.push(newUser);
      store.subscriptions = store.subscriptions || [];
      store.subscriptions.push(newSubscription);

      this.logActivity(
        tenantId,
        userId,
        newUser.nome,
        'CONSTRUTORA_REGISTRADA',
        `Nova construtora cadastrada: ${newTenant.nome_fantasia} (Plano Starter Trial 7 dias)`
      );

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
          tenant_id: newUser.tenant_id,
          telefone_whatsapp: newUser.telefone_whatsapp
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

  private logActivity(tenantId: string, userId: string, userNome: string, acao: string, detalhes: string) {
    const store = db.getStore();
    store.activity_logs = store.activity_logs || [];
    store.activity_logs.unshift({
      id: uuidv4(),
      tenant_id: tenantId,
      user_id: userId,
      user_nome: userNome,
      acao,
      detalhes,
      created_at: new Date().toISOString()
    });
    if (store.activity_logs.length > 200) {
      store.activity_logs = store.activity_logs.slice(0, 200);
    }
  }

  public async updateProfile(req: Request, res: Response) {
    try {
      const { nome, telefone_whatsapp } = req.body;
      const userId = req.user?.userId;
      const tenantId = req.tenantId!;

      if (!nome) {
        return res.status(400).json({ error: 'O nome é obrigatório' });
      }

      const store = db.getStore();
      const user = store.users.find((u) => u.id === userId && u.tenant_id === tenantId);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      user.nome = nome;
      if (telefone_whatsapp !== undefined) {
        user.telefone_whatsapp = telefone_whatsapp;
      }
      user.updated_at = new Date().toISOString();

      this.logActivity(tenantId, user.id, user.nome, 'PERFIL_ATUALIZADO', 'Dados de perfil pessoal atualizados');
      db.saveLocalStore();

      return res.json({
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
        tenant_id: user.tenant_id,
        telefone_whatsapp: user.telefone_whatsapp
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Erro ao atualizar perfil' });
    }
  }

  public async changePassword(req: Request, res: Response) {
    try {
      const { senhaAtual, novaSenha } = req.body;
      const userId = req.user?.userId;
      const tenantId = req.tenantId!;

      if (!senhaAtual || !novaSenha) {
        return res.status(400).json({ error: 'Informe a senha atual e a nova senha' });
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres' });
      }

      const store = db.getStore();
      const user = store.users.find((u) => u.id === userId && u.tenant_id === tenantId);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const isMatch = await bcrypt.compare(senhaAtual, user.senha_hash);
      if (!isMatch) {
        return res.status(400).json({ error: 'A senha atual informada está incorreta' });
      }

      user.senha_hash = await bcrypt.hash(novaSenha, 10);
      user.updated_at = new Date().toISOString();

      this.logActivity(tenantId, user.id, user.nome, 'SENHA_ALTERADA', 'Senha de acesso atualizada com sucesso');
      db.saveLocalStore();

      return res.json({ message: 'Senha alterada com sucesso!' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Erro ao alterar senha' });
    }
  }

  public async updateTenant(req: Request, res: Response) {
    try {
      const { nome_fantasia, razao_social, cnpj, telefone, email_contato } = req.body;
      const tenantId = req.tenantId!;
      const userId = req.user?.userId;

      const store = db.getStore();
      const tenant = store.tenants.find((t) => t.id === tenantId);

      if (!tenant) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }

      if (nome_fantasia) tenant.nome_fantasia = nome_fantasia;
      if (razao_social !== undefined) tenant.razao_social = razao_social;
      if (cnpj !== undefined) tenant.cnpj = cnpj;
      if (telefone !== undefined) tenant.telefone = telefone;
      if (email_contato) tenant.email_contato = email_contato;
      tenant.updated_at = new Date().toISOString();

      const user = store.users.find((u) => u.id === userId);
      this.logActivity(
        tenantId,
        userId || '',
        user?.nome || 'Administrador',
        'EMPRESA_ATUALIZADA',
        `Dados cadastrais da construtora "${tenant.nome_fantasia}" atualizados`
      );

      db.saveLocalStore();
      return res.json(tenant);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Erro ao atualizar dados da empresa' });
    }
  }

  public async createTeamMember(req: Request, res: Response) {
    try {
      const { nome, email, senha, perfil, telefoneWhatsapp } = req.body;
      const tenantId = req.tenantId!;
      const adminId = req.user?.userId;

      if (!nome || !email || !senha || !perfil) {
        return res.status(400).json({ error: 'Dados incompletos para criação de usuário' });
      }

      const store = db.getStore();

      // Verifica limite de usuários do plano
      const sub = (store.subscriptions || []).find((s) => s.tenant_id === tenantId);
      const planConfig = PLAN_LIMITS[sub?.plano || 'STARTER'] || PLAN_LIMITS.STARTER;
      const currentUsersCount = store.users.filter((u) => u.tenant_id === tenantId && u.ativo).length;

      if (currentUsersCount >= planConfig.max_usuarios) {
        return res.status(403).json({
          error: `Você atingiu o limite de ${planConfig.max_usuarios} colaboradores do Plano ${planConfig.nome}. Faça upgrade de plano para adicionar novos membros.`,
          code: 'PLAN_LIMIT_REACHED'
        });
      }

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

      const adminUser = store.users.find((u) => u.id === adminId);
      this.logActivity(
        tenantId,
        adminId || '',
        adminUser?.nome || 'Administrador',
        'MEMBRO_CRIADO',
        `Novo colaborador adicionado: ${nome} (${perfil})`
      );

      db.saveLocalStore();

      return res.status(201).json({
        id: newUser.id,
        nome: newUser.nome,
        email: newUser.email,
        perfil: newUser.perfil,
        telefone_whatsapp: newUser.telefone_whatsapp,
        ativo: newUser.ativo,
        created_at: newUser.created_at
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async updateTeamMemberStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { ativo } = req.body;
      const tenantId = req.tenantId!;
      const adminId = req.user?.userId;

      if (ativo === undefined) {
        return res.status(400).json({ error: 'Campo "ativo" é obrigatório' });
      }

      if (id === adminId) {
        return res.status(400).json({ error: 'Você não pode desativar seu próprio usuário' });
      }

      const store = db.getStore();
      const member = store.users.find((u) => u.id === id && u.tenant_id === tenantId);

      if (!member) {
        return res.status(404).json({ error: 'Colaborador não encontrado' });
      }

      member.ativo = Boolean(ativo);
      member.updated_at = new Date().toISOString();

      const adminUser = store.users.find((u) => u.id === adminId);
      this.logActivity(
        tenantId,
        adminId || '',
        adminUser?.nome || 'Administrador',
        'STATUS_MEMBRO_ALTERADO',
        `Status de ${member.nome} alterado para ${member.ativo ? 'Ativo' : 'Inativo'}`
      );

      db.saveLocalStore();

      return res.json({
        id: member.id,
        nome: member.nome,
        email: member.email,
        perfil: member.perfil,
        ativo: member.ativo
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Erro ao alterar status do colaborador' });
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

  public async getActivityLogs(req: Request, res: Response) {
    const store = db.getStore();
    const logs = (store.activity_logs || [])
      .filter((l) => l.tenant_id === req.tenantId)
      .slice(0, 50);

    return res.json(logs);
  }
}

export const authController = new AuthController();

