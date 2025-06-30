document.addEventListener('DOMContentLoaded', function() {
    // Navegação suave para links âncora
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Atualiza URL sem recarregar página
                history.pushState(null, null, targetId);
            }
        });
    });
    
    // Menu mobile toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('#main-nav ul');
    
    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            this.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // Header scroll behavior
    const header = document.querySelector('#header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            header.classList.add('hide-header');
        } else {
            header.classList.remove('hide-header');
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Testimonial slider
    const testimonialDots = document.querySelectorAll('.testimonial-dot');
    const testimonialTrack = document.querySelector('.testimonials-track');
    const testimonialPrev = document.querySelector('.testimonial-prev');
    const testimonialNext = document.querySelector('.testimonial-next');
    let currentSlide = 0;
    
    function updateTestimonialSlider(index) {
        if (!testimonialTrack) return;
        
        currentSlide = index;
        
        // Atualizar posição do slider
        testimonialTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Atualizar dots de navegação
        testimonialDots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentSlide);
            dot.setAttribute('aria-current', idx === currentSlide);
        });
    }
    
    if (testimonialDots.length > 0) {
        testimonialDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                updateTestimonialSlider(index);
            });
        });
    }
    
    if (testimonialPrev) {
        testimonialPrev.addEventListener('click', () => {
            const newIndex = (currentSlide - 1 + testimonialDots.length) % testimonialDots.length;
            updateTestimonialSlider(newIndex);
        });
    }
    
    if (testimonialNext) {
        testimonialNext.addEventListener('click', () => {
            const newIndex = (currentSlide + 1) % testimonialDots.length;
            updateTestimonialSlider(newIndex);
        });
    }
    
    // Form validation
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validação básica
            let isValid = true;
            const requiredFields = contactForm.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });
            
            // Validação de email
            const emailField = contactForm.querySelector('input[type="email"]');
            if (emailField && emailField.value) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(emailField.value)) {
                    isValid = false;
                    emailField.classList.add('error');
                }
            }
            
            if (isValid) {
                // Aqui viria a lógica de envio do formulário
                alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
                contactForm.reset();
            } else {
                alert('Por favor, preencha corretamente todos os campos obrigatórios.');
            }
        });
    }
    
    // Back to top button
    const backToTopButton = document.querySelector('.back-to-top');
    
    if (backToTopButton) {
        // Mostrar/ocultar o botão conforme o scroll
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
    }
    
    // Animação de revelação de elementos no scroll
    function revealOnScroll() {
        const revealElements = document.querySelectorAll('.reveal');
        
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('active');
            }
        });
    }
    
    // Adicionar classe 'reveal' aos elementos que queremos animar
    function setupRevealElements() {
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            section.classList.add('reveal');
        });
        
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.classList.add('reveal');
        });
        
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach(card => {
            card.classList.add('reveal');
        });
    }
    
    // Inicializar animações
    setupRevealElements();
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Executar uma vez para elementos já visíveis
    
    // Carrossel automático para depoimentos
    let testimonialInterval;
    
    function startTestimonialCarousel() {
        if (!testimonialTrack) return;
        
        testimonialInterval = setInterval(() => {
            const nextSlide = (currentSlide + 1) % testimonialDots.length;
            updateTestimonialSlider(nextSlide);
        }, 5000);
    }
    
    function stopTestimonialCarousel() {
        if (testimonialInterval) {
            clearInterval(testimonialInterval);
        }
    }
    
    // Pausar carrossel quando hover
    if (testimonialTrack) {
        testimonialTrack.addEventListener('mouseenter', stopTestimonialCarousel);
        testimonialTrack.addEventListener('mouseleave', startTestimonialCarousel);
    }
    
    // Iniciar carrossel
    startTestimonialCarousel();
    
    // Lazy loading de imagens
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                    }
                    
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback para navegadores que não suportam IntersectionObserver
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.getAttribute('data-src');
        });
    }
});

// ==================== PREMIUM FEATURES ====================

// Investment Calculator
class InvestmentCalculator {
    constructor() {
        this.form = document.getElementById('investmentCalculator');
        this.results = document.getElementById('calculatorResults');
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        // Range slider updates
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
        
        // Form submission
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
        
        // Calculations
        const downPaymentAmount = propertyValue * (downPaymentPercent / 100);
        const financedAmount = propertyValue - downPaymentAmount;
        const monthlyInterestRate = interestRate / 100 / 12;
        const totalPayments = financingTerm * 12;
        
        // Monthly payment calculation (PMT formula)
        const monthlyPayment = financedAmount * 
            (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) / 
            (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);
        
        // Appreciation calculation (5 years)
        const futureValue = propertyValue * Math.pow(1 + appreciationRate / 100, 5);
        const appreciationAmount = futureValue - propertyValue;
        
        // ROI calculation
        const totalInvestment = downPaymentAmount + (monthlyPayment * 60); // 5 years of payments
        const roi = ((futureValue - totalInvestment) / totalInvestment) * 100;
        
        // Update results
        this.updateResults({
            downPayment: downPaymentAmount,
            monthlyPayment: monthlyPayment,
            appreciation: appreciationAmount,
            roi: roi
        });
        
        // Show results
        this.results.style.display = 'block';
        this.results.scrollIntoView({ behavior: 'smooth' });
        
        // Create chart
        this.createChart(propertyValue, futureValue, totalInvestment);
    }
    
    updateResults(data) {
        document.getElementById('downPaymentResult').textContent = 
            'R$ ' + data.downPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        
        document.getElementById('monthlyPaymentResult').textContent = 
            'R$ ' + data.monthlyPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        
        document.getElementById('appreciationResult').textContent = 
            'R$ ' + data.appreciation.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        
        document.getElementById('roiResult').textContent = 
            data.roi.toFixed(1) + '%';
    }
    
    createChart(initialValue, futureValue, totalInvestment) {
        const canvas = document.getElementById('investmentChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw chart
        const maxValue = Math.max(initialValue, futureValue, totalInvestment);
        const barWidth = 60;
        const spacing = 40;
        const startX = 50;
        const startY = canvas.height - 80;
        
        // Draw bars
        const bars = [
            { label: 'Valor Inicial', value: initialValue, color: '#314C3D' },
            { label: 'Investimento Total', value: totalInvestment, color: '#D4A95E' },
            { label: 'Valor Futuro', value: futureValue, color: '#496157' }
        ];
        
        bars.forEach((bar, index) => {
            const x = startX + (barWidth + spacing) * index;
            const height = (bar.value / maxValue) * (canvas.height - 120);
            const y = startY - height;
            
            // Draw bar
            ctx.fillStyle = bar.color;
            ctx.fillRect(x, y, barWidth, height);
            
            // Draw label
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(bar.label, x + barWidth/2, startY + 20);
            
            // Draw value
            ctx.fillText('R$ ' + (bar.value/1000).toFixed(0) + 'k', x + barWidth/2, y - 10);
        });
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
                
                // Update active filter
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
                item.style.animation = 'fadeIn 0.5s ease-in';
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
                description: 'Edifício residencial de alto padrão com apartamentos de 120 a 200m², localizado em área privilegiada, com completa infraestrutura de lazer.',
                location: 'São Paulo, SP',
                area: '15.000 m²',
                units: '120',
                status: 'Em construção',
                features: [
                    'Acabamentos premium',
                    'Área de lazer completa',
                    'Segurança 24h',
                    'Garagem coberta',
                    'Jardim vertical',
                    'Spa e academia'
                ],
                images: ['imagens/f1.avif', 'imagens/f1.avif', 'imagens/f1.avif']
            },
            'luniel-corporate': {
                title: 'Luniel Corporate',
                description: 'Centro empresarial com 18 andares de escritórios premium, certificação LEED Gold e tecnologia de ponta em segurança e eficiência energética.',
                location: 'Rio de Janeiro, RJ',
                area: '25.000 m²',
                units: '18',
                status: 'Lançamento',
                features: [
                    'Certificação LEED Gold',
                    'Tecnologia de ponta',
                    'Eficiência energética',
                    'Segurança avançada',
                    'Estacionamento robotizado',
                    'Heliponto'
                ],
                images: ['imagens/f2.avif', 'imagens/f2.avif', 'imagens/f2.avif']
            },
            'luniel-garden': {
                title: 'Luniel Garden',
                description: 'Residencial com conceito verde integrado, fachadas com jardins verticais e apartamentos garden que privilegiam o contato com a natureza.',
                location: 'Curitiba, PR',
                area: '12.000 m²',
                units: '80',
                status: 'Pronto para morar',
                features: [
                    'Jardins verticais',
                    'Sustentabilidade',
                    'Área verde integrada',
                    'Apartamentos garden',
                    'Certificação ambiental',
                    'Horta comunitária'
                ],
                images: ['imagens/f3.png', 'imagens/f3.png', 'imagens/f3.png']
            },
            'luniel-boulevard': {
                title: 'Luniel Boulevard',
                description: 'Complexo multiuso com área comercial no térreo e residencial nos andares superiores, integrando conveniência e sofisticação.',
                location: 'Belo Horizonte, MG',
                area: '20.000 m²',
                units: '150',
                status: 'Em construção',
                features: [
                    'Complexo multiuso',
                    'Área comercial',
                    'Residencial premium',
                    'Shopping integrado',
                    'Praça de alimentação',
                    'Cinema'
                ],
                images: ['imagens/f4.png', 'imagens/f4.png', 'imagens/f4.png']
            },
            'luniel-horizon': {
                title: 'Luniel Horizon',
                description: 'Condomínio de casas de alto padrão em contato com a natureza, com áreas de 350 a 500m² e design contemporâneo sustentável.',
                location: 'Florianópolis, SC',
                area: '50.000 m²',
                units: '25',
                status: 'Lançamento',
                features: [
                    'Casas de alto padrão',
                    'Contato com natureza',
                    'Design sustentável',
                    'Áreas amplas',
                    'Lago artificial',
                    'Trilhas ecológicas'
                ],
                images: ['imagens/f5.png', 'imagens/f5.png', 'imagens/f5.png']
            },
            'alto-vale': {
                title: 'Residencial Alto Vale',
                description: 'Condomínio de casas de alto padrão cercado por natureza, com lotes amplos e arquitetura contemporânea e sustentável.',
                location: 'Nova Lima, MG',
                area: '80.000 m²',
                units: '40',
                status: 'Pronto para morar',
                features: [
                    'Cercado por natureza',
                    'Lotes amplos',
                    'Arquitetura contemporânea',
                    'Sustentabilidade',
                    'Área de lazer completa',
                    'Segurança 24h'
                ],
                images: ['imagens/f6.jpg', 'imagens/f6.jpg', 'imagens/f6.jpg']
            }
        };
    }
    
    openModal(projectId) {
        const project = this.projectData[projectId];
        if (!project) return;
        
        // Update modal content
        document.getElementById('modalProjectTitle').textContent = project.title;
        document.getElementById('modalProjectDescription').textContent = project.description;
        document.getElementById('modalProjectLocation').textContent = project.location;
        document.getElementById('modalProjectArea').textContent = project.area;
        document.getElementById('modalProjectUnits').textContent = project.units;
        document.getElementById('modalProjectStatus').textContent = project.status;
        
        // Update features
        const featuresList = document.getElementById('modalProjectFeatures');
        featuresList.innerHTML = '';
        project.features.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            featuresList.appendChild(li);
        });
        
        // Load images
        this.loadImages(project.images);
        
        // Show modal
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    loadImages(images) {
        const track = document.getElementById('sliderTrack');
        const dots = document.getElementById('sliderDots');
        
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
        
        this.currentSlide = index;
        track.style.transform = `translateX(-${index * 100}%)`;
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    changeSlide(direction) {
        const dots = document.querySelectorAll('.slider-dot');
        const newIndex = (this.currentSlide + direction + dots.length) % dots.length;
        this.goToSlide(newIndex);
    }
    
    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
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
        
        // Toggle chatbot
        this.toggle.addEventListener('click', () => {
            this.toggleChatbot();
        });
        
        // Send message
        this.sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Enter key
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Auto-expand after 5 seconds
        setTimeout(() => {
            if (!this.isExpanded) {
                this.showNotification();
            }
        }, 5000);
    }
    
    toggleChatbot() {
        this.isExpanded = !this.isExpanded;
        this.container.classList.toggle('expanded', this.isExpanded);
        
        if (this.isExpanded) {
            this.input.focus();
        }
    }
    
    sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        this.input.value = '';
        
        // Simulate bot response
        setTimeout(() => {
            this.processMessage(message);
        }, 1000);
    }
    
    addMessage(text, sender) {
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
        const lowerMessage = message.toLowerCase();
        let response = '';
        
        if (lowerMessage.includes('projeto') || lowerMessage.includes('empreendimento')) {
            response = 'Temos vários projetos incríveis! Posso te ajudar a encontrar o ideal. Que tipo de imóvel você procura: residencial, comercial ou multiuso?';
        } else if (lowerMessage.includes('investimento') || lowerMessage.includes('simular')) {
            response = 'Perfeito! Temos uma calculadora de investimento muito completa. Vou te direcionar para ela. Você pode simular financiamento, ROI e valorização!';
        } else if (lowerMessage.includes('consultor') || lowerMessage.includes('falar')) {
            response = 'Ótimo! Vou conectar você com um de nossos consultores especializados. Eles vão te ajudar com todas as dúvidas e mostrar as melhores oportunidades.';
        } else if (lowerMessage.includes('preço') || lowerMessage.includes('valor')) {
            response = 'Os valores variam conforme o projeto e localização. Posso te direcionar para nossa calculadora ou conectar com um consultor para uma proposta personalizada.';
        } else if (lowerMessage.includes('localização') || lowerMessage.includes('onde')) {
            response = 'Temos empreendimentos em São Paulo, Rio de Janeiro, Curitiba, Belo Horizonte, Florianópolis e Nova Lima. Qual região te interessa mais?';
        } else {
            response = 'Obrigado pela mensagem! Sou o assistente virtual da Luniel e posso te ajudar com informações sobre nossos projetos, simulações de investimento ou conectar você com um consultor. Como posso te ajudar?';
        }
        
        this.addMessage(response, 'bot');
    }
    
    showNotification() {
        if (!this.isExpanded) {
            this.toggle.style.animation = 'pulse 1s infinite';
        }
    }
}

// Interactive Map
class InteractiveMap {
    constructor() {
        this.mapContainer = document.getElementById('interactiveMap');
        this.locationItems = document.querySelectorAll('.location-item');
        this.init();
    }
    
    init() {
        if (!this.mapContainer) return;
        
        // Create simple map visualization
        this.createMapVisualization();
        
        // Location item interactions
        this.locationItems.forEach(item => {
            item.addEventListener('click', () => {
                this.highlightLocation(item.dataset.location);
            });
        });
    }
    
    createMapVisualization() {
        const canvas = document.createElement('canvas');
        canvas.width = this.mapContainer.offsetWidth;
        canvas.height = this.mapContainer.offsetHeight;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        
        const ctx = canvas.getContext('2d');
        
        // Draw Brazil outline (simplified)
        ctx.strokeStyle = '#314C3D';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(100, 200);
        ctx.lineTo(300, 150);
        ctx.lineTo(400, 250);
        ctx.lineTo(350, 350);
        ctx.lineTo(200, 400);
        ctx.lineTo(100, 300);
        ctx.closePath();
        ctx.stroke();
        
        // Draw location markers
        const locations = [
            { x: 150, y: 180, name: 'São Paulo', status: 'construction' },
            { x: 200, y: 220, name: 'Rio de Janeiro', status: 'launch' },
            { x: 180, y: 280, name: 'Curitiba', status: 'ready' },
            { x: 220, y: 320, name: 'Belo Horizonte', status: 'construction' },
            { x: 250, y: 350, name: 'Florianópolis', status: 'launch' },
            { x: 240, y: 300, name: 'Nova Lima', status: 'ready' }
        ];
        
        locations.forEach(location => {
            ctx.fillStyle = this.getStatusColor(location.status);
            ctx.beginPath();
            ctx.arc(location.x, location.y, 8, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
        
        this.mapContainer.innerHTML = '';
        this.mapContainer.appendChild(canvas);
    }
    
    getStatusColor(status) {
        switch(status) {
            case 'construction': return '#ff9800';
            case 'launch': return '#2196f3';
            case 'ready': return '#4caf50';
            default: return '#314C3D';
        }
    }
    
    highlightLocation(locationId) {
        // Remove previous highlights
        this.locationItems.forEach(item => {
            item.style.background = '';
            item.style.color = '';
        });
        
        // Highlight selected location
        const selectedItem = document.querySelector(`[data-location="${locationId}"]`);
        if (selectedItem) {
            selectedItem.style.background = 'var(--color-primary)';
            selectedItem.style.color = 'var(--color-white)';
        }
    }
}

// Loading Manager
class LoadingManager {
    constructor() {
        this.overlay = document.getElementById('loadingOverlay');
    }
    
    show() {
        if (this.overlay) {
            this.overlay.classList.add('show');
        }
    }
    
    hide() {
        if (this.overlay) {
            this.overlay.classList.remove('show');
        }
    }
}

// Initialize all premium features
document.addEventListener('DOMContentLoaded', function() {
    // Initialize premium features
    new InvestmentCalculator();
    new InteractiveGallery();
    new ProjectModal();
    new AIChatbot();
    new InteractiveMap();
    new LoadingManager();
    
    // Global functions for onclick handlers
    window.openProjectModal = function(projectId) {
        const modal = new ProjectModal();
        modal.openModal(projectId);
    };
    
    window.closeProjectModal = function() {
        const modal = new ProjectModal();
        modal.closeModal();
    };
    
    window.changeSlide = function(direction) {
        const modal = new ProjectModal();
        modal.changeSlide(direction);
    };
    
    window.sendQuickMessage = function(message) {
        const chatbot = new AIChatbot();
        chatbot.addMessage(message, 'user');
        setTimeout(() => {
            chatbot.processMessage(message);
        }, 500);
    };
});

// Newsletter enhancement
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            // Show success message
            const button = this.querySelector('button');
            const originalText = button.textContent;
            button.textContent = '✓ Inscrito!';
            button.style.background = '#4caf50';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
                this.reset();
            }, 3000);
        });
    }
});

// Parallax effect for hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Smooth reveal animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function() {
    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => observer.observe(el));
});

// ==================== FUNCIONALIDADES PARA PÁGINA DE PROJETOS ====================

// Filtros de Projetos Simplificados
class ProjectFilters {
    constructor() {
        this.projects = document.querySelectorAll('.projeto-card-premium');
        this.categoriaBtns = document.querySelectorAll('[data-categoria]');
        this.activeCategoria = 'todos';
        
        this.init();
    }
    
    init() {
        // Event listeners para filtros de categoria
        this.categoriaBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.categoriaBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.activeCategoria = e.target.dataset.categoria;
                this.filterProjects();
            });
        });
    }
    
    filterProjects() {
        this.projects.forEach(project => {
            const categoria = project.dataset.categoria;
            
            if (this.activeCategoria === 'todos' || categoria === this.activeCategoria) {
                project.style.display = 'flex';
                project.style.animation = 'slideInUp 0.5s ease forwards';
            } else {
                project.style.display = 'none';
            }
        });
    }
}

// ==================== INICIALIZAÇÃO ====================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar filtros de projetos se estiver na página de projetos
    if (document.querySelector('.projeto-card-premium')) {
        new ProjectFilters();
    }
    
    // Header scroll effect
    const header = document.getElementById('header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            header.classList.add('hide-header');
        } else {
            header.classList.remove('hide-header');
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    
    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenuBtn.classList.toggle('active');
            mainNav.classList.toggle('active');
            
            const isExpanded = mainNav.classList.contains('active');
            mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
        });
    }
    
    // Smooth scroll para links internos
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Animações de entrada para elementos
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, observerOptions);
    
    // Observar elementos para animação
    const animateElements = document.querySelectorAll('.projeto-card-premium, .filtro-btn, .cta-content');
    animateElements.forEach(el => {
        observer.observe(el);
    });
});

// ==================== FUNCIONALIDADES GERAIS ====================

// Loading overlay
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('show');
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('show');
    }
}

// Newsletter form
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('#newsletter-email').value;
        
        // Simular envio
        showLoading();
        setTimeout(() => {
            hideLoading();
            alert('Obrigado por se inscrever! Você receberá nossas novidades em breve.');
            this.reset();
        }, 1500);
    });
}

// WhatsApp button hover effect
const whatsappBtn = document.querySelector('.whatsapp-btn');
if (whatsappBtn) {
    whatsappBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
    });
    
    whatsappBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
}

function fillDemoCredentials() {
    document.getElementById('loginEmail').value = 'demo@luniel.com.br';
    document.getElementById('loginPassword').value = 'demo123';
}

// Impede o recarregamento do formulário de login demo
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        // Você pode adicionar aqui um alerta ou lógica de simulação de login
        alert('Login demonstrativo preenchido!');
    });
}