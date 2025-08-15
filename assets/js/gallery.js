// gallery.js
// Dit script beheert de dynamische weergave van de fotogalerij.
// Het is ontworpen om te schakelen tussen een raster van subcategorieën en een raster van afbeeldingen.

$(document).ready(function() {
    // Definieer de paginanaam en taal voor de initialisatie.
    const page = $('body').data('page');
    const lang = $('body').data('lang');

    // Controleer of we op de juiste pagina zijn voordat we het script uitvoeren.
    if (page === 'portfolio' && lang === 'nl') {
        initGalleryPage();
    }

    // De hoofdfunctie om de galerijpagina te initialiseren.
    function initGalleryPage() {
        console.log("Galerijscript wordt geladen.");

        // Gecachete jQuery-selectoren voor betere prestaties.
        const portfolioContainer = $('.portfolio-content');
        const backButton = $('.back-button');
        const galleryNavContainer = $('.gallery-nav');
        const galleryNavUl = galleryNavContainer.find('ul');
        const gallerySelect = $('.gallery-select');
        const portfolioHeader = $('.portfolio-header');

        let galleryData = null; // Opslag voor de geladen JSON-gegevens.
        let currentCategory = null; // Houd de actieve hoofdcategorie bij.

        // Functie om de HTML-titel en de hoofdtitel van de pagina bij te werken.
        const updateTitles = (title) => {
            portfolioHeader.find('h1').text(title);
            document.title = `${title} | Dieter Vanlangenaker Photography`;
        };

        // Toon een eenvoudige laadindicator.
        const renderLoadingState = () => {
            portfolioContainer.empty();
            portfolioContainer.append($('<div>').addClass('loading-indicator').text('Laden...'));
        };

        // Functie om een raster van afbeeldingen te renderen.
        const renderImageGallery = (images) => {
            portfolioContainer.empty();
            backButton.show();
            galleryNavContainer.hide();

            const grid = $('<div>').addClass('gallery-grid');
            images.forEach(image => {
                // De belangrijkste wijziging: we deactiveren de link om te voorkomen dat de afbeelding opent in een nieuw tabblad.
                // We gebruiken 'javascript:void(0)' en een event handler om het standaardgedrag te voorkomen.
                const img = $('<img>').addClass('sub-gallery-image').attr('src', image.url).attr('alt', image.title || '');
                grid.append(img);
            });
            portfolioContainer.append(grid);
        };

        // Functie om de subcategoriekaarten te renderen.
        const renderSubcategories = (subcategories, categoryTitle) => {
            portfolioContainer.empty();
            backButton.hide();
            galleryNavContainer.show();

            updateTitles(categoryTitle);

            const subGrid = $('<div>').addClass('sub-gallery-grid');
            subcategories.forEach((sub) => {
                const heroImageUrl = sub.hero_image || 'https://placehold.co/800x600/eeeeee/333333?text=Afbeelding+komt+eraan';
                const subCard = $('<div>').addClass('sub-gallery-card').css('background-image', `url(${heroImageUrl})`);

                const overlay = $('<div>').addClass('sub-gallery-overlay');
                const text = $('<div>').addClass('sub-gallery-text');
                const title = $('<h3>').text(sub.title);
                const description = $('<p>').text(sub.description);

                text.append(title, description);
                subCard.append(overlay, text);

                // Event handler voor het weergeven van de subgalerij bij een klik op de kaart.
                subCard.on('click', () => {
                    renderLoadingState(); // Toon laadindicator
                    // Vertraagd renderen voor de animatie, daarna daadwerkelijk renderen.
                    setTimeout(() => {
                        updateTitles(sub.title);
                        renderImageGallery(sub.images);
                    }, 500);
                });

                subGrid.append(subCard);
            });
            portfolioContainer.append(subGrid);
        };

        // Functie om de weergave te bepalen op basis van de categoriegegevens.
        const renderCategory = (category) => {
            if (!galleryData || !galleryData[category]) return;

            currentCategory = category;
            const categoryData = galleryData[category];
            const categoryTitle = categoryData.title || category.charAt(0).toUpperCase() + category.slice(1);

            // Controleer of de categorie subcategorieën of direct afbeeldingen bevat.
            if (categoryData.subcategories && categoryData.subcategories.length > 1) {
                // Er zijn meerdere subcategorieën, dus toon de kaarten.
                renderSubcategories(categoryData.subcategories, categoryTitle);
            } else if (categoryData.subcategories && categoryData.subcategories.length === 1) {
                // Er is slechts één subcategorie, dus toon de afbeeldingen direct.
                const singleSubcategory = categoryData.subcategories[0];
                updateTitles(singleSubcategory.title);
                renderImageGallery(singleSubcategory.images);
            } else if (categoryData.images) {
                // De categorie heeft directe afbeeldingen (geen subcategorieën).
                renderImageGallery(categoryData.images);
            }
        };

        // Laad de portfolio JSON en render de navigatie en de eerste galerij.
        $.getJSON('assets/data/portfolio.json', function(data) {
            galleryData = data;
            const categories = Object.keys(data);

            // Bouw de navigatieknoppen en de select-dropdown.
            galleryNavUl.empty();
            gallerySelect.empty();
            gallerySelect.append($('<option>').val('all').text('Selecteer een categorie'));

            categories.forEach((category) => {
                const categoryData = data[category];
                const categoryTitle = categoryData.title || category.charAt(0).toUpperCase() + category.slice(1);

                const li = $('<li>');
                const button = $('<button>').text(categoryTitle).attr('data-category', category);
                li.append(button);
                galleryNavUl.append(li);

                const option = $('<option>').val(category).text(categoryTitle);
                gallerySelect.append(option);
            });

            // Handlers voor navigatieknoppen en dropdown.
            galleryNavUl.on('click', 'button', function() {
                const category = $(this).data('category');
                galleryNavUl.find('button').removeClass('active');
                $(this).addClass('active');
                gallerySelect.val(category);
                renderCategory(category);
            });

            gallerySelect.on('change', function() {
                const category = $(this).val();
                galleryNavUl.find('button').removeClass('active');
                galleryNavUl.find(`button[data-category="${category}"]`).addClass('active');
                renderCategory(category);
            });

            // Handler voor de terug-knop.
            backButton.on('click', () => {
                // Keer terug naar de weergave van de hoofdcategorie.
                renderCategory(currentCategory);
            });

            // Toon de eerste categorie bij het laden van de pagina.
            const firstCategory = categories[0];
            const firstButton = galleryNavUl.find(`button[data-category="${firstCategory}"]`);
            if (firstButton.length) {
                firstButton.addClass('active');
                gallerySelect.val(firstCategory);
                renderCategory(firstCategory);
            }
        }).fail(function() {
            console.error('Fout bij het laden van portfolio.json');
        });
    }
});
e