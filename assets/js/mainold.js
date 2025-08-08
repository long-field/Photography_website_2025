document.addEventListener('DOMContentLoaded', () => {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.src = entry.target.dataset.src;
                observer.unobserve(entry.target);
            }
        });
    });
    images.forEach(img => observer.observe(img));

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Dynamic gallery loading
    fetch('assets/data/images.json') // Make sure this path is correct
        .then(response => {
            if (!response.ok) throw new Error('Failed to load images.json');
            return response.json();
        })
        .then(data => {
            const galleryLinks = document.getElementById('gallery-links');
            const galleries = document.getElementById('galleries');
            const previewGrid = document.querySelector('.gallery-grid');

            Object.keys(data).forEach(category => {
                const images = data[category];
                if (images.length > 0) {
                    // Navigation link
                    if (galleryLinks) {
                        const li = document.createElement('li');
                        li.innerHTML = `<a href="#${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</a>`;
                        galleryLinks.appendChild(li);
                    }

                    // Gallery section
                    if (galleries) {
                        const section = document.createElement('section');
                        section.id = category;
                        section.className = 'gallery-section';
                        section.innerHTML = `<h2>${category.charAt(0).toUpperCase() + category.slice(1)}</h2><div class="gallery-grid"></div>`;
                        galleries.appendChild(section);

                        const grid = section.querySelector('.gallery-grid');

                        images.forEach(image => {
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

                            // Add to homepage preview (limit 3)
                            if (category === 'weddings' && previewGrid && previewGrid.children.length < 3) {
                                const previewA = a.cloneNode(false);
                                const previewImg = img.cloneNode(false);
                                previewA.setAttribute('data-lightbox', 'preview');
                                previewA.appendChild(previewImg);
                                previewGrid.appendChild(previewA);
                            }
                        });
                    }
                }
            });

            // Re-run lazy loading for dynamically added images
            const newImages = document.querySelectorAll('img[data-src]');
            newImages.forEach(img => observer.observe(img));
        })
        .catch(error => console.error('Error loading images.json:', error));
});
