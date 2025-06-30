const API_URL = '/api/projetos';
const ADMIN_PASSWORD = 'admin123';

const app = document.getElementById('admin-app');

let adminToken = null;
let adminUsername = null;

function renderLogin() {
    app.innerHTML = `
    <div class="admin-login">
        <h2>Login Admin</h2>
        <input type="text" id="admin-user" placeholder="Usuário">
        <input type="password" id="admin-pass" placeholder="Senha de admin" autocomplete="current-password">
        <button onclick="loginAdmin()">Entrar</button>
        <div id="login-erro" style="color:#c0392b;margin-top:8px;"></div>
    </div>`;
}

function renderAdmin(projetos = []) {
    app.innerHTML = `
    <div class="admin-container">
        <h2 class="admin-title">Gerenciar Projetos</h2>
        <form class="admin-form" id="form-projeto">
            <input type="hidden" id="projeto-id">
            <select id="projeto-categoria" required>
                <option value="">Categoria</option>
                <option value="residencial">Residencial</option>
                <option value="comercial">Comercial</option>
                <option value="multiuso">Multiuso</option>
            </select>
            <select id="projeto-status" required>
                <option value="">Status da Obra</option>
                <option value="Em Construção">Em Construção</option>
                <option value="Pronto para Morar">Pronto para Morar</option>
                <option value="Lançamento">Lançamento</option>
            </select>
            <input type="text" id="projeto-nome" placeholder="Nome do Projeto" required>
            <input type="text" id="projeto-cidade" placeholder="Cidade (ex: São Paulo, SP)" required>
            <input type="text" id="projeto-apartamentos" placeholder="Ex: 120 apartamentos" list="sugestoes-apartamentos" required>
            <datalist id="sugestoes-apartamentos">
                <option value="4 apartamentos">
                <option value="18 andares">
                <option value="80 apartamentos">
                <option value="120 apartamentos">
                <option value="45 apartamentos">
            </datalist>
            <input type="text" id="projeto-metragem" placeholder="Ex: 120-200m²" list="sugestoes-metragem" required>
            <datalist id="sugestoes-metragem">
                <option value="34 m²">
                <option value="45 m²">
                <option value="120-200m²">
                <option value="Garden + Standard">
                <option value="Escritórios Premium">
            </datalist>
            <input type="text" id="projeto-detalhes" placeholder="Detalhes adicionais (opcional)">
            <input type="file" id="projeto-imagemFile" accept="image/*" style="margin-bottom:14px;">
            <button type="submit">Salvar</button>
            <button type="button" onclick="limparForm()">Limpar</button>
        </form>
        <div class="admin-list" id="lista-projetos"></div>
        <hr style="margin:32px 0;">
        <h3>Admins do Sistema</h3>
        <form class="admin-form" id="form-admin">
            <input type="text" id="novo-admin-user" placeholder="Novo usuário admin" required>
            <input type="password" id="novo-admin-pass" placeholder="Senha" required autocomplete="new-password">
            <button type="submit">Criar Admin</button>
        </form>
        <div class="admin-list" id="lista-admins"></div>
        <button onclick="logoutAdmin()" style="margin-top:24px;background:#c0392b;">Sair</button>
    </div>`;
    document.getElementById('form-projeto').onsubmit = salvarProjeto;
    document.getElementById('form-admin').onsubmit = criarNovoAdmin;
    carregarProjetos();
    carregarAdmins();
}

async function loginAdmin() {
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;
    const erro = document.getElementById('login-erro');
    erro.textContent = '';
    try {
        const res = await fetch('/api/admin-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });
        const data = await res.json();
        if (data.token) {
            adminToken = data.token;
            adminUsername = data.username;
            sessionStorage.setItem('admin', '1');
            sessionStorage.setItem('adminToken', adminToken);
            sessionStorage.setItem('adminUsername', adminUsername);
            renderAdmin();
        } else {
            erro.textContent = data.error || 'Erro ao logar.';
        }
    } catch (e) {
        erro.textContent = 'Erro de conexão.';
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('admin');
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUsername');
    adminToken = null;
    adminUsername = null;
    renderLogin();
}

function limparForm() {
    document.getElementById('projeto-id').value = '';
    document.getElementById('form-projeto').reset();
}

async function carregarProjetos() {
    const res = await fetch(API_URL);
    const projetos = await res.json();
    const lista = document.getElementById('lista-projetos');
    lista.innerHTML = projetos.map(p => `
        <div class="admin-list-item">
            <span>${p.status} - ${p.nome}</span>
            <div>
                <button onclick="editarProjeto(${p.id})">Editar</button>
                <button class="delete" onclick="excluirProjeto(${p.id})">Excluir</button>
            </div>
        </div>
    `).join('');
}

async function salvarProjeto(e) {
    e.preventDefault();
    const id = document.getElementById('projeto-id').value;
    const imagemFile = document.getElementById('projeto-imagemFile').files[0];
    let categoria = document.getElementById('projeto-categoria').value;
    if (!categoria) {
        alert('Por favor, selecione uma categoria para o projeto.');
        return;
    }
    console.log('[DEBUG] Categoria selecionada:', categoria);
    const data = {
        categoria: categoria,
        status: document.getElementById('projeto-status').value,
        nome: document.getElementById('projeto-nome').value,
        cidade: document.getElementById('projeto-cidade').value,
        detalhes: document.getElementById('projeto-detalhes').value,
        apartamentos: document.getElementById('projeto-apartamentos').value,
        metragem: document.getElementById('projeto-metragem').value
    };
    console.log('[DEBUG] Dados enviados:', data);
    let res;
    if (imagemFile) {
        const formData = new FormData();
        for (const key in data) formData.append(key, data[key]);
        formData.append('imagemFile', imagemFile);
        res = await fetch(id ? `/api/projetos/${id}` : '/api/projetos', {
            method: id ? 'PUT' : 'POST',
            headers: { 'Authorization': 'Bearer ' + adminToken },
            body: formData
        });
    } else {
        res = await fetch(id ? `/api/projetos/${id}` : '/api/projetos', {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + adminToken },
            body: JSON.stringify(data)
        });
    }
    console.log('[DEBUG] Resposta do backend:', res);
    if (res.ok) {
        limparForm();
        carregarProjetos();
    } else {
        alert('Erro ao salvar projeto.');
    }
}

async function editarProjeto(id) {
    const res = await fetch(`/api/projetos`);
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
    }
}

async function excluirProjeto(id) {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
        const res = await fetch(`${API_URL}/${id}`, { 
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + adminToken }
        });
        if (res.ok) {
            carregarProjetos();
        } else {
            alert('Erro ao excluir projeto.');
        }
    }
}

async function carregarAdmins() {
    const lista = document.getElementById('lista-admins');
    lista.innerHTML = 'Carregando...';
    try {
        const res = await fetch('/api/admins', {
            headers: { 'Authorization': 'Bearer ' + adminToken }
        });
        const admins = await res.json();
        lista.innerHTML = admins.map(a => `
            <div class="admin-list-item">
                <span>${a.username}${a.username === adminUsername ? ' (você)' : ''}</span>
                <div>
                    ${a.username !== adminUsername ? `<button class="delete" onclick="excluirAdmin(${a.id})">Excluir</button>` : ''}
                </div>
            </div>
        `).join('');
    } catch (e) {
        lista.innerHTML = '<span style="color:#c0392b">Erro ao carregar admins.</span>';
    }
}

async function criarNovoAdmin(e) {
    e.preventDefault();
    const user = document.getElementById('novo-admin-user').value;
    const pass = document.getElementById('novo-admin-pass').value;
    try {
        const res = await fetch('/api/admins', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + adminToken },
            body: JSON.stringify({ username: user, password: pass })
        });
        const data = await res.json();
        if (data.ok) {
            carregarAdmins();
            document.getElementById('form-admin').reset();
        } else {
            alert(data.error || 'Erro ao criar admin.');
        }
    } catch (e) {
        alert('Erro de conexão.');
    }
}

async function excluirAdmin(id) {
    if (!confirm('Tem certeza que deseja excluir este admin?')) return;
    try {
        const res = await fetch(`/api/admins/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + adminToken }
        });
        const data = await res.json();
        if (data.ok) {
            carregarAdmins();
        } else {
            alert(data.error || 'Erro ao excluir admin.');
        }
    } catch (e) {
        alert('Erro de conexão.');
    }
}

// Inicialização
if (sessionStorage.getItem('admin')) {
    adminToken = sessionStorage.getItem('adminToken');
    adminUsername = sessionStorage.getItem('adminUsername');
    renderAdmin();
} else {
    renderLogin();
}

// Expor funções globais
window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.limparForm = limparForm;
window.editarProjeto = editarProjeto;
window.excluirProjeto = excluirProjeto;
window.carregarAdmins = carregarAdmins;
window.criarNovoAdmin = criarNovoAdmin;
window.excluirAdmin = excluirAdmin; 