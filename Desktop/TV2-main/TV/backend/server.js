import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import multer from 'multer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
console.log('PORTA USADA:', PORT);
const SECRET_TOKEN = 'SECRETTOKEN123'; // Troque por um token forte

app.use(cors());
app.use(bodyParser.json());

// Servir arquivos estáticos (HTML, CSS, JS, imagens)
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// Inicializa o banco de dados SQLite
let db;
(async () => {
  let dbPath = path.join(__dirname, '../database/projetos.db');
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
  } catch (e) {
    // Se der erro de permissão, tenta criar em /tmp (Railway, Vercel, etc)
    dbPath = '/tmp/projetos.db';
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
  }
  await db.run(`CREATE TABLE IF NOT EXISTS projetos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT,
    nome TEXT,
    cidade TEXT,
    detalhes TEXT,
    apartamentos TEXT,
    metragem TEXT,
    imagem TEXT
  )`);
  // Adicionar coluna categoria se não existir
  const cols = await db.all(`PRAGMA table_info(projetos)`);
  if (!cols.find(c => c.name === 'categoria')) {
    await db.run('ALTER TABLE projetos ADD COLUMN categoria TEXT');
  }
  await db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
  // Inserir projetos fixos se o banco estiver vazio
  const count = await db.get('SELECT COUNT(*) as total FROM projetos');
  if (count.total === 0) {
    await db.run(`INSERT INTO projetos (status, nome, cidade, detalhes, apartamentos, metragem, imagem) VALUES
      ('Em Construção', 'Luniel Essence', 'São Paulo, SP', '', '120 apartamentos', '120-200m²', 'imagens/f1.avif'),
      ('Lançamento', 'Luniel Corporate', 'Rio de Janeiro, RJ', '', '18 andares', 'Escritórios Premium', 'imagens/f2.avif'),
      ('Pronto para Morar', 'Luniel Garden', 'Curitiba, PR', '', '80 apartamentos', 'Garden + Standard', 'imagens/f3.png')
    `);
  }
  // Inserir admin padrão se não existir nenhum
  const adminCount = await db.get('SELECT COUNT(*) as total FROM admins');
  if (adminCount.total === 0) {
    const bcrypt = await import('bcrypt');
    const hash = await bcrypt.default.hash('202330', 10);
    await db.run('INSERT INTO admins (username, password) VALUES (?, ?)', ['leonardo', hash]);
  }
})();

// Login de admin
app.post('/api/admin-login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await db.get('SELECT * FROM admins WHERE username = ?', [username]);
  if (!admin) return res.status(401).json({ error: 'Usuário ou senha inválidos' });
  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return res.status(401).json({ error: 'Usuário ou senha inválidos' });
  // Simples: retorna um token de sessão fake (em produção, use JWT)
  res.json({ token: 'admin-session-token', username });
});

// Middleware simples para proteger rotas de admin (exemplo, pode ser melhorado)
function checkAdminAuth(req, res, next) {
  // Em produção, use JWT ou sessão real
  const auth = req.headers['authorization'];
  if (auth === 'Bearer admin-session-token') {
    next();
  } else {
    res.status(401).json({ error: 'Não autorizado' });
  }
}

// Rotas CRUD protegidas
app.post('/api/projetos', checkAdminAuth, upload.single('imagemFile'), async (req, res) => {
  let { categoria = '', status = '', nome = '', cidade = '', detalhes = '', apartamentos = '', metragem = '' } = req.body;
  console.log('[DEBUG] POST /api/projetos req.body:', req.body);
  categoria = categoria.toLowerCase();
  let imagem = '';
  if (req.file) {
    imagem = 'uploads/' + req.file.filename;
  }
  const result = await db.run(
    'INSERT INTO projetos (categoria, status, nome, cidade, detalhes, apartamentos, metragem, imagem) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [categoria, status, nome, cidade, detalhes, apartamentos, metragem, imagem]
  );
  console.log('[DEBUG] Projeto salvo:', {categoria, status, nome, cidade, detalhes, apartamentos, metragem, imagem});
  res.json({ id: result.lastID });
});

app.put('/api/projetos/:id', checkAdminAuth, upload.single('imagemFile'), async (req, res) => {
  const { id } = req.params;
  let { categoria = '', status = '', nome = '', cidade = '', detalhes = '', apartamentos = '', metragem = '' } = req.body;
  console.log('[DEBUG] PUT /api/projetos/:id req.body:', req.body);
  categoria = categoria.toLowerCase();
  let imagem;
  if (req.file) {
    imagem = 'uploads/' + req.file.filename;
  } else {
    // Buscar imagem atual do projeto
    const projeto = await db.get('SELECT imagem FROM projetos WHERE id=?', [id]);
    imagem = projeto ? projeto.imagem : '';
  }
  await db.run(
    'UPDATE projetos SET categoria=?, status=?, nome=?, cidade=?, detalhes=?, apartamentos=?, metragem=?, imagem=? WHERE id=?',
    [categoria, status, nome, cidade, detalhes, apartamentos, metragem, imagem, id]
  );
  console.log('[DEBUG] Projeto atualizado:', {categoria, status, nome, cidade, detalhes, apartamentos, metragem, imagem});
  res.json({ ok: true });
});

app.delete('/api/projetos/:id', checkAdminAuth, async (req, res) => {
  const { id } = req.params;
  await db.run('DELETE FROM projetos WHERE id=?', [id]);
  res.json({ ok: true });
});

// Listar projetos (público)
app.get('/api/projetos', async (req, res) => {
  console.log('[DEBUG] GET /api/projetos chamado');
  const projetos = await db.all('SELECT * FROM projetos');
  res.json(projetos);
});

// Listar admins (apenas username, sem senha)
app.get('/api/admins', checkAdminAuth, async (req, res) => {
  const admins = await db.all('SELECT id, username FROM admins');
  res.json(admins);
});

// Criar novo admin (apenas por admin logado)
app.post('/api/admins', checkAdminAuth, async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    await db.run('INSERT INTO admins (username, password) VALUES (?, ?)', [username, hash]);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: 'Usuário já existe' });
  }
});

// Excluir admin (não pode excluir o próprio usuário logado)
app.delete('/api/admins/:id', checkAdminAuth, async (req, res) => {
  const { id } = req.params;
  // Opcional: impedir que o último admin seja excluído
  const total = await db.get('SELECT COUNT(*) as total FROM admins');
  if (total.total <= 1) {
    return res.status(400).json({ error: 'Não é possível excluir o último admin.' });
  }
  await db.run('DELETE FROM admins WHERE id=?', [id]);
  res.json({ ok: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  if (process.env.RAILWAY_STATIC_URL) {
    console.log(`Acesse em: https://${process.env.RAILWAY_STATIC_URL}`);
  }
}); 