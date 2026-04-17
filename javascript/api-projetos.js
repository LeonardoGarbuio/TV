// Dupla-Camada XSS (Padrão Pentágono)
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', async () => {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;
    
    projectsGrid.innerHTML = '<p style="color:var(--c-text-muted); padding:3rem; text-align:center; grid-column:1/-1;">Requisitando banco de dados blindado...</p>';

    // CONFIGURAÇÃO VITAL: Insira aqui a URL gerada pela Vercel após o deploy do seu backend
    const API_BASE_URL = 'https://tv-sable-sigma.vercel.app'; 
    
    try {
        const res = await fetch(API_BASE_URL + '/api/projetos');
        const projetos = await res.json();
        
        if (!Array.isArray(projetos) || projetos.length === 0) {
            projectsGrid.innerHTML = '<p style="color:var(--c-text-muted); padding:3rem; text-align:center; grid-column:1/-1;">Nenhum projeto postado recentemente no Banco de Dados.</p>';
            return;
        }
        
        projectsGrid.innerHTML = '';
        
        projetos.forEach(p => {
             // Formatar status
             let statusClass = 'construction';
             let statusLabel = p.status || 'Em Construção';
             if (statusLabel.toLowerCase().includes('pronto')) statusClass = 'ready';
             if (statusLabel.toLowerCase().includes('lançamento')) statusClass = 'launch';
             
             // Imagem do sistema de upload (CDN Vercel Blob) ou fallback
             let imgSrc = 'imagens/f1.avif';
             if (p.imagem) {
                 imgSrc = p.imagem.startsWith('http') ? p.imagem : `${API_BASE_URL}/${p.imagem}`;
             }
             
             const article = document.createElement('article');
             article.className = 'project-card-v2';
             // Dataset limpo para o filtro do javascript.js funcionar
             article.dataset.category = escapeHTML(p.categoria || 'residencial').toLowerCase();
             
             article.innerHTML = `
                <div class="project-card-visual">
                    <img src="${imgSrc}" alt="${escapeHTML(p.nome)}" loading="lazy">
                    <div class="project-card-overlay"><span class="project-status-badge ${statusClass}">${escapeHTML(statusLabel)}</span></div>
                </div>
                <div class="project-card-info">
                    <h3>${escapeHTML(p.nome)}</h3>
                    <p>${escapeHTML(p.detalhes || '')}</p>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem;">
                        <span style="font-size: 0.65rem; padding: 0.2rem 0.6rem; background: rgba(212,169,94,0.1); border-radius: 20px; color: var(--c-accent);">${escapeHTML(p.apartamentos || 'Oportunidade Única')}</span>
                        <span style="font-size: 0.65rem; padding: 0.2rem 0.6rem; background: rgba(212,169,94,0.1); border-radius: 20px; color: var(--c-accent);">${escapeHTML(p.metragem || 'Padrão Luniel')}</span>
                    </div>
                    <div class="project-card-meta">
                        <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> ${escapeHTML(p.cidade)}</span>
                        <a href="contato.html" class="project-card-link">Saber Mais <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg></a>
                    </div>
                </div>
             `;
             
             projectsGrid.appendChild(article);
        });

    } catch (error) {
        console.error('Falha de segurança ao baixar projetos:', error);
        projectsGrid.innerHTML = '<p style="color:#ef4444; padding:3rem; text-align:center; grid-column:1/-1;">Conexão API Bloqueada.</p>';
    }

    // Bind Filter Events for CSP Strict Mode (Zero Trust)
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-filter');
            
            // Toggle active visual class
            document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter categories
            document.querySelectorAll('#projectsGrid .project-card-v2').forEach(card => {
                const cardCat = card.getAttribute('data-category');
                if (category === 'todos' || cardCat === category) {
                    card.style.display = '';
                    card.style.animation = 'fadeSlideUp 0.5s ease forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

});
