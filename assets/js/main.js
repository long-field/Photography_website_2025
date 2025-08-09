/* Changes:
- Modified hamburger menu logic to prevent .nav-overlay from intercepting link clicks.
- Changed overlay event listener to use pointer-events: none in CSS when menu is active, ensuring it doesn't capture clicks over .nav-menu.
- Kept setTimeout for menu closing to ensure navigation occurs first.
- No changes to gallery, hero, or about carousel logic.
*/

let isMainInitialized = false;

document.addEventListener('includesLoaded', () => {
    if (isMainInitialized) {
        return;
    }
    initializeMain();
});

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (!isMainInitialized) {
            initializeMain();
        }
    }, 1000);
});

function initializeMain() {
    isMainInitialized = true;

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
        // Toggle menu function
        const toggleMenu = () => {
            nav.classList.toggle('active');
            overlay.classList.toggle('active');
            hamburger.innerHTML = nav.classList.contains('active') ? '✕' : '☰';
        };

        // Hamburger click toggles menu
        hamburger.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent outside click handler
            toggleMenu();
        });

        // Link clicks close menu and allow navigation
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', (event) => {
                // Delay menu closing to ensure navigation occurs
                setTimeout(() => {
                    nav.classList.remove('active');
                    overlay.classList.remove('active');
                    hamburger.innerHTML = '☰';
                }, 100);
            });
        });

        // Overlay click closes menu
        overlay.addEventListener('click', (event) => {
            // Only close if clicking the overlay itself, not its children
            if (event.target === overlay) {
                nav.classList.remove('active');
                overlay.classList.remove('active');
                hamburger.innerHTML = '☰';
            }
        });

        // Outside click closes menu
        document.addEventListener('click', (event) => {
            if (!nav.contains(event.target) && !hamburger.contains(event.target) && nav.classList.contains('active')) {
                nav.classList.remove('active');
                overlay.classList.remove('active');
                hamburger.innerHTML = '☰';
            }
        });
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
        fetch('assets/data/hero-carousel.json')
            .then(response => {
                if (!response.ok) throw new Error('Failed to load hero-carousel.json');
                return response.json();
            })
            .then(images => {
                heroSlider.innerHTML = '';
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

                lazyLoadImages();
                startHeroCarousel();
            })
            .catch(error => console.error('Error loading hero-carousel.json:', error));
    }

    // =============================
    // ABOUT CAROUSEL LOGIC
    // =============================
    const aboutCarousel = document.querySelector('.about-carousel');
    let aboutImages = [];
    let currentAboutIndex = 0;
    let aboutInterval = null;

    const showAboutSlide = (index) => {
        aboutImages.forEach((img, i) => {
            img.classList.toggle('active', i === index);
        });
    };

    const nextAboutSlide = () => {
        currentAboutIndex = (currentAboutIndex + 1) % aboutImages.length;
        showAboutSlide(currentAboutIndex);
    };

    const startAboutCarousel = () => {
        if (aboutInterval) clearInterval(aboutInterval);
        aboutInterval = setInterval(nextAboutSlide, 3000);
    };

    if (aboutCarousel) {
        fetch('assets/data/about-carousel.json')
            .then(response => {
                if (!response.ok) throw new Error('Failed to load about-carousel.json');
                return response.json();
            })
            .then(images => {
                aboutCarousel.innerHTML = '';
                aboutImages = [];

                images.forEach((image, index) => {
                    const img = document.createElement('img');
                    img.dataset.src = image.url;
                    img.alt = image.alt || '';
                    img.className = index === 0 ? 'active' : '';

                    aboutImages.push(img);
                    aboutCarousel.appendChild(img);
                });

                lazyLoadImages();
                startAboutCarousel();
            })
            .catch(error => console.error('Error loading about-carousel.json:', error));
    }

    // =============================
    // GALLERY LOGIC
    // =============================
    const renderGallery = (category) => {
        const galleries = document.getElementById('galleries');
        if (galleries) {
            galleries.innerHTML = '';

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
                img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
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
    const gallerySelect = document.createElement('select');
    gallerySelect.className = 'gallery-select';
    if (galleryLinks) {
        galleryLinks.parentNode.insertBefore(gallerySelect, galleryLinks.nextSibling);
    }

    if (galleryLinks) {
        galleryLinks.innerHTML = '';
        gallerySelect.innerHTML = '';
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

                    button.addEventListener('click', () => {
                        document.querySelectorAll('#gallery-links button').forEach(btn => btn.classList.remove('active'));
                        button.classList.add('active');
                        renderGallery(category);
                        gallerySelect.value = category;
                        gallerySelect.querySelectorAll('option').forEach(opt => opt.removeAttribute('selected'));
                        gallerySelect.querySelector(`option[value="${category}"]`).setAttribute('selected', 'selected');
                    });

                    li.appendChild(button);
                    galleryLinks.appendChild(li);

                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                    gallerySelect.appendChild(option);
                });

                const firstCategory = categories[0];
                document.querySelector(`#gallery-links button[data-category="${firstCategory}"]`).classList.add('active');
                gallerySelect.value = firstCategory;
                gallerySelect.querySelector(`option[value="${firstCategory}"]`).setAttribute('selected', 'selected');
                renderGallery(firstCategory);

                gallerySelect.addEventListener('change', (e) => {
                    const category = e.target.value;
                    document.querySelectorAll('#gallery-links button').forEach(btn => btn.classList.remove('active'));
                    const activeButton = document.querySelector(`#gallery-links button[data-category="${category}"]`);
                    if (activeButton) activeButton.classList.add('active');
                    renderGallery(category);
                    gallerySelect.querySelectorAll('option').forEach(opt => opt.removeAttribute('selected'));
                    gallerySelect.querySelector(`option[value="${category}"]`).setAttribute('selected', 'selected');
                });
            })
            .catch(error => console.error('Error loading images.json:', error));
    }
}