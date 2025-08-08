document.addEventListener('DOMContentLoaded', () => {
    let galleryData = null;

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

    // Populate hero slider from hero-carousel.json
    const heroSlider = document.querySelector('.hero-slider');

    if (heroSlider) {
        fetch('assets/data/hero-carousel.json')
            .then(response => {
                if (!response.ok) throw new Error('Failed to load hero-carousel.json');
                return response.json();
            })
            .then(images => {
                heroSlider.innerHTML = ''; // Clear any hardcoded images

                images.forEach(image => {
                    const img = document.createElement('img');
                    img.dataset.src = image.url;
                    img.alt = image.alt || '';
                    heroSlider.appendChild(img);
                });

                // Lazy load the new images
                const lazyHeroImages = heroSlider.querySelectorAll('img[data-src]');
                lazyHeroImages.forEach(img => observer.observe(img));
            })
            .catch(error => console.error('Error loading hero-carousel.json:', error));
    }

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
            img.alt = image.title;
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

                // Auto-select first category on page load
                if (index === 0) {
                    button.classList.add('active');
                    renderGallery(category);
                }

                button.addEventListener('click', () => {
                    // Remove active class from all buttons
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
