// Flag to prevent multiple executions
let isMainInitialized = false;

document.addEventListener('includesLoaded', () => {
    if (isMainInitialized) {
        console.log('main.js already initialized, skipping');
        return;
    }
    initializeMain();
});

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (!isMainInitialized) {
            console.warn('includesLoaded event not fired, triggering manually');
            initializeMain();
        }
    }, 1000);
});

function initializeMain() {
    isMainInitialized = true;
    console.log('Includes loaded, initializing main.js');

    let galleryData = null;
    let heroImages = [];
    let currentHeroIndex = 0;
    let heroInterval = null;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.src = entry.target.dataset.src;
                observer.unobserve(entry.target);
            }
        });
    });

    const lazyLoadImages = () => {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => observer.observe(img));
    };

    // =============================
    // HAMBURGER MENU LOGIC
    // =============================
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav-menu');
    const body = document.body;

    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    body.appendChild(overlay);

    if (hamburger && nav) {
        console.log('Hamburger and nav found, setting up menu');
        const toggleMenu = () => {
            console.log('Toggling menu, current active state:', nav.classList.contains('active'));
            console.log('Nav styles:', nav.style.cssText);
            nav.classList.toggle('active');
            overlay.classList.toggle('active');
            hamburger.innerHTML = nav.classList.contains('active') ? '✕' : '☰';
        };

        // Toggle menu
        hamburger.addEventListener("click", () => {
            nav.classList.toggle("active");
        });

        // Close menu when a link is clicked
        document.querySelectorAll(".nav-menu a").forEach(link => {
            link.addEventListener("click", () => {
                nav.classList.remove("active");
            });
        });

        // Close menu when clicking the overlay
        overlay.addEventListener('click', () => {
            console.log('Overlay clicked, closing menu');
            nav.classList.remove('active');
            overlay.classList.remove('active');
            hamburger.innerHTML = '☰';
        });

        // Close menu when clicking outside
        document.addEventListener("click", (event) => {
            if (!nav.contains(event.target) && !hamburger.contains(event.target)) {
                nav.classList.remove("active");
            }
        });
    } else {
        console.error('Hamburger or nav not found:', { hamburger, nav });
    }

    // =============================
    // HERO SLIDER LOGIC
    // =============================
    const heroSlider = document.querySelector('.hero-slider');

    const showHeroSlide = (index) => {
        heroImages.forEach((img, i) => {
            img.classList.toggle('active', i === index);
        });
    };

    const nextHeroSlide = () => {
        currentHeroIndex = (currentHeroIndex + 1) % heroImages.length;
        showHeroSlide(currentHeroIndex);
    };

    const startHeroCarousel = () => {
        if (heroInterval) clearInterval(heroInterval);
        heroInterval = setInterval(nextHeroSlide, 1500);

        // Add click to skip
        heroSlider.addEventListener('click', () => {
            nextHeroSlide();
        });
    };

    if (heroSlider) {
        console.log('Hero slider found, loading carousel');
        fetch('assets/data/hero-carousel.json')
            .then(response => {
                if (!response.ok) throw new Error('Failed to load hero-carousel.json');
                return response.json();
            })
            .then(images => {
                heroSlider.innerHTML = ''; // Clear any existing content
                heroImages = [];

                images.forEach((image, index) => {
                    const img = document.createElement('img');
                    img.dataset.src = image.url;
                    img.alt = image.alt || '';
                    img.className = index === 0 ? 'active' : '';
                    img.style.transition = 'opacity 1s ease-in-out';
                    img.style.position = 'absolute';
                    img.style.top = '0';
                    img.style.left = '50%';
                    img.style.transform = 'translateX(-50%)';
                    img.style.height = '100%';
                    img.style.width = 'auto';
                    img.style.maxWidth = '100%';
                    img.style.objectFit = 'contain';
                    img.style.pointerEvents = 'none';

                    heroImages.push(img);
                    heroSlider.appendChild(img);
                });

                // Lazy load and start carousel
                lazyLoadImages();
                startHeroCarousel();
            })
            .catch(error => console.error('Error loading hero-carousel.json:', error));
    }

    // =============================
    // GALLERY LOGIC
    // =============================
    const renderGallery = (category) => {
        const galleries = document.getElementById('galleries');
        if (galleries) {
            galleries.innerHTML = ''; // Clear previous gallery

            if (!galleryData || !galleryData[category]) return;

            const section = document.createElement('section');
            section.className = 'gallery-section';
            section.innerHTML = `
                 <div class="gallery-grid"></div>
            `;
            galleries.appendChild(section);

            const grid = section.querySelector('.gallery-grid');

            galleryData[category].forEach(image => {
                const a = document.createElement('a');
                a.href = image.url;
                a.setAttribute('data-lightbox', category);
                a.setAttribute('data-title', image.description);

                const img = document.createElement('img');
                img.dataset.src = image.url;
                img.alt = image.title || '';
                img.className = image.width > image.height ? 'landscape' : 'portrait';

                a.appendChild(img);
                grid.appendChild(a);
            });

            lazyLoadImages();
        }
    };

    const galleryLinks = document.getElementById('gallery-links');
    if (galleryLinks) {
        console.log('Gallery links found, setting up navigation');
        // Clear existing links to prevent duplicates
        galleryLinks.innerHTML = '';
        fetch('assets/data/images.json')
            .then(response => {
                if (!response.ok) throw new Error('Failed to load images.json');
                return response.json();
            })
            .then(data => {
                galleryData = data;
                const categories = Object.keys(data);

                categories.forEach((category, index) => {
                    const li = document.createElement('li');
                    const button = document.createElement('button');
                    button.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                    button.dataset.category = category;

                    if (index === 0) {
                        button.classList.add('active');
                        renderGallery(category);
                    }

                    button.addEventListener('click', () => {
                        console.log(`Gallery button clicked: ${category}`);
                        document.querySelectorAll('#gallery-links button').forEach(btn => btn.classList.remove('active'));
                        button.classList.add('active');
                        renderGallery(category);
                    });

                    li.appendChild(button);
                    galleryLinks.appendChild(li);
                });
            })
            .catch(error => console.error('Error loading images.json:', error));
    }
}