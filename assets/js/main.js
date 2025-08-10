/*
 * main.js
 *
 * This script handles all the dynamic functionality for the website,
 * including the responsive hamburger menu, a dynamic hero image slider,
 * an image carousel for the about page, and a dynamic portfolio gallery
 * populated from JSON data. It also now fetches and injects page-specific
 * text content from a separate JSON file, making the site easier to manage.
 * The portfolio gallery logic has been updated to support subcategories.
 *
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

            // Check if the current page is the Home page
            if (document.querySelector('.hero')) {
                document.querySelector('.hero h1').textContent = data.home.heroHeading;
                document.querySelector('.gallery-preview h2').textContent = data.home.galleryHeading;
                const galleryIntroParagraph = document.createElement('p');
                galleryIntroParagraph.textContent = data.home.galleryIntro;
                const galleryGridElement = document.querySelector('.gallery-preview .gallery-grid');
                if (galleryGridElement) {
                    document.querySelector('.gallery-preview').insertBefore(galleryIntroParagraph, galleryGridElement);
                }
            }

            // Check if the current page is the Portfolio page
            if (document.querySelector('.portfolio')) {
                document.querySelector('.portfolio-header h1').textContent = data.portfolio.portfolioHeading;
            }

            // Check if the current page is the About page
            if (document.querySelector('.about')) {
                document.querySelector('.about h1').textContent = data.about.aboutHeading;
                const p1 = document.querySelector('.about p:first-of-type');
                if (p1) {
                    p1.textContent = data.about.aboutParagraph1;
                    const p2 = document.createElement('p');
                    p2.textContent = data.about.aboutParagraph2;
                    p1.parentNode.insertBefore(p2, p1.nextSibling);
                }
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
            .catch(error => console.error('Error loading hero-carousel.json:', error));
    }

    // =============================
    // ABOUT CAROUSEL LOGIC
    // =============================
    const aboutCarousel = document.querySelector('.about-carousel');

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
    // GALLERY LOGIC (UPDATED FOR SUBCATEGORIES)
    // =============================
    const portfolioContainer = document.querySelector('.portfolio-content');
    const backButton = document.querySelector('.back-button');

    // Function to render the sub-gallery images
    const renderSubGallery = (images) => {
        portfolioContainer.innerHTML = '';
        backButton.style.display = 'block';

        const grid = document.createElement('div');
        grid.className = 'gallery-grid';

        images.forEach(image => {
            const a = document.createElement('a');
            a.href = image.url;
            a.setAttribute('data-lightbox', 'sub-gallery');
            a.setAttribute('data-title', image.description);

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

        if (!galleryData || !galleryData[category]) return;

        const categoryData = galleryData[category];

        if (Array.isArray(categoryData)) {
            // RENDER SIMPLE GALLERY (no subcategories)
            const grid = document.createElement('div');
            grid.className = 'gallery-grid';

            categoryData.forEach(image => {
                const a = document.createElement('a');
                a.href = image.url;
                a.setAttribute('data-lightbox', category);
                a.setAttribute('data-title', image.description);

                const img = document.createElement('img');
                img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
                img.dataset.src = image.url;
                img.alt = image.title || '';

                a.appendChild(img);
                grid.appendChild(a);
            });

            portfolioContainer.appendChild(grid);
        } else if (categoryData.subcategories) {
            // RENDER SUBCATEGORY VIEW
            const subGrid = document.createElement('div');
            subGrid.className = 'sub-gallery-grid';

            categoryData.subcategories.forEach((sub, index) => {
                const subCard = document.createElement('div');
                subCard.className = 'sub-gallery-card';
                subCard.style.backgroundImage = `url(${sub.heroImage})`;
                subCard.innerHTML = `
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
        fetch('assets/data/images.json')
            .then(response => {
                if (!response.ok) throw new Error('Failed to load images.json');
                return response.json();
            })
            .then(data => {
                galleryData = data;
                const categories = Object.keys(data);

                categories.forEach((category) => {
                    // Check if the data has a 'title' property, otherwise use the key
                    const categoryData = data[category];
                    const categoryTitle = categoryData.title || category.charAt(0).toUpperCase() + category.slice(1);

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
            .catch(error => console.error('Error loading images.json:', error));
    }

    // Call the dynamic text function after all includes are loaded
    updatePageText();
}
