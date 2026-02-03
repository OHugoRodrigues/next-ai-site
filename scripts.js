/* ============================================
   NEXUS AI - Premium JavaScript
   Interatividade, i18n, Animações Avançadas
   ============================================ */

// === i18n System ===
const i18n = {
    currentLang: 'pt-BR',
    translations: {},
    isInitialized: false,

    async init() {
        console.log('[i18n] Initializing...');

        // Setup buttons FIRST
        this.setupLangButtons();

        // Then load saved language
        const savedLang = localStorage.getItem('nexus-lang') || 'pt-BR';
        console.log('[i18n] Saved language:', savedLang);

        await this.setLanguage(savedLang);
        this.isInitialized = true;
        console.log('[i18n] Initialized successfully');
    },

    async loadTranslation(lang) {
        try {
            console.log('[i18n] Loading translation for:', lang);
            const response = await fetch(`./i18n/${lang}.json`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Translation file not found`);
            }
            const data = await response.json();
            console.log('[i18n] Loaded translation:', lang, Object.keys(data));
            return data;
        } catch (error) {
            console.error(`[i18n] Error loading ${lang}:`, error);
            return null;
        }
    },

    async setLanguage(lang) {
        console.log('[i18n] Setting language to:', lang);

        const translation = await this.loadTranslation(lang);
        if (!translation) {
            console.error('[i18n] Failed to load translation, aborting');
            return;
        }

        this.currentLang = lang;
        this.translations = translation;
        localStorage.setItem('nexus-lang', lang);
        document.documentElement.lang = lang;

        this.updateAllTexts();
        this.updateLangButtons();

        console.log('[i18n] Language set to:', lang);
    },

    setupLangButtons() {
        const selector = document.querySelector('.lang-selector');
        if (!selector) {
            console.error('[i18n] Lang selector not found');
            return;
        }

        console.log('[i18n] Setting up language selector with event delegation');

        // Use event delegation on the parent container
        selector.addEventListener('click', (e) => {
            const btn = e.target.closest('.lang-btn');
            if (!btn) return;

            e.preventDefault();
            e.stopPropagation();

            const lang = btn.dataset.lang;
            console.log('[i18n] Button clicked for language:', lang);

            if (lang && lang !== this.currentLang) {
                this.setLanguage(lang);
            }
        });
    },

    updateLangButtons() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            const isActive = btn.dataset.lang === this.currentLang;
            btn.classList.toggle('active', isActive);
        });
    },

    get(path) {
        const result = path.split('.').reduce((obj, key) => obj?.[key], this.translations);
        return result !== undefined ? result : path;
    },

    updateAllTexts() {
        const elements = document.querySelectorAll('[data-i18n]');
        console.log('[i18n] Updating', elements.length, 'text elements');

        elements.forEach(el => {
            const key = el.dataset.i18n;
            const text = this.get(key);
            if (text && typeof text === 'string') {
                el.textContent = text;
            }
        });
    }
};

// === Scroll Reveal with Stagger ===
const scrollReveal = {
    observer: null,

    init() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -80px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, options);

        document.querySelectorAll('.reveal').forEach(el => {
            this.observer.observe(el);
        });
    }
};

// === Header Scroll Effect ===
const headerScroll = {
    header: null,
    lastScroll: 0,

    init() {
        this.header = document.querySelector('.header');
        if (!this.header) return;

        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            this.header.classList.toggle('scrolled', currentScroll > 50);
            this.lastScroll = currentScroll;
        }, { passive: true });
    }
};

// === Smooth Scroll ===
const smoothScroll = {
    init() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                    const targetPosition = target.offsetTop - headerHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open
                    mobileMenu.close();
                }
            });
        });
    }
};

// === Mobile Menu ===
const mobileMenu = {
    btn: null,
    nav: null,
    isOpen: false,

    init() {
        this.btn = document.querySelector('.mobile-menu-btn');
        this.nav = document.querySelector('.nav');

        if (!this.btn || !this.nav) return;

        this.btn.addEventListener('click', () => this.toggle());

        this.nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => this.close());
        });

        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.btn.contains(e.target) && !this.nav.contains(e.target)) {
                this.close();
            }
        });
    },

    toggle() {
        this.isOpen = !this.isOpen;
        this.nav.classList.toggle('mobile-open', this.isOpen);
        this.btn.classList.toggle('active', this.isOpen);
        document.body.style.overflow = this.isOpen ? 'hidden' : '';
    },

    close() {
        this.isOpen = false;
        this.nav.classList.remove('mobile-open');
        this.btn.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// === Counter Animation ===
const counterAnimation = {
    init() {
        const counters = document.querySelectorAll('.stat-value');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    },

    animateCounter(element) {
        const text = element.textContent;
        const match = text.match(/(\d+)/);
        if (!match) return;

        const target = parseInt(match[1]);
        const prefix = text.substring(0, text.indexOf(match[1]));
        const suffix = text.substring(text.indexOf(match[1]) + match[1].length);
        const duration = 2000;
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.round(target * easeOutQuart);

            element.textContent = prefix + current + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    }
};

// === Cursor Glow Effect ===
const cursorGlow = {
    init() {
        if (window.matchMedia('(pointer: coarse)').matches) return;

        const glow = document.createElement('div');
        glow.className = 'cursor-glow';
        glow.style.cssText = `
      position: fixed;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(0,229,160,0.08) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
      transform: translate(-50%, -50%);
      transition: opacity 0.3s ease;
    `;
        document.body.appendChild(glow);

        let mouseX = 0, mouseY = 0;
        let glowX = 0, glowY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const animate = () => {
            glowX += (mouseX - glowX) * 0.1;
            glowY += (mouseY - glowY) * 0.1;
            glow.style.left = glowX + 'px';
            glow.style.top = glowY + 'px';
            requestAnimationFrame(animate);
        };
        animate();
    }
};

// === Tilt Effect on Cards ===
const tiltEffect = {
    init() {
        if (window.matchMedia('(pointer: coarse)').matches) return;

        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }
};

// === Evolution Premium Visuals ===
const evolutionVisuals = {
    init() {
        const visuals = document.querySelectorAll('.evolution-visual');
        if (!visuals.length) return;

        visuals.forEach((visual, index) => {
            this.addDataParticles(visual, index);
            this.addMetricIndicators(visual, index);
            this.addConnectionLines(visual);
        });
    },

    addDataParticles(container, genIndex) {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'data-particles';
        particleContainer.style.cssText = `
            position: absolute;
            inset: 0;
            overflow: hidden;
            pointer-events: none;
        `;

        // Create floating data particles
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'data-particle';
            const size = 4 + Math.random() * 6;
            const delay = Math.random() * 5;
            const duration = 8 + Math.random() * 6;
            const left = 10 + Math.random() * 80;

            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${this.getGradientColor(genIndex)};
                border-radius: 50%;
                left: ${left}%;
                bottom: -20px;
                opacity: 0;
                box-shadow: 0 0 ${size * 2}px ${this.getGlowColor(genIndex)};
                animation: float-particle ${duration}s ${delay}s ease-in-out infinite;
            `;
            particleContainer.appendChild(particle);
        }

        container.appendChild(particleContainer);
    },

    addMetricIndicators(container, genIndex) {
        const metrics = this.getMetricsForGen(genIndex);

        metrics.forEach((metric, i) => {
            const indicator = document.createElement('div');
            indicator.className = 'metric-indicator';
            indicator.style.cssText = `
                position: absolute;
                ${metric.position};
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(10px);
                border: 1px solid ${this.getBorderColor(genIndex)};
                border-radius: 12px;
                padding: 8px 14px;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.75rem;
                color: rgba(255, 255, 255, 0.9);
                animation: fade-in-metric 1s ${0.5 + i * 0.2}s ease-out forwards;
                opacity: 0;
                z-index: 20;
            `;

            indicator.innerHTML = `
                <span style="display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; background: ${this.getGradientColor(genIndex)}; border-radius: 6px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #030712;">
                        ${metric.icon}
                    </svg>
                </span>
                <span style="font-weight: 600; color: ${this.getTextColor(genIndex)};">${metric.value}</span>
                <span style="opacity: 0.7;">${metric.label}</span>
            `;

            container.appendChild(indicator);
        });
    },

    addConnectionLines(container) {
        const linesContainer = document.createElement('div');
        linesContainer.className = 'connection-lines';
        linesContainer.style.cssText = `
            position: absolute;
            inset: 0;
            pointer-events: none;
            overflow: hidden;
        `;

        // Add animated connection lines
        for (let i = 0; i < 3; i++) {
            const line = document.createElement('div');
            line.className = 'connection-line';
            const top = 20 + Math.random() * 60;
            const delay = i * 2;

            line.style.cssText = `
                position: absolute;
                top: ${top}%;
                left: 0;
                width: 100%;
                height: 1px;
                background: linear-gradient(90deg, transparent, rgba(0, 229, 160, 0.3), transparent);
                animation: pulse-line 4s ${delay}s ease-in-out infinite;
            `;
            linesContainer.appendChild(line);
        }

        container.appendChild(linesContainer);
    },

    getMetricsForGen(genIndex) {
        const allMetrics = [
            // Gen 1 - Qualidade
            [
                { position: 'top: 8%; left: 5%', value: '99.7%', label: 'Detecção', icon: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>' },
                { position: 'bottom: 15%; right: 0%', value: '<50ms', label: 'Latência', icon: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' }
            ],
            // Gen 2 - Disponibilidade
            [
                { position: 'top: 5%; right: 5%', value: '98.5%', label: 'Uptime', icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
                { position: 'bottom: 20%; left: 0%', value: '+40%', label: 'MTBF', icon: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>' }
            ],
            // Gen 3 - Performance
            [
                { position: 'top: 10%; left: 0%', value: '3x', label: 'Escala', icon: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>' },
                { position: 'bottom: 12%; right: 5%', value: '85%+', label: 'OEE', icon: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' }
            ],
            // Gen 4 - Preditivo
            [
                { position: 'top: 8%; right: 0%', value: '72h', label: 'Antecipação', icon: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' },
                { position: 'bottom: 18%; left: 5%', value: '-60%', label: 'Paradas', icon: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>' }
            ],
            // Gen 5 - Global
            [
                { position: 'top: 5%; left: 5%', value: '∞', label: 'Fábricas', icon: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"/>' },
                { position: 'bottom: 15%; right: 0%', value: 'AI', label: 'Autônomo', icon: '<path d="M12 2v4"/><path d="m19.07 4.93-2.83 2.83"/><path d="M22 12h-4"/><path d="m19.07 19.07-2.83-2.83"/>' }
            ]
        ];
        return allMetrics[genIndex] || allMetrics[0];
    },

    getGradientColor(index) {
        const colors = [
            'linear-gradient(135deg, #00E5A0, #00B4D8)',
            'linear-gradient(135deg, #00CED1, #00B4D8)',
            'linear-gradient(135deg, #00B4D8, #0077B6)',
            'linear-gradient(135deg, #6366F1, #7C3AED)',
            'linear-gradient(135deg, #8B5CF6, #A855F7)'
        ];
        return colors[index] || colors[0];
    },

    getGlowColor(index) {
        const colors = ['rgba(0, 229, 160, 0.5)', 'rgba(0, 180, 216, 0.5)', 'rgba(0, 180, 216, 0.5)', 'rgba(99, 102, 241, 0.5)', 'rgba(139, 92, 246, 0.5)'];
        return colors[index] || colors[0];
    },

    getBorderColor(index) {
        const colors = ['rgba(0, 229, 160, 0.3)', 'rgba(0, 180, 216, 0.3)', 'rgba(0, 180, 216, 0.3)', 'rgba(99, 102, 241, 0.3)', 'rgba(139, 92, 246, 0.3)'];
        return colors[index] || colors[0];
    },

    getTextColor(index) {
        const colors = ['#00E5A0', '#00B4D8', '#00B4D8', '#818CF8', '#A78BFA'];
        return colors[index] || colors[0];
    }
};

// === Add Premium CSS Animations ===
const premiumAnimations = document.createElement('style');
premiumAnimations.textContent = `
    @keyframes float-particle {
        0%, 100% {
            transform: translateY(0) scale(0);
            opacity: 0;
        }
        10% {
            opacity: 0.8;
            transform: translateY(-20px) scale(1);
        }
        90% {
            opacity: 0.6;
            transform: translateY(-300px) scale(0.8);
        }
        100% {
            opacity: 0;
            transform: translateY(-350px) scale(0);
        }
    }

    @keyframes fade-in-metric {
        0% {
            opacity: 0;
            transform: translateY(10px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes pulse-line {
        0%, 100% {
            opacity: 0;
            transform: scaleX(0);
        }
        50% {
            opacity: 0.5;
            transform: scaleX(1);
        }
    }

    .evolution-visual:hover .metric-indicator {
        transform: scale(1.05);
        border-color: rgba(0, 229, 160, 0.5);
    }

    .metric-indicator {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(premiumAnimations);

// === Initialize ===
document.addEventListener('DOMContentLoaded', () => {
    i18n.init();
    scrollReveal.init();
    headerScroll.init();
    smoothScroll.init();
    mobileMenu.init();
    counterAnimation.init();
    cursorGlow.init();
    tiltEffect.init();
    evolutionVisuals.init();
});

// === Mobile Menu Styles ===
const mobileStyles = document.createElement('style');
mobileStyles.textContent = `
  @media (max-width: 768px) {
    .nav {
      position: fixed;
      top: 70px;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(3, 7, 18, 0.98);
      backdrop-filter: blur(20px);
      display: flex;
      flex-direction: column;
      padding: 40px 24px;
      transform: translateX(100%);
      opacity: 0;
      visibility: hidden;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 999;
    }
    
    .nav.mobile-open {
      transform: translateX(0);
      opacity: 1;
      visibility: visible;
    }
    
    .nav-links {
      flex-direction: column;
      gap: 24px;
    }
    
    .nav-link {
      font-size: 1.25rem;
    }
    
    .lang-selector {
      margin-top: 32px;
    }
    
    .mobile-menu-btn.active .hamburger span:nth-child(1) {
      transform: rotate(45deg) translate(4px, 4px);
    }
    
    .mobile-menu-btn.active .hamburger span:nth-child(2) {
      opacity: 0;
    }
    
    .mobile-menu-btn.active .hamburger span:nth-child(3) {
      transform: rotate(-45deg) translate(4px, -4px);
    }
  }
`;
document.head.appendChild(mobileStyles);
