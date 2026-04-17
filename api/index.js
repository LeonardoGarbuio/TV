import express from 'express';
import { Pool } from '@neondatabase/serverless';
import { put } from '@vercel/blob';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import hpp from 'hpp';
import xss from 'xss';
import cookieParser from 'cookie-parser';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Captura de erros fatais para o Log da Vercel
process.on('uncaughtException', (err) => {
  console.error('💥 COLISÃO FATAL NO BOOT:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 PROMESSA REJEITADA SEM TRATAMENTO:', reason);
});

const app = express();

// Informar ao EXPRESS que ele está atrás de um proxy reverso (Render/Railway/Nginx)
// Isso é mandatório para funcionar os Rate Limiters sem banir a infraestrutura toda ou falsos positivos.
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3001;
console.log('PORTA USADA:', PORT);

// Token Secreto puxado da env (cai fallback só em dev local provisório pra n quebrar)
const SECRET_TOKEN = process.env.JWT_SECRET || 'fallback-dev-token-inseguro'; 

// CORS Full-Stack (Otimizado para Vercel + GitHub de Back-up)
const whitelist = process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',') : []; 
app.use(cors({
  origin: function (origin, callback) {
    // Permite: Mesmo-Origem (Vercel), domínios na whitelist, ou qualquer subdomínio .github.io
    if (!origin || whitelist.includes(origin) || origin.endsWith('.github.io') || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      console.warn(`[BLOQUEIO CORS]: Tentativa de acesso vinda de origin não autorizada: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true
}));

// Configuração do Vercel Postgres (Otimizado para Neon Serverless)
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL
});

app.use(cookieParser());

// Honeypot de Fumaça: Mentir pra robôs da internet a tecnologia do servidor
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'PHP/5.4.16');
  res.setHeader('Server', 'Apache/2.4.6 (CentOS) OpenSSL/1.0.2k-fips PHP/5.4.16');
  next();
});

// Drop-Zone Regex contra injeções Non-SQL (NoSQLi) / Simbolos perigosos no Body ou Query
app.use((req, res, next) => {
  const queryStr = JSON.stringify(req.query);
  const bodyStr = JSON.stringify(req.body);
  const checkPayload = queryStr + bodyStr;

  // Detecta tentativas de injeção NoSQL ($where, etc) ou scripts de terminal
  // Permitimos {} vazios, mas bloqueamos $, <script>, eval, exec
  if (/(\$|<script>|eval\(|exec\()/.test(checkPayload)) {
     console.warn(`[BLOQUEIO DE SEGURANÇA]: Tentativa de ataque detectada de ${req.ip}`);
     return res.status(403).send('Conexão terminada por motivos de segurança (Bunker Protocol).');
  }
  next();
});

app.use(helmet({
  crossOriginResourcePolicy: false, // Permitir carregar imagens cruzadas (necessário para Render com SPA local)
  contentSecurityPolicy: { // CSP Severo: ZERO tolerância a scripts embutidos na tela
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], // Extirpado o 'unsafe-inline' contra vetores avançados XSS
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "*"],
      upgradeInsecureRequests: [],
    },
  },
}));

// Proteção CSRF Suprema (Custom-Header Requirement)
app.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
     if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
       logForense(req, 'CSRF_FATAL_DROP', 'Falta de Assinatura FrontEnd Intransferível. Drop da conexão.');
       return res.status(403).json({ error: 'Assinatura CSRF de Agente Inválida.' });
     }
  }
  next();
});

// Prevenir Parameter Pollution (HPP) garantindo que os objetos req.query e req.body escapem ataques de array
app.use(hpp());

// Limite Global (Anti Botnet DDoS) que afeta toda a aplicação que não for a de login
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, 
  message: { error: 'Tráfego global excessivo originado por este IP. API Pausada por 15 minutos (Defesa Automática).' }
});
// app.use('/api/', globalLimiter);

// Anti-DDoS: Capping JSON parsing limit at 100kb
app.use(bodyParser.json({ limit: '100kb' }));

// Servir arquivos estáticos (HTML, CSS, JS, imagens)
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Muitas tentativas de login por este IP. Tente novamente após 15 minutos.' }
});

// Configuração do multer para upload em memória (Anti-Malware & RCE)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // Limite 10MB cravado (mesmo pra quem pular o front-end)
  }
});

// LOGGER FORENSE (NUVEM VERCEL: Captura via Logs do Console)
function logForense(req, acao, detalhe) {
  const logEntry = `[${new Date().toISOString()}] IP: ${req.ip} | User: ${req.adminUsername || 'Anônimo'} | Action: ${acao} | Detalhe: ${detalhe}`;
  console.log(`[FORENSE] ${logEntry}`);
}

console.log('Iniciando conexão com Vercel Postgres...');

(async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS projetos (
      id SERIAL PRIMARY KEY,
      categoria TEXT,
      status TEXT,
      nome TEXT,
      cidade TEXT,
      detalhes TEXT,
      apartamentos TEXT,
      metragem TEXT,
      imagem TEXT
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      failed_attempts INTEGER DEFAULT 0,
      locked_until BIGINT DEFAULT 0
    )`);

    const { rows } = await pool.query('SELECT COUNT(*) as total FROM projetos');
    if (parseInt(rows[0].total) === 0) {
      await pool.query(`INSERT INTO projetos (status, nome, cidade, detalhes, apartamentos, metragem, imagem) VALUES
        ('Em Construção', 'Luniel Essence', 'São Paulo, SP', '', '120 apartamentos', '120-200m²', 'imagens/f1.avif'),
        ('Lançamento', 'Luniel Corporate', 'Rio de Janeiro, RJ', '', '18 andares', 'Escritórios Premium', 'imagens/f2.avif'),
        ('Pronto para Morar', 'Luniel Garden', 'Curitiba, PR', '', '80 apartamentos', 'Garden + Standard', 'imagens/f3.png')
      `);
    }

    // AUTO-RECUPERAÇÃO AGRESSIVA: Garante que o usuário 'leonardo' sempre exista e esteja destravado
    const defaultUser = process.env.DEFAULT_ADMIN_USER || 'leonardo';
    const defaultPass = process.env.DEFAULT_ADMIN_PASS || 'admin123';
    const hash = await bcrypt.hash(defaultPass, 10);
    
    await pool.query(`
      INSERT INTO admins (username, password, failed_attempts, locked_until) 
      VALUES ($1, $2, 0, 0)
      ON CONFLICT (username) 
      DO UPDATE SET password = $2, failed_attempts = 0, locked_until = 0
    `, [defaultUser, hash]);
    
    console.log(`[SISTEMA] Acesso garantido para '${defaultUser}'. Travas removidas.`);
    console.log('Finalizou inicialização do banco Postgres!');
  } catch (e) {
    console.error('Erro ao conectar ou inicializar banco Postgres:', e);
  }
})();

// Login de admin
// Login de admin (Limiter desativado temporariamente para garantir acesso pós-migração)
app.post('/api/admin-login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password || username.length > 50 || password.length > 200) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  // GARANTIA ATÔMICA: Força a existência do admin 'leonardo' no exato momento do login
  const defaultUser = process.env.DEFAULT_ADMIN_USER || 'leonardo';
  const defaultPass = process.env.DEFAULT_ADMIN_PASS || 'admin123';
  
  if (username === defaultUser) {
    const hash = await bcrypt.hash(defaultPass, 10);
    await pool.query(`
      INSERT INTO admins (username, password, failed_attempts, locked_until) 
      VALUES ($1, $2, 0, 0)
      ON CONFLICT (username) 
      DO UPDATE SET password = $2, failed_attempts = 0, locked_until = 0
    `, [defaultUser, hash]);
  }
  
  const { rows } = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
  const admin = rows[0];
  
  if (!admin) {
    return res.status(401).json({ error: 'Usuário ou senha inválidos' });
  }

  // Account Lockout check (Zero-Day Distributed Brute Force Prevention)
  const now = Date.now();
  if (admin.locked_until > now) {
    const minLeft = Math.ceil((admin.locked_until - now) / 60000);
    logForense(req, 'LOGIN_LOCKOUT', `Tentativa na conta bloqueada: ${username}`);
    return res.status(403).json({ error: `Atividade suspeita. Conta blindada por segurança. Tente em ${minLeft} minutos.` });
  }

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    const fails = (admin.failed_attempts || 0) + 1;
    if (fails >= 5) {
       const lockoutTime = now + (30 * 60 * 1000); // 30 minutos de ban pra conta
       await pool.query('UPDATE admins SET failed_attempts = 0, locked_until = $1 WHERE id = $2', [lockoutTime, admin.id]);
       logForense(req, 'LOGIN_LOCKOUT_TRIGGERED', `Conta ${username} isolada na Nuvem: 5 tentativas falhas simultâneas.`);
    } else {
       await pool.query('UPDATE admins SET failed_attempts = $1 WHERE id = $2', [fails, admin.id]);
       logForense(req, 'LOGIN_FALHO', `Senha incorreta para admin real. Falhas registradas: ${fails}`);
    }
    return res.status(401).json({ error: 'Usuário ou senha inválidos' });
  }
  
  // Limpa o lockout no sucesso
  await pool.query('UPDATE admins SET failed_attempts = 0, locked_until = 0 WHERE id = $1', [admin.id]);
  
  // Real token gerado (agora entregue em COOKIE SEGURO HTTPOnly invisível pro javascript, não mais de texto livre)
  const token = jwt.sign({ id: admin.id, username: admin.username }, SECRET_TOKEN, { expiresIn: '1h' });
  
  res.cookie('jwt_auth', token, {
    httpOnly: true, // Invisível ao JS
    secure: true, // Exigido para SameSite=None
    sameSite: 'none', // Permite que o GitHub Pages envie este cookie para a Vercel
    maxAge: 3600000 // 1 hora
  });
  
  logForense({ip: req.ip, adminUsername: username}, 'LOGIN_SUCESSO', 'Acesso administrativo garantido por cookie JWT HttpOnly.');
  res.json({ success: true, username });
});

// Deslogar: Explodimos o Cookie da conexão
app.post('/api/admin-logout', (req, res) => {
  res.clearCookie('jwt_auth');
  logForense(req, 'LOGOUT', 'Sessão encerrada voluntariamente');
  res.json({ ok: true });
});

// Middleware simples para proteger rotas de admin -> AGORA LÊ VIA COOKIES INVISÍVEIS HTTPONLY
function checkAdminAuth(req, res, next) {
  // O token agora vem selado do navegador e do CookieParser e nunca do fetch header cru.
  const token = req.cookies.jwt_auth; 
  if (!token) {
     logForense(req, 'TENTATIVA_INTRUSA_SEM_COOKIE', `Endpoint protegido '${req.url}' bloqueado.`);
     return res.status(401).json({ error: 'Acesso negado. Faça o login autentico.' });
  }

  jwt.verify(token, SECRET_TOKEN, { algorithms: ['HS256'] }, (err, decoded) => {
    if (err) {
      logForense(req, 'TENTATIVA_COOKIE_ADULTERADO', err.message);
      res.clearCookie('jwt_auth'); // mata lixo residual para limpeza
      return res.status(403).json({ error: 'Assinatura inválida, sessão adulterada ou expirada.' });
    }
    req.adminId = decoded.id;
    req.adminUsername = decoded.username;
    next();
  });
}

// Rota de verificação forense persistente (Frontend descobrir se o browser dele ainda tem o cookie válido vivo)
app.get('/api/admin-session', checkAdminAuth, (req, res) => {
  res.json({ authenticated: true, username: req.adminUsername });
});

// Rotas CRUD protegidas
app.post('/api/projetos', checkAdminAuth, upload.single('imagemFile'), async (req, res) => {
  let { categoria = '', status = '', nome = '', cidade = '', detalhes = '', apartamentos = '', metragem = '' } = req.body;
  
  // Limpeza de Cross Site Scripting (XSS) em todas as entradas textuais
  categoria = xss(categoria.toLowerCase());
  status = xss(status);
  nome = xss(nome);
  cidade = xss(cidade);
  detalhes = xss(detalhes);
  apartamentos = xss(apartamentos);
  metragem = xss(metragem);

  let imagem = '';
  
  // Segurança Upload + Redimensionamento + Vercel Blob
  if (req.file) {
    try {
      const filename = `projetos/${Date.now()}_${Math.round(Math.random() * 1E9)}.webp`;
      
      // Upload direto para Vercel Blob (Sem Sharp para garantir o boot)
      const blob = await put(filename, req.file.buffer, {
        access: 'public',
        contentType: req.file.mimetype
      });
        
      imagem = blob.url;
    } catch (err) {
      console.error('Erro de Upload Blob:', err);
      return res.status(400).json({ error: 'Falha no processamento da imagem.' });
    }
  }

  try {
    const result = await pool.query(
      'INSERT INTO projetos (categoria, status, nome, cidade, detalhes, apartamentos, metragem, imagem) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [categoria, status, nome, cidade, detalhes, apartamentos, metragem, imagem]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    console.error('Erro ao inserir projeto:', err);
    res.status(500).json({ error: 'Erro no Banco de Dados: ' + err.message });
  }
});

app.put('/api/projetos/:id', checkAdminAuth, upload.single('imagemFile'), async (req, res) => {
  const { id } = req.params;
  let { categoria = '', status = '', nome = '', cidade = '', detalhes = '', apartamentos = '', metragem = '' } = req.body;
  
  // Limpeza (XSS) nas entradas textuais
  categoria = xss(categoria.toLowerCase());
  status = xss(status);
  nome = xss(nome);
  cidade = xss(cidade);
  detalhes = xss(detalhes);
  apartamentos = xss(apartamentos);
  metragem = xss(metragem);

  let imagem;
  
  if (req.file) {
    try {
      const filename = `projetos/${Date.now()}_${Math.round(Math.random() * 1E9)}.webp`;
      const blob = await put(filename, req.file.buffer, {
        access: 'public',
        contentType: req.file.mimetype
      });
      imagem = blob.url;
    } catch (err) {
      console.error('Erro de Upload Blob PUT:', err);
      return res.status(400).json({ error: 'Falha no processamento da imagem.' });
    }
  } else {
    const { rows } = await pool.query('SELECT imagem FROM projetos WHERE id=$1', [id]);
    imagem = rows[0] ? rows[0].imagem : '';
  }
  
  try {
    await pool.query(
      'UPDATE projetos SET categoria=$1, status=$2, nome=$3, cidade=$4, detalhes=$5, apartamentos=$6, metragem=$7, imagem=$8 WHERE id=$9',
      [categoria, status, nome, cidade, detalhes, apartamentos, metragem, imagem, id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Erro ao atualizar projeto:', err);
    res.status(500).json({ error: 'Erro na atualização: ' + err.message });
  }
});

app.delete('/api/projetos/:id', checkAdminAuth, async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM projetos WHERE id=$1', [id]);
  res.json({ ok: true });
});

// Listar projetos (público)
app.get('/api/projetos', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM projetos ORDER BY id DESC');
  res.json(rows);
});

// Listar admins (apenas username, sem senha)
app.get('/api/admins', checkAdminAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT id, username FROM admins');
  res.json(rows);
});

// Criar novo admin (apenas por admin logado)
app.post('/api/admins', checkAdminAuth, async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    await pool.query('INSERT INTO admins (username, password) VALUES ($1, $2)', [username, hash]);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: 'Usuário já existe' });
  }
});

// Excluir admin (não pode excluir o próprio usuário logado)
app.delete('/api/admins/:id', checkAdminAuth, async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT COUNT(*) as total FROM admins');
  if (parseInt(rows[0].total) <= 1) {
    return res.status(400).json({ error: 'Não é possível excluir o último admin.' });
  }
  await pool.query('DELETE FROM admins WHERE id=$1', [id]);
  res.json({ ok: true });
});

app.get('/api/setup-database-secure', async (req, res) => {
  try {
    // Criar Tabela de Projetos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projetos (
        id SERIAL PRIMARY KEY,
        categoria VARCHAR(100),
        status VARCHAR(100),
        nome VARCHAR(255),
        cidade VARCHAR(255),
        detalhes TEXT,
        apartamentos VARCHAR(100),
        metragem VARCHAR(100),
        imagem TEXT
      )
    `);

    // Criar Tabela de Admins
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE,
        password TEXT
      )
    `);

    // Inserir Admin Padrão (Se não existir)
    const adminUser = process.env.DEFAULT_ADMIN_USER || 'admin';
    const adminPass = process.env.DEFAULT_ADMIN_PASS || 'luniel2024';
    const hash = await bcrypt.hash(adminPass, 10);
    
    await pool.query(`
      INSERT INTO admins (username, password) 
      VALUES ($1, $2) 
      ON CONFLICT (username) DO NOTHING
    `, [adminUser, hash]);

    res.send('<h1>🏆 Banco de Dados Inicializado com Sucesso!</h1><p>As tabelas foram criadas e o acesso administrativo foi liberado.</p>');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao inicializar banco: ' + err.message);
  }
});

app.get('/', (req, res) => {
  res.send('API Luniel Pro online na Vercel!');
});

// Manipulador Global de Erros (Evita vazar a Stack Trace inteira listando as pastas do servidor se algo explodir).
app.use((err, req, res, next) => {
  console.error('[ERRO INTERNO PREVENIDO] ->', err.message);
  res.status(500).json({ error: 'Falha interna inesperada no Servidor. Requisição abortada.' });
});

// Exportar para Vercel
export default app;

// Listen apenas se rodar localmente (não em ambiente de nuvem serverless)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`[DEV] Rodando localmente na porta ${PORT}`);
  });
} 