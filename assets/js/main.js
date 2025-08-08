document.addEventListener('DOMContentLoaded', () => {
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
    // HERO SLIDER LOGIC
    // =============================
    const heroSlider = document.querySelector('.hero-slider');

    const showHeroSlide = (index) => {
        heroImages.forEach((img, i) => {
            img.style.opacity = i === index ? '1' : '0';
        });
    };

    const nextHeroSlide = () => {
        currentHeroIndex = (currentHeroIndex + 1) % heroImages.length;
        showHeroSlide(currentHeroIndex);
    };

    const startHeroCarousel = () => {
        if (heroInterval) clearInterval(heroInterval);
        heroInterval = setInterval(nextHeroSlide, 5000);

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
                heroSlider.innerHTML = ''; // Clear any existing content
                heroImages = [];

                images.forEach((image, index) => {
                    const img = document.createElement('img');
                    img.dataset.src = image.url;
                    img.alt = image.alt || '';
                    img.style.opacity = index === 0 ? '1' : '0';
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
        galleries.innerHTML = ''; // Clear previous gallery

        if (!galleryData || !galleryData[category]) return;

        const section = document.createElement('section');
        section.className = 'gallery-section';
        section.innerHTML = `
            <h2>${category.charAt(0).toUpperCase() + category.slice(1)}</h2>
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
    };

    fetch('assets/data/images.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load images.json');
            return response.json();
        })
        .then(data => {
            galleryData = data;

            const galleryLinks = document.getElementById('gallery-links');
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
                    document.querySelectorAll('#gallery-links button').forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    renderGallery(category);
                });

                li.appendChild(button);
                galleryLinks.appendChild(li);
            });
        })
        .catch(error => console.error('Error loading images.json:', error));



});
