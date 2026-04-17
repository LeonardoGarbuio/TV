// ==================== LUNIEL — PREMIUM INTERACTIONS ====================

document.addEventListener('DOMContentLoaded', function() {

    // ========== PRELOADER ==========
    const preloader = document.getElementById('preloader');
    const preloaderProgress = document.getElementById('preloaderProgress');
    
    if (preloader && preloaderProgress) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    preloader.classList.add('hidden');
                    document.body.style.overflow = '';
                    initAfterLoad();
                }, 400);
            }
            preloaderProgress.style.width = progress + '%';
        }, 120);
    } else {
        initAfterLoad();
    }

    function initAfterLoad() {
        initCustomCursor();
        initParticles();
        initMorphBlob();
        initParallax();
        initCountUp();
        initScrollReveal();
        initMagneticButtons();
    }

    // ========== CUSTOM CURSOR ==========
    function initCustomCursor() {
        const dot = document.getElementById('cursorDot');
        const ring = document.getElementById('cursorRing');
        if (!dot || !ring) return;

        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.left = mouseX + 'px';
            dot.style.top = mouseY + 'px';
        });

        function animateRing() {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            ring.style.left = ringX + 'px';
            ring.style.top = ringY + 'px';
            requestAnimationFrame(animateRing);
        }
        animateRing();

        // Hover effect
        const hoverTargets = document.querySelectorAll('a, button, .magnetic-btn, .project-card-v2, .about-feature-card, .tilt-card');
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    // ========== FLOATING PARTICLES ==========
    function initParticles() {
        const canvas = document.getElementById('particlesCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        let w, h;

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = (Math.random() - 0.5) * 0.3;
                this.opacity = Math.random() * 0.3 + 0.05;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) {
                    this.reset();
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(212, 169, 94, ${this.opacity})`;
                ctx.fill();
            }
        }

        const numParticles = Math.min(60, Math.floor(w * h / 20000));
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, w, h);
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(58, 107, 79, ${0.06 * (1 - distance / 150)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        }
        animate();
    }

    // ========== MORPHING BLOB ==========
    function initMorphBlob() {
        const blob = document.getElementById('morphBlob1');
        if (!blob) return;

        let time = 0;
        function animateBlob() {
            time += 0.005;
            const points = [];
            const numPoints = 6;
            for (let i = 0; i < numPoints; i++) {
                const angle = (i / numPoints) * Math.PI * 2;
                const r = 200 + Math.sin(time * 2 + i * 1.5) * 30 + Math.cos(time * 3 + i * 0.8) * 20;
                points.push({
                    x: Math.cos(angle) * r,
                    y: Math.sin(angle) * r
                });
            }

            let d = `M ${points[0].x} ${points[0].y}`;
            for (let i = 0; i < numPoints; i++) {
                const next = points[(i + 1) % numPoints];
                const cp1x = points[i].x + (next.x - points[i].x) * 0.5 + Math.sin(time + i) * 30;
                const cp1y = points[i].y + (next.y - points[i].y) * 0.5 + Math.cos(time + i) * 30;
                d += ` Q ${cp1x} ${cp1y} ${next.x} ${next.y}`;
            }
            d += ' Z';

            blob.setAttribute('d', d);
            requestAnimationFrame(animateBlob);
        }
        animateBlob();
    }

    // ========== PARALLAX ==========
    function initParallax() {
        const parallaxImg = document.querySelector('.hero-parallax-img');
        if (!parallaxImg) return;

        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;
            const speed = 0.3;
            parallaxImg.style.transform = `scale(1.1) translateY(${scrollY * speed}px)`;
        }, { passive: true });
    }

    // ========== COUNT UP ==========
    function initCountUp() {
        const counters = document.querySelectorAll('[data-count]');
        if (counters.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.count);
                    animateCounter(el, target);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(c => observer.observe(c));
    }

    function animateCounter(el, target) {
        const duration = 2000;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(target * eased);

            if (target >= 1000) {
                el.textContent = current.toLocaleString('pt-BR') + '+';
            } else {
                el.textContent = current + '+';
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    }

    // ========== SCROLL REVEAL ==========
    function initScrollReveal() {
        const revealEls = document.querySelectorAll('.reveal-left, .reveal-right, .reveal-up, .about-feature-card, .project-card-v2');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    // Staggered cards
                    if (entry.target.classList.contains('about-feature-card') || entry.target.classList.contains('project-card-v2')) {
                        const parent = entry.target.parentElement;
                        const siblings = parent.querySelectorAll('.about-feature-card, .project-card-v2');
                        siblings.forEach((sibling, i) => {
                            setTimeout(() => {
                                sibling.style.opacity = '1';
                                sibling.style.transform = 'translateY(0)';
                            }, i * 150);
                        });
                    }
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        revealEls.forEach(el => observer.observe(el));

        // Cards initial state
        document.querySelectorAll('.about-feature-card, .project-card-v2').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        });
    }

    // ========== MAGNETIC BUTTONS ==========
    function initMagneticButtons() {
        const btns = document.querySelectorAll('.magnetic-btn');
        btns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
                btn.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            });
            btn.addEventListener('mouseenter', () => {
                btn.style.transition = 'transform 0.1s linear';
            });
        });
    }

    // ========== HEADER BEHAVIOR ==========
    const header = document.querySelector('#header');
    let lastScrollTop = 0;

    if (header) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > 80) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            if (scrollTop > lastScrollTop && scrollTop > 300) {
                header.classList.add('hide-header');
            } else {
                header.classList.remove('hide-header');
            }

            lastScrollTop = scrollTop;
        }, { passive: true });
    }

    // ========== MOBILE MENU ==========
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mobileOverlay = document.getElementById('mobileOverlay');

    if (menuBtn && mobileOverlay) {
        menuBtn.addEventListener('click', () => {
            const isActive = menuBtn.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            document.body.style.overflow = isActive ? 'hidden' : '';
            menuBtn.setAttribute('aria-expanded', isActive);
        });

        // Close on link click
        mobileOverlay.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.classList.remove('active');
                mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ========== SMOOTH ANCHOR SCROLL ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.pushState(null, null, targetId);
            }
        });
    });

    // ========== NEWSLETTER FORM ==========
    const newsletterForm = document.querySelector('.newsletter-form-v2');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = newsletterForm.querySelector('input');
            if (input && input.value.trim()) {
                input.value = '';
                input.placeholder = 'Inscrito com sucesso! ✓';
                setTimeout(() => {
                    input.placeholder = 'Seu melhor email';
                }, 3000);
            }
        });
    }

    // ========== TILT EFFECT ON CARDS ==========
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(800px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-8px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateY(0)';
            card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        });
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.1s linear';
        });
    });
});

// ==================== LEGACY: PREMIUM FEATURES ====================

// Investment Calculator
class InvestmentCalculator {
    constructor() {
        this.form = document.getElementById('investmentCalculator');
        this.results = document.getElementById('calculatorResults');
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        const downPaymentSlider = document.getElementById('downPayment');
        const financingTermSlider = document.getElementById('financingTerm');
        
        if (downPaymentSlider) {
            downPaymentSlider.addEventListener('input', (e) => {
                document.getElementById('downPaymentValue').textContent = e.target.value + '%';
            });
        }
        
        if (financingTermSlider) {
            financingTermSlider.addEventListener('input', (e) => {
                document.getElementById('financingTermValue').textContent = e.target.value + ' anos';
            });
        }
        
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateInvestment();
        });
    }
    
    calculateInvestment() {
        const formData = new FormData(this.form);
        const propertyValue = parseFloat(formData.get('propertyValue'));
        const downPaymentPercent = parseFloat(formData.get('downPayment'));
        const financingTerm = parseFloat(formData.get('financingTerm'));
        const interestRate = parseFloat(formData.get('interestRate'));
        const appreciationRate = parseFloat(formData.get('appreciationRate'));
        
        if (!propertyValue || !downPaymentPercent || !financingTerm || !interestRate || !appreciationRate) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        
        const downPaymentAmount = propertyValue * (downPaymentPercent / 100);
        const financedAmount = propertyValue - downPaymentAmount;
        const monthlyInterestRate = interestRate / 100 / 12;
        const totalPayments = financingTerm * 12;
        
        const monthlyPayment = financedAmount * 
            (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) / 
            (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);
        
        const futureValue = propertyValue * Math.pow(1 + appreciationRate / 100, 5);
        const appreciationAmount = futureValue - propertyValue;
        
        const totalInvestment = downPaymentAmount + (monthlyPayment * 60);
        const roi = ((futureValue - totalInvestment) / totalInvestment) * 100;
        
        this.updateResults({
            downPayment: downPaymentAmount,
            monthlyPayment: monthlyPayment,
            appreciation: appreciationAmount,
            roi: roi
        });
        
        this.results.style.display = 'block';
        this.results.scrollIntoView({ behavior: 'smooth' });
    }
    
    updateResults(data) {
        const dpResult = document.getElementById('downPaymentResult');
        const mpResult = document.getElementById('monthlyPaymentResult');
        const apResult = document.getElementById('appreciationResult');
        const roiResult = document.getElementById('roiResult');
        
        if (dpResult) dpResult.textContent = 'R$ ' + data.downPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        if (mpResult) mpResult.textContent = 'R$ ' + data.monthlyPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        if (apResult) apResult.textContent = 'R$ ' + data.appreciation.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        if (roiResult) roiResult.textContent = data.roi.toFixed(1) + '%';
    }
}

// Interactive Gallery
class InteractiveGallery {
    constructor() {
        this.grid = document.getElementById('galleryGrid');
        this.filters = document.querySelectorAll('.filter-btn');
        this.init();
    }
    
    init() {
        if (!this.grid) return;
        this.filters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                this.filterItems(e.target.dataset.filter);
                this.filters.forEach(f => f.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }
    
    filterItems(category) {
        const items = this.grid.querySelectorAll('.gallery-item');
        items.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.style.display = 'block';
                item.style.animation = 'fadeSlideUp 0.5s ease-in forwards';
            } else {
                item.style.display = 'none';
            }
        });
    }
}

// Project Modal
class ProjectModal {
    constructor() {
        this.modal = document.getElementById('projectModal');
        this.currentSlide = 0;
        this.projectData = {
            'luniel-essence': {
                title: 'Luniel Essence',
                description: 'Edifício residencial de alto padrão com apartamentos de 120 a 200m².',
                location: 'São Paulo, SP',
                area: '15.000 m²',
                units: '120',
                status: 'Em construção',
                features: ['Acabamentos premium', 'Área de lazer completa', 'Segurança 24h', 'Garagem coberta', 'Jardim vertical', 'Spa e academia'],
                images: ['imagens/f1.avif','imagens/f1.avif','imagens/f1.avif']
            },
            'luniel-corporate': {
                title: 'Luniel Corporate',
                description: 'Centro empresarial com 18 andares de escritórios premium.',
                location: 'Rio de Janeiro, RJ',
                area: '25.000 m²',
                units: '18',
                status: 'Lançamento',
                features: ['Certificação LEED Gold', 'Tecnologia de ponta', 'Eficiência energética', 'Segurança avançada', 'Estacionamento robotizado', 'Heliponto'],
                images: ['imagens/f2.avif','imagens/f2.avif','imagens/f2.avif']
            },
            'luniel-garden': {
                title: 'Luniel Garden',
                description: 'Residencial com conceito verde integrado.',
                location: 'Curitiba, PR',
                area: '12.000 m²',
                units: '80',
                status: 'Pronto para morar',
                features: ['Jardins verticais', 'Sustentabilidade', 'Área verde integrada', 'Apartamentos garden', 'Certificação ambiental', 'Horta comunitária'],
                images: ['imagens/f3.png','imagens/f3.png','imagens/f3.png']
            },
            'luniel-boulevard': {
                title: 'Luniel Boulevard',
                description: 'Complexo multiuso com área comercial e residencial.',
                location: 'Belo Horizonte, MG',
                area: '20.000 m²',
                units: '150',
                status: 'Em construção',
                features: ['Complexo multiuso', 'Área comercial', 'Residencial premium', 'Shopping integrado', 'Praça de alimentação', 'Cinema'],
                images: ['imagens/f4.png','imagens/f4.png','imagens/f4.png']
            },
            'luniel-horizon': {
                title: 'Luniel Horizon',
                description: 'Condomínio de casas de alto padrão.',
                location: 'Florianópolis, SC',
                area: '50.000 m²',
                units: '25',
                status: 'Lançamento',
                features: ['Casas de alto padrão', 'Contato com natureza', 'Design sustentável', 'Áreas amplas', 'Lago artificial', 'Trilhas ecológicas'],
                images: ['imagens/f5.png','imagens/f5.png','imagens/f5.png']
            },
            'alto-vale': {
                title: 'Residencial Alto Vale',
                description: 'Condomínio de casas cercado por natureza.',
                location: 'Nova Lima, MG',
                area: '80.000 m²',
                units: '40',
                status: 'Pronto para morar',
                features: ['Cercado por natureza', 'Lotes amplos', 'Arquitetura contemporânea', 'Sustentabilidade', 'Área de lazer completa', 'Segurança 24h'],
                images: ['imagens/f6.jpg','imagens/f6.jpg','imagens/f6.jpg']
            }
        };
    }
    
    openModal(projectId) {
        const project = this.projectData[projectId];
        if (!project || !this.modal) return;
        
        const title = document.getElementById('modalProjectTitle');
        const desc = document.getElementById('modalProjectDescription');
        const loc = document.getElementById('modalProjectLocation');
        const area = document.getElementById('modalProjectArea');
        const units = document.getElementById('modalProjectUnits');
        const status = document.getElementById('modalProjectStatus');
        const features = document.getElementById('modalProjectFeatures');
        
        if (title) title.textContent = project.title;
        if (desc) desc.textContent = project.description;
        if (loc) loc.textContent = project.location;
        if (area) area.textContent = project.area;
        if (units) units.textContent = project.units;
        if (status) status.textContent = project.status;
        
        if (features) {
            features.innerHTML = '';
            project.features.forEach(f => {
                const li = document.createElement('li');
                li.textContent = f;
                features.appendChild(li);
            });
        }
        
        this.loadImages(project.images);
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    loadImages(images) {
        const track = document.getElementById('sliderTrack');
        const dots = document.getElementById('sliderDots');
        if (!track || !dots) return;
        
        track.innerHTML = '';
        dots.innerHTML = '';
        
        images.forEach((image, index) => {
            const img = document.createElement('img');
            img.src = image;
            img.alt = 'Imagem do projeto';
            track.appendChild(img);
            
            const dot = document.createElement('button');
            dot.className = 'slider-dot';
            dot.onclick = () => this.goToSlide(index);
            if (index === 0) dot.classList.add('active');
            dots.appendChild(dot);
        });
        
        this.currentSlide = 0;
    }
    
    goToSlide(index) {
        const track = document.getElementById('sliderTrack');
        const dots = document.querySelectorAll('.slider-dot');
        if (!track) return;
        
        this.currentSlide = index;
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    }
    
    changeSlide(direction) {
        const dots = document.querySelectorAll('.slider-dot');
        const newIndex = (this.currentSlide + direction + dots.length) % dots.length;
        this.goToSlide(newIndex);
    }
    
    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
}

// AI Chatbot
class AIChatbot {
    constructor() {
        this.container = document.getElementById('chatbotContainer');
        this.toggle = document.getElementById('chatbotToggle');
        this.messages = document.getElementById('chatMessages');
        this.input = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('chatSend');
        this.isExpanded = false;
        this.init();
    }
    
    init() {
        if (!this.container) return;
        
        if (this.toggle) {
            this.toggle.addEventListener('click', () => this.toggleChatbot());
        }
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.sendMessage());
        }
        if (this.input) {
            this.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }
        
        setTimeout(() => {
            if (!this.isExpanded) this.showNotification();
        }, 5000);
    }
    
    toggleChatbot() {
        this.isExpanded = !this.isExpanded;
        this.container.classList.toggle('expanded', this.isExpanded);
        if (this.isExpanded && this.input) this.input.focus();
    }
    
    sendMessage() {
        if (!this.input) return;
        const message = this.input.value.trim();
        if (!message) return;
        
        this.addMessage(message, 'user');
        this.input.value = '';
        
        setTimeout(() => this.processMessage(message), 1000);
    }
    
    addMessage(text, sender) {
        if (!this.messages) return;
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `<p>${text}</p>`;
        
        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = 'Agora';
        
        messageDiv.appendChild(content);
        messageDiv.appendChild(time);
        this.messages.appendChild(messageDiv);
        this.messages.scrollTop = this.messages.scrollHeight;
    }
    
    processMessage(message) {
        const lower = message.toLowerCase();
        let response = '';
        
        if (lower.includes('projeto') || lower.includes('empreendimento')) {
            response = 'Temos vários projetos incríveis! Posso te ajudar a encontrar o ideal. Que tipo de imóvel você procura?';
        } else if (lower.includes('investimento') || lower.includes('simular')) {
            response = 'Perfeito! Temos uma calculadora de investimento muito completa.';
        } else if (lower.includes('consultor') || lower.includes('falar')) {
            response = 'Vou conectar você com um de nossos consultores especializados.';
        } else if (lower.includes('preço') || lower.includes('valor')) {
            response = 'Os valores variam conforme o projeto. Posso direcionar para uma proposta personalizada.';
        } else if (lower.includes('localização') || lower.includes('onde')) {
            response = 'Temos empreendimentos em São Paulo, Rio de Janeiro, Curitiba, BH, Floripa e Nova Lima.';
        } else {
            response = 'Obrigado pela mensagem! Posso te ajudar com informações sobre nossos projetos ou conectar com um consultor.';
        }
        
        this.addMessage(response, 'bot');
    }
    
    showNotification() {
        if (!this.isExpanded && this.toggle) {
            this.toggle.style.animation = 'pulse 1s infinite';
        }
    }
}

// Quick message function used in chatbot HTML
function sendQuickMessage(message) {
    const chatbot = window._chatbotInstance;
    if (chatbot) {
        chatbot.addMessage(message, 'user');
        setTimeout(() => chatbot.processMessage(message), 1000);
    }
}

// Initialize premium features when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new InvestmentCalculator();
    new InteractiveGallery();
    window._modalInstance = new ProjectModal();
    window._chatbotInstance = new AIChatbot();
});

// FAQ toggle
document.addEventListener('click', function(e) {
    const faqQuestion = e.target.closest('.faq-question');
    if (faqQuestion) {
        const item = faqQuestion.closest('.faq-item');
        if (item) {
            item.classList.toggle('active');
        }
    }
});

// Dashboard tabs
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('nav-tab')) {
        const tabName = e.target.dataset.tab;
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        const target = document.getElementById(tabName);
        if (target) target.classList.add('active');
    }
});

// Project filter buttons
document.addEventListener('click', function(e) {
    const filtroBtn = e.target.closest('.filtro-btn');
    if (filtroBtn) {
        const filter = filtroBtn.dataset.filter;
        document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
        filtroBtn.classList.add('active');
        
        document.querySelectorAll('.projeto-card-premium').forEach(card => {
            const status = card.dataset.status;
            if (filter === 'todos' || status === filter) {
                card.style.display = '';
                card.style.animation = 'fadeSlideUp 0.5s ease forwards';
            } else {
                card.style.display = 'none';
            }
        });
    }
});