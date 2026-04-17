// CONFIGURAÇÃO FULL-STACK: Agora que o Front e o Back estão no mesmo lugar, usamos URLs relativas.
const API_BASE_URL = ''; 

const API_URL = API_BASE_URL + '/api/projetos';
const app = document.getElementById('admin-app');
let adminUsername = null;
let sessionActive = false;

// Dupla-Camada XSS: Fugas seguras de HTML no Frontend
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderLogin() {
    app.innerHTML = `
    <div class="admin-login">
        <div class="admin-login-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
        <h2>Acesso <span>Restrito</span></h2>
        <div class="form-group">
            <label>Usuário</label>
            <input type="text" id="admin-user" class="admin-input" placeholder="Seu usuário" required>
        </div>
        <div class="form-group">
            <label>Senha</label>
            <input type="password" id="admin-pass" class="admin-input" placeholder="••••••••" autocomplete="current-password" required>
        </div>
        <button id="auth-btn-admin" class="btn-admin">Autenticar</button>
        <div id="login-erro" style="color:#ef4444;margin-top:16px;font-size:0.85rem;height:1.2rem;"></div>
    </div>`;

    document.getElementById('auth-btn-admin').addEventListener('click', loginAdmin);
}

function renderAdmin(projetos = []) {
    app.innerHTML = `
    <div class="admin-dashboard">
        <div class="admin-header">
            <h1>Workspace <span>Admin</span></h1>
            <div class="header-actions">
                <span style="font-size:0.85rem;color:var(--c-text-secondary);margin-right:1rem;">Olá, <strong style="color:var(--c-accent)">${escapeHTML(adminUsername)}</strong></span>
                <button id="sys-btn-logout" class="btn-logout">Encerrar Sessão</button>
            </div>
        </div>

        <div class="admin-grid">
            <!-- Coluna 1: Formulários -->
            <div style="display:flex; flex-direction:column; gap:var(--sp-8);">
                <div class="admin-panel">
                    <h3 class="panel-title">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        Gerenciar Projetos
                    </h3>
                    <form id="form-projeto">
                        <input type="hidden" id="projeto-id">
                        <div class="form-group">
                            <label>Categoria e Status</label>
                            <div style="display:flex;gap:var(--sp-2);">
                                <select id="projeto-categoria" class="admin-input" style="flex:1;" required>
                                    <option value="" disabled selected>Categoria</option>
                                    <option value="residencial">Residencial</option>
                                    <option value="comercial">Comercial</option>
                                    <option value="multiuso">Multiuso</option>
                                </select>
                                <select id="projeto-status" class="admin-input" style="flex:1;" required>
                                    <option value="" disabled selected>Status</option>
                                    <option value="Em Construção">Em Construção</option>
                                    <option value="Pronto para Morar">Pronto para Morar</option>
                                    <option value="Lançamento">Lançamento</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Nome do Empreendimento</label>
                            <input type="text" id="projeto-nome" class="admin-input" placeholder="Ex: Luniel Horizon" required>
                        </div>
                        <div class="form-group">
                            <label>Localização (Cidade/UF)</label>
                            <input type="text" id="projeto-cidade" class="admin-input" placeholder="Ex: São Paulo, SP" required>
                        </div>
                        <div class="form-group">
                            <label>Características (Aptos e Metragem)</label>
                            <div style="display:flex;gap:var(--sp-2);">
                                <input type="text" id="projeto-apartamentos" class="admin-input" placeholder="Ex: 80 unidades" required>
                                <input type="text" id="projeto-metragem" class="admin-input" placeholder="Ex: 120-200m²" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Detalhes Adicionais</label>
                            <input type="text" id="projeto-detalhes" class="admin-input" placeholder="Opcional">
                        </div>
                        <div class="form-group">
                            <label>Imagem de Capa</label>
                            <input type="file" id="projeto-imagemFile" class="admin-input" accept="image/*" style="padding: 8px;">
                        </div>
                        <div style="display:flex;gap:var(--sp-3);margin-top:var(--sp-6);">
                            <button type="submit" class="btn-admin" style="margin-top:0;">Salvar Projeto</button>
                            <button type="button" id="sys-btn-limpar" class="btn-logout" style="flex:0.5;border-radius:var(--r-md);">Limpar</button>
                        </div>
                    </form>
                </div>

                <div class="admin-panel" style="border-color: rgba(239, 68, 68, 0.1);">
                    <h3 class="panel-title" style="color:#ef4444;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="17" y1="11" x2="23" y2="11"></line><line x1="20" y1="8" x2="20" y2="14"></line></svg>
                        Equipe Administrativa
                    </h3>
                    <form id="form-admin">
                        <div class="form-group">
                            <input type="text" id="novo-admin-user" class="admin-input" placeholder="Novo usuário" required style="margin-bottom:var(--sp-2);">
                            <input type="password" id="novo-admin-pass" class="admin-input" placeholder="Senha Forte" required autocomplete="new-password">
                        </div>
                        <button type="submit" class="btn-admin" style="background:#ef4444;margin-top:0;">Adicionar Admin</button>
                    </form>
                    <div id="lista-admins" style="margin-top:var(--sp-6);display:flex;flex-direction:column;gap:var(--sp-2);"></div>
                </div>
            </div>

            <!-- Coluna 2: Listagem Especial -->
            <div class="admin-panel">
                <h3 class="panel-title">Empreendimentos Ativos</h3>
                <div class="project-list" id="lista-projetos">
                    <p style="color:var(--c-text-muted);text-align:center;padding:2rem;">Carregando repositório...</p>
                </div>
            </div>
        </div>
    </div>`;
    
    // Anexar Event Listeners p/ Evitar uso de 'unsafe-inline' e seguir Politivas Estritas
    document.getElementById('sys-btn-logout').addEventListener('click', logoutAdmin);
    document.getElementById('sys-btn-limpar').addEventListener('click', limparForm);
    document.getElementById('form-projeto').addEventListener('submit', salvarProjeto);
    document.getElementById('form-admin').addEventListener('submit', criarNovoAdmin);

    carregarProjetos();
    carregarAdmins();
}

async function loginAdmin() {
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;
    const erro = document.getElementById('login-erro');
    erro.textContent = 'Processando Segurança...';

    if (!user || !pass) {
        erro.textContent = 'Preencha usuário e senha adequadamente.';
        return;
    }

    try {
        const res = await fetch(API_BASE_URL + '/api/admin-login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ username: user, password: pass }),
            credentials: 'include' // Obligatory for Set-Cookie to work cross-origin
        });
        const data = await res.json();
        
        if (data.success) {
            sessionActive = true;
            adminUsername = data.username;
            sessionStorage.setItem('sec_user', adminUsername); // Just visual identifier, not the token
            renderAdmin();
        } else {
            erro.textContent = data.error || 'Autenticação Múltipla Falhou.';
        }
    } catch (e) {
        erro.textContent = 'Canal de Conexão Bloqueado.';
    }
}

async function logoutAdmin() {
    try {
        await fetch(API_BASE_URL + '/api/admin-logout', { 
            method: 'POST', 
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'include' 
        });
    } catch(e) {}
    
    sessionStorage.removeItem('sec_user');
    sessionActive = false;
    adminUsername = null;
    renderLogin();
}

function limparForm() {
    document.getElementById('projeto-id').value = '';
    document.getElementById('form-projeto').reset();
}

async function carregarProjetos() {
    try {
        const res = await fetch(API_URL);
        const projetos = await res.json();
        const lista = document.getElementById('lista-projetos');
        
        if (projetos.length === 0) {
            lista.innerHTML = '<p style="color:var(--c-text-muted);text-align:center;">Nenhum projeto registrado.</p>';
            return;
        }

        lista.innerHTML = projetos.map(p => `
            <div class="project-card">
                <div class="project-info">
                    <h4>${escapeHTML(p.nome)}</h4>
                    <p>
                        <span style="color:var(--c-accent)">${escapeHTML(p.categoria || 'N/A').toUpperCase()}</span> &bull; 
                        ${escapeHTML(p.status)} &bull; ${escapeHTML(p.cidade)}
                    </p>
                </div>
                <div class="action-btns">
                    <button class="btn-icon" data-edit-id="${p.id}" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn-icon delete" data-delete-id="${p.id}" title="Excluir">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>
        `).join('');

        // Listeners Pós-Renderização Dinâmica (Substituir Onclicks Inseridos via HTML)
        document.querySelectorAll('[data-edit-id]').forEach(btn => {
            btn.addEventListener('click', () => editarProjeto(btn.getAttribute('data-edit-id')));
        });
        document.querySelectorAll('[data-delete-id]').forEach(btn => {
            btn.addEventListener('click', () => excluirProjeto(btn.getAttribute('data-delete-id')));
        });
    } catch (e) {
        console.error('Erro ao carregar projetos:', e);
    }
}

async function salvarProjeto(e) {
    e.preventDefault();
    const id = document.getElementById('projeto-id').value;
    const imagemFile = document.getElementById('projeto-imagemFile').files[0];
    let categoria = document.getElementById('projeto-categoria').value;
    
    if (!categoria) {
        alert('Selecione uma categoria.');
        return;
    }
    
    const data = {
        categoria,
        status: document.getElementById('projeto-status').value,
        nome: document.getElementById('projeto-nome').value,
        cidade: document.getElementById('projeto-cidade').value,
        detalhes: document.getElementById('projeto-detalhes').value,
        apartamentos: document.getElementById('projeto-apartamentos').value,
        metragem: document.getElementById('projeto-metragem').value
    };
    
    try {
        let res;
        const submitUrl = id ? `${API_BASE_URL}/api/projetos/${id}` : API_BASE_URL + '/api/projetos';
        
        if (imagemFile) {
            const formData = new FormData();
            for (const key in data) formData.append(key, data[key]);
            formData.append('imagemFile', imagemFile);
            res = await fetch(submitUrl, {
                method: id ? 'PUT' : 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'include', // Sends HttpOnly Cookie seamlessly
                body: formData
            });
        } else {
            res = await fetch(submitUrl, {
                method: id ? 'PUT' : 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include', // Sends HttpOnly Cookie seamlessly
                body: JSON.stringify(data)
            });
        }
        
        if (res.status === 401 || res.status === 403) {
            alert('Acesso Militar Negado: Cookie Violado ou Expirado.');
            logoutAdmin();
            return;
        }

        if (res.ok) {
            limparForm();
            carregarProjetos();
        } else {
            alert('Operação Negada pela Nuvem.');
        }
    } catch (e) {
        alert('Conexão cortada ativamente (Drop).');
    }
}

async function editarProjeto(idNum) {
    const id = parseInt(idNum, 10);
    const res = await fetch(`${API_BASE_URL}/api/projetos`);
    const projetos = await res.json();
    const p = projetos.find(x => x.id === id);
    if (p) {
        document.getElementById('projeto-id').value = p.id;
        document.getElementById('projeto-categoria').value = (p.categoria || '').toLowerCase();
        document.getElementById('projeto-status').value = p.status;
        document.getElementById('projeto-nome').value = p.nome;
        document.getElementById('projeto-cidade').value = p.cidade;
        document.getElementById('projeto-detalhes').value = p.detalhes;
        document.getElementById('projeto-apartamentos').value = p.apartamentos;
        document.getElementById('projeto-metragem').value = p.metragem;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

async function excluirProjeto(id) {
    if (confirm('Tem certeza que deseja aplicar a exclusão permanente?')) {
        const res = await fetch(`${API_BASE_URL}/api/projetos/${id}`, { 
            method: 'DELETE',
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'include'
        });
        
        if (res.status === 401 || res.status === 403) return logoutAdmin();

        if (res.ok) {
            carregarProjetos();
        } else {
            alert('Falha de permissão ao excluir.');
        }
    }
}

async function carregarAdmins() {
    const lista = document.getElementById('lista-admins');
    try {
        const res = await fetch(API_BASE_URL + '/api/admins', {
            credentials: 'include'
        });
        
        if (res.status === 401 || res.status === 403) return logoutAdmin();
        
        const admins = await res.json();
        lista.innerHTML = admins.map(a => `
            <div style="display:flex;justify-content:space-between;align-items:center;background:var(--c-bg-elevated);padding:8px 12px;border-radius:6px;border:1px solid var(--c-border);">
                <span style="font-size:0.85rem;">${escapeHTML(a.username)}${a.username === adminUsername ? ' <strong style="color:var(--c-accent);">(você)</strong>' : ''}</span>
                ${a.username !== adminUsername ? `<button class="btn-icon delete" style="width:28px;height:28px;" data-del-admin="${a.id}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>` : ''}
            </div>
        `).join('');

        document.querySelectorAll('[data-del-admin]').forEach(btn => {
            btn.addEventListener('click', () => excluirAdmin(btn.getAttribute('data-del-admin')));
        });
    } catch (e) {
        lista.innerHTML = '<span style="color:#ef4444;font-size:0.8rem;">Falha de segurança ao carregar admins.</span>';
    }
}

async function criarNovoAdmin(e) {
    e.preventDefault();
    const user = document.getElementById('novo-admin-user').value;
    const pass = document.getElementById('novo-admin-pass').value;
    try {
        const res = await fetch(API_BASE_URL + '/api/admins', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include',
            body: JSON.stringify({ username: user, password: pass })
        });
        
        if (res.status === 401 || res.status === 403) return logoutAdmin();
        
        const data = await res.json();
        if (data.ok) {
            carregarAdmins();
            document.getElementById('form-admin').reset();
        } else {
            alert(data.error || 'Erro na criação do acesso.');
        }
    } catch (e) {
        alert('Falha de conexão.');
    }
}

async function excluirAdmin(id) {
    if (!confirm('Excluir privilégios de acesso deste usuário?')) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/admins/${id}`, {
            method: 'DELETE',
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'include'
        });
        
        if (res.status === 401 || res.status === 403) return logoutAdmin();
        
        const data = await res.json();
        if (data.ok) {
            carregarAdmins();
        } else {
            alert(data.error || 'Violacão de restrição. Bloqueado.');
        }
    } catch (e) {
        alert('Falha de conexão.');
    }
}

// Secure Session Check via API Bootload
async function verificarSessaoAtiva() {
    try {
        const res = await fetch(API_BASE_URL + '/api/admin-session', { credentials: 'include' });
        const data = await res.json();
        if (data.authenticated) {
            sessionActive = true;
            adminUsername = data.username;
            sessionStorage.setItem('sec_user', adminUsername);
            renderAdmin();
        } else {
            renderLogin();
        }
    } catch(e) {
        renderLogin();
    }
}

// Inicializar bootloader validando com servidor (Segurança Camada 2)
verificarSessaoAtiva();

// Window Bindings removidos pois não usamos mais tags evaluais (unsafe-inline). Tivemos arquitetura blindada!