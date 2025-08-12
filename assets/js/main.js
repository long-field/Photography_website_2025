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

    let aboutImages = [];
    let currentAboutIndex = 0;
    let aboutInterval = null;

// A single IntersectionObserver for all lazy-loaded images
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
// DYNAMIC TEXT LOGIC
// =============================
// Fetches text content from a JSON file and populates the page.
    const updatePageText = async () => {
        try {
            const response = await fetch('assets/data/page-text.json');
            if (!response.ok) throw new Error('Failed to load page-text.json');
            const data = await response.json();

            // Set the document title for SEO
            document.title = data[document.body.dataset.page].pageTitle || document.title;

            // Check if the current page is the Portfolio page
            if (document.querySelector('.portfolio')) {
                document.querySelector('.portfolio-header h1').textContent = data.portfolio.portfolioHeading;
            }

            // Check if the current page is the Contact page
            if (document.querySelector('.contact')) {
                document.querySelector('.contact h1').textContent = data.contact.contactHeading;
                document.querySelector('.contact-form h2').textContent = data.contact.formHeading;
                document.querySelector('.booking h2').textContent = data.contact.bookingHeading;
            }
        } catch (error) {
            console.error('Error fetching text data:', error);
        }
    };

// =============================
// HAMBURGER MENU LOGIC
// =============================
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav-menu');
    const body = document.body;

    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    body.appendChild(overlay);

    if (hamburger && nav) {
        const toggleMenu = () => {
            nav.classList.toggle('active');
            overlay.classList.toggle('active');
            hamburger.innerHTML = nav.classList.contains('active') ? '✕' : '☰';
        };

        hamburger.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleMenu();
        });

        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', (event) => {
                setTimeout(() => {
                    nav.classList.remove('active');
                    overlay.classList.remove('active');
                    hamburger.innerHTML = '☰';
                }, 100);
            });
        });

        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                nav.classList.remove('active');
                overlay.classList.remove('active');
                hamburger.innerHTML = '☰';
            }
        });

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

        heroSlider.addEventListener('click', () => {
            nextHeroSlide();
        });

        window.scrollTo(0, 0);
    };

    if (heroSlider) {
        fetch('assets/data/featured.json')
            .then(response => {
                if (!response.ok) throw new Error('Failed to load featured.json');
                return response.json();
            })
            .then(data => {
                const heroCarouselData = data.find(section => section.section === 'Hero-Carousel');
                if (!heroCarouselData || !heroCarouselData.photos) {
                    throw new Error('Hero-Carousel section not found or is empty in featured.json');
                }

                heroSlider.innerHTML = '';
                heroImages = [];

                heroCarouselData.photos.forEach((image, index) => {
                    const img = document.createElement('img');
                    img.dataset.src = image.url;
                    img.alt = image.title || '';
                    img.className = index === 0 ? 'active' : '';
                    img.style.transition = 'opacity 0.5s ease-in-out';
                    img.style.position = 'absolute';
                    img.style.top = '0';
                    img.style.left = '0';
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.pointerEvents = 'none';

                    const tempImg = new Image();
                    tempImg.src = image.url;
                    tempImg.onload = () => {
                        const isPortrait = tempImg.naturalHeight > tempImg.naturalWidth;
                        img.style.objectFit = isPortrait ? 'contain' : 'cover';
                    };

                    heroImages.push(img);
                    heroSlider.appendChild(img);
                });

                lazyLoadImages();
                startHeroCarousel();
            })
            .catch(error => console.error('Error loading featured.json:', error));
    }

// =============================
// GALLERY LOGIC
// =============================
    const portfolioContainer = document.querySelector('.portfolio-content');
    const backButton = document.querySelector('.back-button');

// Function to render the sub-gallery images
    const renderSubGallery = (images) => {
        if (!images || images.length === 0) {
            portfolioContainer.innerHTML = '<p>Geen afbeeldingen gevonden in deze galerij.</p>';
            return;
        }

        portfolioContainer.innerHTML = '';
        backButton.style.display = 'block';

        const grid = document.createElement('div');
        grid.className = 'gallery-grid';

        images.forEach(image => {
            const a = document.createElement('a');
            a.href = image.url;
            a.setAttribute('data-lightbox', 'sub-gallery');
            a.setAttribute('data-title', image.description || image.title);

            const img = document.createElement('img');
            img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
            img.dataset.src = image.url;
            img.alt = image.title || '';

            a.appendChild(img);
            grid.appendChild(a);
        });

        portfolioContainer.appendChild(grid);
        lazyLoadImages();
    };

// Main function to render the portfolio categories/subcategories
    const renderGallery = (category) => {
        portfolioContainer.innerHTML = '';
        backButton.style.display = 'none';

        if (!galleryData || !galleryData[category]) {
            portfolioContainer.innerHTML = '<p>Galerij niet gevonden.</p>';
            return;
        }

        const categoryData = galleryData[category];

        if (categoryData.subcategories && categoryData.subcategories.length > 0) {
            // RENDER SUBCATEGORY VIEW
            const subGrid = document.createElement('div');
            subGrid.className = 'sub-gallery-grid';

            categoryData.subcategories.forEach((sub) => {
                const subCard = document.createElement('div');
                subCard.className = 'sub-gallery-card';

                // De hero_image wordt nu direct als een <img>-tag toegevoegd
                // We gebruiken een fallback om te voorkomen dat de app crasht als de URL mist
                const imageUrl = sub.hero_image && sub.hero_image.url ? sub.hero_image.url : '';
                const imageAlt = sub.title; // Gebruik de titel als alt-tekst voor toegankelijkheid

                subCard.innerHTML = `
                <img src="${imageUrl}" alt="${imageAlt}" class="sub-gallery-image">
                <div class="sub-gallery-overlay"></div>
                <div class="sub-gallery-text">
                    <h3>${sub.title}</h3>
                    <p>${sub.description}</p>
                </div>
            `;

                subCard.addEventListener('click', () => {
                    renderSubGallery(sub.images);
                });

                subGrid.appendChild(subCard);
            });

            portfolioContainer.appendChild(subGrid);
        } else if (categoryData.images && categoryData.images.length > 0) {
            // RENDER SIMPLE GALLERY (no subcategories)
            renderSubGallery(categoryData.images);
        } else {
            portfolioContainer.innerHTML = '<p>Deze galerij bevat momenteel geen afbeeldingen.</p>';
        }

        lazyLoadImages();
    };

    const galleryLinks = document.getElementById('gallery-links');
    const gallerySelect = document.createElement('select');
    gallerySelect.className = 'gallery-select';
    if (galleryLinks) {
        galleryLinks.parentNode.insertBefore(gallerySelect, galleryLinks.nextSibling);
    }

    if (galleryLinks && portfolioContainer) {
        galleryLinks.innerHTML = '';
        gallerySelect.innerHTML = '';
        fetch('assets/data/portfolio.json')
            .then(response => {
                if (!response.ok) throw new Error('Failed to load portfolio.json');
                return response.json();
            })
            .then(data => {
                galleryData = data;
                const categories = Object.keys(data);

                categories.forEach((category) => {
                    const categoryData = data[category];
                    const categoryTitle = categoryData.title || category;

                    const li = document.createElement('li');
                    const button = document.createElement('button');
                    button.textContent = categoryTitle;
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
                    option.textContent = categoryTitle;
                    gallerySelect.appendChild(option);
                });

                // Set initial gallery view
                const firstCategory = categories[0];
                const firstButton = document.querySelector(`#gallery-links button[data-category="${firstCategory}"]`);
                if(firstButton) firstButton.classList.add('active');

                const firstOption = gallerySelect.querySelector(`option[value="${firstCategory}"]`);
                if(firstOption) {
                    gallerySelect.value = firstCategory;
                    firstOption.setAttribute('selected', 'selected');
                }

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

                // Back button functionality
                backButton.addEventListener('click', () => {
                    const activeCategory = document.querySelector('.gallery-nav button.active').dataset.category;
                    renderGallery(activeCategory);
                });
            })
            .catch(error => console.error('Error loading portfolio.json:', error));
    }

// Call the dynamic text function after all includes are loaded
    updatePageText();

// Scroll detection for header transparency
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 0) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}