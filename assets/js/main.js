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
            const siteDataResponse = await fetch('assets/data/site-data.json');
            const siteData = await siteDataResponse.json();
            const nlContent = siteData.languages.nl;

            const heroCarouselResponse = await fetch('assets/data/hero-carousel.json');
            const heroCarouselData = await heroCarouselResponse.json();

            console.log("JSON-bestanden geladen.");

            if (page === 'home' && lang === 'nl') {
                initHomePage(nlContent.homePage, heroCarouselData);
            }
        } catch (error) {
            console.error('Fout bij het laden van site-data.json of hero-carousel.json:', error);
        }
    }

    // Functie voor homepage-logica met dynamische content
    function initHomePage(content, heroCarouselData) {
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
                img.attr('data-index', index);
                heroSlider.append(img);

                // Creëer de tekstblokken
                if (photo.text_blocks) {
                    photo.text_blocks.forEach((block, blockIndex) => {
                        const textContainer = $('<div>').addClass('hero-text-container');
                        textContainer.attr('data-image-index', index);
                        textContainer.attr('data-text-index', blockIndex);

                        // PAS OP: DEZE CODE IS UITGESCHAKELD OM DE 'BOXED' STIJL TE VERWIJDEREN
                        // if (block.style === 'boxed') {
                        //     textContainer.addClass('text-box');
                        // }

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
            });

            // Plaats de overlay als laatste
            heroSlider.append($('<div>').addClass('hero-overlay'));
        }
        console.log("Hero-carousel gevuld.");

        // ---- QUOTE SECTION (Parallax) ----
        $('.quote-section blockquote').text(content.quoteSection.quote);
        $('.quote-section cite').text(content.quoteSection.attribution);

        // EXTRA DEBUG: Log de URL en controleer of de afbeelding bestaat
        const parallaxImageUrl = content.quoteSection.image;
        console.log("Parallax achtergrond URL: " + parallaxImageUrl);

        const img = new Image();
        img.onload = function() {
            $('.quote-section').css('background-image', `url(${parallaxImageUrl})`);
            console.log("Parallax-achtergrond ingesteld.");
            console.log("Parallax-afbeelding is succesvol geladen.");
        };
        img.onerror = function() {
            console.error("Fout: Kon de parallax-afbeelding niet laden. Controleer het pad: " + parallaxImageUrl);
        };
        img.src = parallaxImageUrl;

        console.log("Parallax-achtergrond-instelling in gang gezet.");

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

        content.aboutMe.items.forEach((item, index) => {
            const aboutMeItem = $('<div>').addClass('about-me-item');
            const aboutMeText = $('<div>').addClass('about-me-text');
            const aboutMeImageContainer = $('<div>').addClass('about-me-image-container');

            aboutMeText.append($('<h3>').text(item.title));
            aboutMeText.append($('<p>').text(item.text));

            const img = $('<img>').attr('src', item.image).attr('alt', item.title || '');
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
        let heroTextIndex = 0;
        const heroImages = $('.hero-slider .hero-slide-image');
        const heroTexts = $('.hero-text-container');
        const totalImages = heroImages.length;
        const slideDuration = heroCarouselData.settings.slideDuration || 5000; // Gebruik instelling uit JSON, of 5000 als fallback

        function showSlide(imageIndex, textIndex) {
            // Verberg alle elementen
            heroImages.removeClass('active');
            heroTexts.removeClass('active');

            // Toon de juiste afbeelding
            heroImages.filter(`[data-index='${imageIndex}']`).addClass('active');

            // Toon het juiste tekstblok
            heroTexts.filter(`[data-image-index='${imageIndex}'][data-text-index='${textIndex}']`).addClass('active');
        }

        function showNextSlide() {
            const currentImageTexts = heroTexts.filter(`[data-image-index='${heroImageIndex}']`);
            const totalTexts = currentImageTexts.length;

            heroTextIndex++;

            if (heroTextIndex < totalTexts) {
                showSlide(heroImageIndex, heroTextIndex);
            } else {
                heroImageIndex = (heroImageIndex + 1) % totalImages;
                heroTextIndex = 0;
                showSlide(heroImageIndex, heroTextIndex);
            }

            updateInterval();
        }

        showSlide(heroImageIndex, heroTextIndex);

        function updateInterval() {
            const currentImageTexts = heroTexts.filter(`[data-image-index='${heroImageIndex}']`);
            const totalTexts = currentImageTexts.length;
            const newInterval = totalTexts > 1 ? slideDuration / totalTexts : slideDuration;

            clearInterval(heroInterval);
            heroInterval = setInterval(showNextSlide, newInterval);
        }

        let heroInterval = setInterval(showNextSlide, slideDuration);

        updateInterval();

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
});
