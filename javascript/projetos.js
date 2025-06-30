const API_URL = '/api/projetos';

function criarCardProjeto(p) {
    // Usa imagem do projeto se houver, senão imagem padrão
    let bg = 'imagens/f1.avif';
    if (p.imagem) {
        // Se já começa com 'uploads/' ou 'imagens/', usa direto; senão prefixa uploads/
        bg = p.imagem.startsWith('uploads/') || p.imagem.startsWith('imagens/') ? p.imagem : 'uploads/' + p.imagem;
    }
    console.log(`[DEBUG] Projeto ${p.nome}: imagem = ${p.imagem}, bg = ${bg}`);
    
    // Garante que a categoria sempre será uma das válidas e em minúsculo
    const categoria = (p.categoria || 'residencial').toLowerCase();
    return `
    <div class="projeto-card-premium" data-categoria="${categoria}" style="background-image:url('${bg}')">
        <div class="projeto-overlay">
            <div class="projeto-status">${p.status || ''}</div>
            <h2>${p.nome || ''}</h2>
            <div class="projeto-info">
                <span>📍 ${p.cidade || ''}</span>
                <span>🏢 ${p.apartamentos || ''}</span>
                <span>📐 ${p.metragem || ''}</span>
            </div>
            <a href="#" class="btn-premium">Ver detalhes</a>
        </div>
    </div>
    `;
}

async function carregarProjetos() {
    try {
        const res = await fetch(API_URL);
        const projetos = await res.json();
        console.log('[DEBUG] Projetos carregados:', projetos);
        
        const grid = document.getElementById('projetos-dinamicos');
        if (!grid) {
            console.error('[ERROR] Elemento projetos-dinamicos não encontrado!');
            return;
        }
        
        grid.innerHTML = projetos.map(criarCardProjeto).join('');
        console.log('[DEBUG] Cards criados com sucesso');
    } catch (error) {
        console.error('[ERROR] Erro ao carregar projetos:', error);
    }
}

function filtrarProjetos(categoria) {
    const cards = document.querySelectorAll('.projeto-card-premium');
    cards.forEach(card => {
        if (categoria === 'todos' || card.dataset.categoria === categoria) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    carregarProjetos();
    const botoes = document.querySelectorAll('.filtro-btn');
    botoes.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove o destaque de todos
            botoes.forEach(b => b.classList.remove('active'));
            // Adiciona o destaque no clicado
            this.classList.add('active');
            // Filtra os cards
            filtrarProjetos(this.dataset.categoria);
        });
    });
}); 