// main.js

$(document).ready(function() {
    // Scroll event listener om de 'scrolled' class toe te voegen aan de header
    $(window).scroll(function() {
        if ($(this).scrollTop() > 50) {
            $('header').addClass('scrolled');
        } else {
            $('header').removeClass('scrolled');
        }
    });

    const page = $('body').data('page');
    const lang = $('body').data('lang');

    let isMainInitialized = false;

    // Gebruik een custom event om te garanderen dat alles geladen is
    $(document).on('includesLoaded', function() {
        if (!isMainInitialized) {
            initializeMain();
        }
    });

    async function initializeMain() {
        isMainInitialized = true;
        console.log("Main script is gestart.");

        // Laad de content uit de JSON-bestanden
        try {
            const siteContentResponse = await fetch('assets/data/site-content.json');
            const siteContentData = await siteContentResponse.json();
            const nlContent = siteContentData.languages.nl;

            const featuredPhotosResponse = await fetch('assets/data/featured.json');
            const featuredPhotosData = await featuredPhotosResponse.json();

            const heroCarouselResponse = await fetch('assets/data/hero-carousel.json');
            const heroCarouselData = await heroCarouselResponse.json();

            console.log("JSON-bestanden geladen.");

            if (page === 'home' && lang === 'nl') {
                initHomePage(nlContent.homePage, featuredPhotosData, heroCarouselData);
            } else if (page === 'portfolio' && lang === 'nl') {
                initPortfolioPage(nlContent.portfolioPage, featuredPhotosData);
            }
        } catch (error) {
            console.error('Fout bij het laden van de site-content, featured.json of hero-carousel.json:', error);
        }
    }

    // Functie voor homepage-logica met dynamische content
    function initHomePage(content, photosData, heroCarouselData) {
        console.log("Start met het vullen van de homepage.");

        // ---- SEO en Algemene Teksten ----
        document.title = content.pageTitle;
        $('meta[name="description"]').attr('content', 'Tijdloze fotografie voor onvergetelijke levensverhalen.');

        // ---- HERO CAROUSEL ----
        const heroCarouselSection = heroCarouselData; // Gebruik de nieuwe data
        const heroSection = $('.hero');
        const heroSlider = $('.hero-slider');

        // Verwijder alle oude content, inclusief de text containers
        heroSection.find('h1, h2, .hero-text-container').remove();
        heroSlider.find('img').remove();

        if (heroCarouselSection && heroCarouselSection.photos) {
            heroCarouselSection.photos.forEach((photo, index) => {
                const img = $('<img>');
                img.attr('src', photo.url);
                img.attr('alt', `Carousel image ${index + 1}`);
                img.addClass('hero-slide-image');

                // Voeg een unieke data-index toe aan elke afbeelding en tekstblok
                img.attr('data-index', index);

                // Creëer de tekstblokken
                if (photo.text_blocks) {
                    photo.text_blocks.forEach((block, blockIndex) => {
                        const textContainer = $('<div>').addClass('hero-text-container').attr('data-index', index);

                        // Voeg de 'boxed' stijl toe indien gespecificeerd
                        if (block.style === 'boxed') {
                            textContainer.addClass('text-box');
                        }

                        // Pas de inline CSS-stijlen toe
                        const position = block.position;
                        const size = block.size;
                        const alignment = block.alignment;

                        textContainer.css({
                            'top': position.top,
                            'left': position.left,
                            'bottom': position.bottom,
                            'right': position.right,
                            'width': size.width,
                            'height': size.height,
                            'text-align': alignment
                        });

                        if (block.title) {
                            textContainer.append($('<h1>').text(block.title));
                        }
                        if (block.text) {
                            textContainer.append($('<h2>').text(block.text));
                        }

                        heroSection.append(textContainer);
                    });
                }

                heroSlider.append(img);
            });

            // Plaats de overlay als laatste
            heroSlider.append($('<div>').addClass('hero-overlay'));
        }
        console.log("Hero-carousel gevuld.");

        // ---- QUOTE SECTION (Parallax) ----
        $('.quote-section blockquote').text(content.quoteSection.quote);
        $('.quote-section cite').text(content.quoteSection.attribution);

        const parallaxPhotoSection = photosData.find(item => item.section === 'Metro In Budapest');
        if (parallaxPhotoSection && parallaxPhotoSection.photos.length > 0) {
            $('.quote-section').css('background-image', `url(${parallaxPhotoSection.photos[0].url})`);
        }
        console.log("Parallax-achtergrond ingesteld.");

        // ---- PHOTOGRAPHY PARAGRAPH SECTION ----
        $('.photography-paragraph h2').text(content.photographyParagraph.title);
        $('.photography-paragraph p').text(content.photographyParagraph.text);

        // ---- CLIENT QUOTES SECTION ----
        const quotesSlider = $('.quotes-slider');
        quotesSlider.empty();
        $('.client-quotes h2').text(content.clientQuotes.title);

        content.clientQuotes.quotes.forEach((quoteObj, index) => {
            const quoteSlide = $('<div>').addClass('quote-slide').attr('data-index', index);
            const blockquote = $('<blockquote>').text(`"${quoteObj.quote}"`);
            const cite = $('<cite>').text(quoteObj.client);
            quoteSlide.append(blockquote, cite);
            quotesSlider.append(quoteSlide);
        });
        console.log("Klantrecensies gevuld.");


        // ---- ABOUT ME SECTION ----
        const aboutMeSection = $('#about-section');
        aboutMeSection.find('.about-me-intro h2').text(content.aboutMe.title);
        aboutMeSection.find('.about-me-intro p').text(content.aboutMe.introduction);

        aboutMeSection.find('.about-me-item').remove();

        const aboutMeImages = {
            'Mijn Verhaal': photosData.find(item => item.section === 'Web Higher-83')?.photos[0]?.url,
            'Mijn Visie en Stijl': photosData.find(item => item.section === 'Web Even More Higherderder-1-2')?.photos[0]?.url,
            'Mijn Passie': photosData.find(item => item.section === 'Web Higher-119')?.photos[0]?.url
        };

        content.aboutMe.items.forEach((item, index) => {
            const aboutMeItem = $('<div>').addClass('about-me-item');
            const aboutMeText = $('<div>').addClass('about-me-text');
            const aboutMeImageContainer = $('<div>').addClass('about-me-image-container');

            aboutMeText.append($('<h3>').text(item.title));
            aboutMeText.append($('<p>').text(item.text));

            const img = $('<img>').attr('src', aboutMeImages[item.title] || '').attr('alt', item.imageAlt || '');
            aboutMeImageContainer.append(img);

            if (index % 2 === 0) {
                aboutMeItem.append(aboutMeText, aboutMeImageContainer);
            } else {
                aboutMeItem.append(aboutMeText, aboutMeImageContainer);
            }

            aboutMeSection.append(aboutMeItem);
        });
        console.log("Over-mij-sectie gevuld.");


        // ---- BOOKING SECTION ----
        $('.booking-section h2').text(content.bookingProcess.title);
        $('.booking-section p').text(content.bookingProcess.text);
        $('.booking-section a.button').text(content.bookingProcess.buttonText);
        console.log("Boekingssectie gevuld.");


        // ---- HERO SLIDER FUNCTIONALITY ----
        let heroImageIndex = 0;
        const heroImages = $('.hero-slider .hero-slide-image');
        const heroTexts = $('.hero-text-container');
        const totalSlides = heroImages.length;

        // Initialiseer de eerste slide als actief
        if (totalSlides > 0) {
            heroImages.filter(`[data-index='0']`).addClass('active');
            heroTexts.filter(`[data-index='0']`).addClass('active');
        }

        function showNextHeroSlide() {
            heroImages.removeClass('active');
            heroTexts.removeClass('active');
            heroImageIndex = (heroImageIndex + 1) % totalSlides;
            heroImages.filter(`[data-index='${heroImageIndex}']`).addClass('active');
            heroTexts.filter(`[data-index='${heroImageIndex}']`).addClass('active');
        }

        setInterval(showNextHeroSlide, 5000);

        // ---- QUOTES SLIDER FUNCTIONALITY ----
        let currentQuoteIndex = 0;
        const quotes = $('.quotes-slider .quote-slide');
        const totalQuotes = quotes.length;

        function showQuote(index) {
            quotes.hide();
            quotes.eq(index).show();
        }

        showQuote(currentQuoteIndex);

        $('.next-slide').on('click', function() {
            currentQuoteIndex = (currentQuoteIndex + 1) % totalQuotes;
            showQuote(currentQuoteIndex);
        });

        $('.prev-slide').on('click', function() {
            currentQuoteIndex = (currentQuoteIndex - 1 + totalQuotes) % totalQuotes;
            showQuote(currentQuoteIndex);
        });
        console.log("Sliders geïnitialiseerd.");
    }

    // Functie voor portfolio-logica
    function initPortfolioPage(content, photosData) {
        console.log("Start met het vullen van de portfolio pagina.");
        document.title = content.pageTitle;
        $('.portfolio-header h1').text(content.portfolioHeading);

        let galleryData = null;
        const portfolioContainer = $('.portfolio-content');
        const backButton = $('.back-button');
        const galleryNavUl = $('#gallery-links');

        const renderSubGallery = (images) => {
            portfolioContainer.empty();
            backButton.show();

            const grid = $('<div>').addClass('gallery-grid');

            images.forEach(image => {
                const a = $('<a>').attr('href', image.url).attr('data-lightbox', 'sub-gallery').attr('data-title', image.description);
                const img = $('<img>').addClass('sub-gallery-image').attr('src', image.url).attr('alt', image.title || '');
                a.append(img);
                grid.append(a);
            });

            portfolioContainer.append(grid);
        };

        const renderGallery = (category) => {
            portfolioContainer.empty();
            backButton.hide();

            if (!galleryData || !galleryData[category]) return;

            const categoryData = galleryData[category];
            const portfolioHeader = $('.portfolio-header');

            portfolioHeader.find('h1').text(categoryData.title || category.charAt(0).toUpperCase() + category.slice(1));

            if (categoryData.images) {
                const grid = $('<div>').addClass('gallery-grid');

                categoryData.images.forEach(image => {
                    const a = $('<a>').attr('href', image.url).attr('data-lightbox', category).attr('data-title', image.description);
                    const img = $('<img>').attr('src', image.url).attr('alt', image.title || '');
                    a.append(img);
                    grid.append(a);
                });

                portfolioContainer.append(grid);
            } else if (categoryData.subcategories) {
                const subGrid = $('<div>').addClass('sub-gallery-grid');

                categoryData.subcategories.forEach((sub, index) => {
                    const subCard = $('<div>').addClass('sub-gallery-card').css('background-image', `url(${sub.heroImage})`);
                    const overlay = $('<div>').addClass('sub-gallery-overlay');
                    const text = $('<div>').addClass('sub-gallery-text');
                    const title = $('<h3>').text(sub.title);
                    const description = $('<p>').text(sub.description);

                    text.append(title, description);
                    subCard.append(overlay, text);

                    subCard.on('click', () => {
                        renderSubGallery(sub.images);
                    });

                    subGrid.append(subCard);
                });

                portfolioContainer.append(subGrid);
            }
            document.title = galleryData[category].title + ' | Dieter Vanlangenaker Photography';
        };

        $.getJSON('assets/data/portfolio.json', function(data) {
            galleryData = data;
            const categories = Object.keys(data);

            galleryNavUl.empty();
            categories.forEach((category) => {
                const categoryData = data[category];
                const categoryTitle = categoryData.title || category.charAt(0).toUpperCase() + category.slice(1);

                const li = $('<li>');
                const button = $('<button>').text(categoryTitle).attr('data-category', category);

                button.on('click', function() {
                    galleryNavUl.find('button').removeClass('active');
                    $(this).addClass('active');
                    renderGallery(category);
                });

                li.append(button);
                galleryNavUl.append(li);
            });

            backButton.on('click', () => {
                const activeCategory = galleryNavUl.find('button.active').data('category');
                renderGallery(activeCategory);
                $('.portfolio-header h1').text(content.portfolioHeading);
            });

            const firstCategory = categories[0];
            const firstButton = galleryNavUl.find(`button[data-category="${firstCategory}"]`);
            if (firstButton.length) {
                firstButton.addClass('active');
                renderGallery(firstCategory);
            }
        }).fail(function() {
            console.error('Fout bij het laden van portfolio.json');
        });
    }
});
