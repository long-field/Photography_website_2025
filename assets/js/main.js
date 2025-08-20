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

            console.log("JSON-bestanden geladen.");

            if (page === 'home' && lang === 'nl') {
                const heroCarouselResponse = await fetch('assets/data/hero-carousel.json');
                const heroCarouselData = await heroCarouselResponse.json();
                initHomePage(nlContent.homePage, heroCarouselData);
            } else if (page === 'portfolio' && lang === 'nl') {
                initPortfolioPage(nlContent.portfolioPage);
            } else if (page === 'contact' && lang === 'nl') {
                initContactPage(nlContent.contactPage);
            }
        } catch (error) {
            console.error('Fout bij het laden van JSON-bestanden:', error);
        }
    }
    function initContactPage(content) {
        console.log("Start met het vullen van de contactpagina.");

        // ---- SEO en Algemene Teksten ----
        document.title = content.pageTitle;
        $('meta[name="description"]').attr('content', 'Neem contact op met Dieter Vanlangenaker om uw fotosessie te boeken.');

        // ---- CONTACT SECTION ----
        $('.contact-section h1').text(content.contactHeading);
        $('.contact-form-wrapper h2').text(content.contactForm.title);
        $('.contact-form-wrapper p').text(content.contactForm.text);
        $('.contact-section').css('background-image', `url(${content.contactForm.backgroundImage})`);

        // Scroll-animatie voor contactsection
        const contactSection = $('.contact-section');
        const contactElements = contactSection.find('h1, h2, p');
        applyScrollEffect(contactSection, contactElements);

        console.log("Contactpagina gevuld.");
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
        const parallaxSection = $('.quote-section');
        parallaxSection.css('background-image', `url(${parallaxImageUrl})`);
        console.log("Quote section gevuld.");


        // ---- PHOTOGRAPHY PARAGRAPH ----
        $('.photography-paragraph h2').text(content.photographyParagraph.title);
        $('.photography-paragraph p').text(content.photographyParagraph.text);

        // ---- CLIENT QUOTES ----
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
            const itemId = `about-me-item-${index}`;
            const aboutMeItem = $('<div>').addClass('about-me-item').attr('id', itemId);
            const aboutMeText = $('<div>').addClass('about-me-text').attr('id', itemId);
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
            applyScrollEffect(aboutMeItem,aboutMeText);
            applyScrollEffect(aboutMeItem,aboutMeImageContainer);
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
            heroImages.eq(imageIndex).addClass('active');

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




        // ---- HERBRUIKBARE SCROLL-ANIMATIE FUNCTIE ----
        /**
         * Past een scroll-animatie toe op een element.
         * Het geanimeerde kindelement (animatie-doel) zal geleidelijk verschijnen.
         *
         * @param {jQuery} element De container die de scroll-animatie triggert.
         * @param {jQuery} animatedChild Het kindelement waarop de animatie wordt toegepast.
         */
        function applyScrollEffect(element, animatedChild) {
            $(window).on('scroll', function() {
                const windowHeight = $(window).height();
                const scrollTop = $(window).scrollTop();
                const elementTop = element.offset().top;

                // Bepaal de scroll-positie ten opzichte van het midden van het element.
                const elementCenter = elementTop + (element.height() / 2);
                const viewportCenter = scrollTop

                // De animatie begint wanneer het element de onderkant van de viewport ingaat
                const startScroll = elementTop - windowHeight*1.5;
                // De animatie eindigt wanneer het midden van het element het midden van de viewport bereikt
                const endScroll = elementCenter - (windowHeight / 1.5);

                let progress = (viewportCenter - startScroll) / (endScroll - startScroll);

                // Zorg ervoor dat de progress tussen 0 en 1 blijft
                progress = Math.min(1, Math.max(0, progress));

                // Bereken de gewenste opacity
                const opacity = progress;

                // Bereken de translateY voor een subtiele beweging
                const translateY = 20 - (progress * 20);

                // Pas de stijlen toe
                animatedChild.css({
                    'opacity': opacity,
                    'transform': `translateY(${translateY}px)`
                });
            });
        }

        // Gebruik de nieuwe functie om het effect toe te passen op de quote-sectie
        const quoteSection = $('.quote-section');
        const quoteText = quoteSection.find('blockquote, cite');
        applyScrollEffect(quoteSection, quoteText);

        // Je kunt deze functie nu gebruiken voor elk willekeurig element door er de juiste klassen aan te geven
        // Voorbeeld:
        //plaats hier een for each dat onderrstaande doet voor ieder about-item id
        const anotherSection = $('.about-me-item');
        const anotherChild = anotherSection.find('.about-me-text');
        applyScrollEffect(anotherSection, anotherChild);

        const aboutintroSection = $('.about-me-intro');
        const aboutintroChildH2 = aboutintroSection.find('h2')
        const aboutintroChildP = aboutintroSection.find('p')
        applyScrollEffect(aboutintroSection,aboutintroChildH2);
        applyScrollEffect(aboutintroSection,aboutintroChildP);
        const photographySection = $('.photography-paragraph');
        const paragraphH2 = photographySection.find('h2');
        const paragraphP = photographySection.find('p');
        applyScrollEffect(photographySection,paragraphH2);
        applyScrollEffect(photographySection,paragraphP);

    }
});