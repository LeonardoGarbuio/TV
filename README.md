# 🏠 Luniel Incorporadora — Arquitetura de Elite (Híbrida)

Bem-vindo ao repositório oficial da **Luniel Incorporadora**. Este projeto foi migrado de uma estrutura local legado para uma **Arquitetura Híbrida de Alta Performance**, focada em segurança militar, escalabilidade global e custo zero de manutenção.

---

## 🏗️ Arquitetura do Sistema

O sistema agora opera de forma distribuída para garantir redundância e performance máxima:

- **Frontend (Static Hosting)**: Hospedado no **GitHub Pages**, garantindo entrega via CDN global e tempo de resposta zero.
- **Backend (Serverless API)**: Rodando na **Vercel**, utilizando funções serverless escaláveis.
- **Banco de Dados (Cloud Managed)**: **Vercel Postgres** (SQL) para persistência de dados e logs forenses.
- **Armazenamento de Mídia**: **Vercel Blob Storage** para upload de imagens de empreendimentos.

---

## 🛡️ "Bunker Digital" — Pilares de Segurança

Este projeto foi construído sob uma política de **Zero Trust** e possui camadas de proteção raramente vistas em sites institucionais:

1.  **Autenticação Via Cookies HttpOnly**: O token JWT de acesso administrativo nunca toca o `localStorage`, tornando impossível o roubo de sessão via scripts maliciosos (XSS).
2.  **Cross-Domain Security (SameSite=None)**: Comunicação segura entre o site (GitHub) e a API (Vercel) com criptografia forçada.
3.  **Honeypots e Engodo**: O servidor emite cabeçalhos falsos (Mentindo ser Apache/PHP 5.4) para enganar scanners automáticos de vulnerabilidades.
4.  **Rate Limiting & Account Lockout**: Proteção ativa contra ataques de força bruta. IPs suspeitos são bloqueados após 5 tentativas falhas.
5.  **CORS Strict**: O backend só aceita requisições originadas do domínio oficial da Luniel.

---

## 🚀 Guia de Deploy

### 1. Backend (Vercel)
Faça o upload da pasta `/backend` para a Vercel e configure as seguintes variáveis de ambiente:
- `POSTGRES_URL`: String de conexão fornecida pela Vercel.
- `BLOB_READ_WRITE_TOKEN`: Token para o Storage.
- `JWT_SECRET`: Uma chave aleatória e segura.
- `DEFAULT_ADMIN_USER`: Login inicial.
- `DEFAULT_ADMIN_PASS`: Senha inicial.
- `ALLOWED_ORIGIN`: URL do seu site no GitHub Pages.

### 2. Frontend (GitHub Pages)
1. Ative o GitHub Pages nas configurações deste repositório apontando para a pasta **raiz** (root).
2. **IMPORTANTE**: Após o deploy do backend, atualize a constante `API_BASE_URL` no topo dos arquivos:
   - `javascript/admin.js`
   - `javascript/api-projetos.js`

---

## 🛠️ Tecnologias Utilizadas
- **Linguagens**: HTML5, CSS3, Vanilla JavaScript (ES6+).
- **Backend**: Node.js, Express.
- **Banco de Dados**: PostgreSQL.
- **Certificações**: SSL/TLS de ponta a ponta.

---

*Desenvolvido com foco em exclusividade e proteção de dados pela Luniel Incorporadora.* 🏢🏁🛡️