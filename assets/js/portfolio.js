// portfolio.js

$(document).ready(function() {
    const page = $('body').data('page');
    const lang = $('body').data('lang');

    // Functie om de portfolio-logica te initialiseren
    const initPortfolioPage = () => {
        console.log("Start met het vullen van de portfolio pagina.");

        let galleryData = null;
        const portfolioContainer = $('.portfolio-content');
        const backButton = $('.back-button');
        const galleryNavContainer = $('.gallery-nav');
        const galleryNavUl = galleryNavContainer.find('ul');
        const gallerySelect = $('.gallery-select');
        const portfolioHeader = $('.portfolio-header');
        const originalTitle = portfolioHeader.find('h1').text();

        let currentCategory = null;

        // Functie om de HTML-titel en de hoofdtitel van de pagina bij te werken
        const updateTitles = (title) => {
            portfolioHeader.find('h1').text(title);
            document.title = `${title} | Dieter Vanlangenaker Photography`;
        };

        // Functie om een subgalerij te renderen
        const renderSubGallery = (subCategoryTitle, images) => {
            portfolioContainer.empty();
            backButton.show();
            galleryNavContainer.hide(); // Verberg navigatie bij subgalerij

            updateTitles(subCategoryTitle);

            const grid = $('<div>').addClass('gallery-grid');
            images.forEach(image => {
                // Hier is de belangrijke aanpassing: We verwijderen de data-lightbox attributen
                // zodat de afbeeldingen niet in een overlay openen.
                const a = $('<a>').attr('href', image.url);
                const img = $('<img>').addClass('sub-gallery-image').attr('src', image.url).attr('alt', image.title || '');
                a.append(img);
                grid.append(a);
            });
            portfolioContainer.append(grid);

            // Omdat we geen lightbox meer gebruiken voor deze galerij, hoeven we deze niet opnieuw te initialiseren.
        };

        // Functie om de hoofdgalerij of subcategorieën te renderen
        const renderGallery = (category) => {
            portfolioContainer.empty();
            backButton.hide();
            galleryNavContainer.show(); // Toon navigatie bij hoofdgalerij

            if (!galleryData || !galleryData[category]) return;

            currentCategory = category;
            const categoryData = galleryData[category];
            updateTitles(categoryData.title || category.charAt(0).toUpperCase() + category.slice(1));

            if (categoryData.images) {
                // Renderen als een eenvoudige galerij (deze blijft wel Lightbox gebruiken)
                const grid = $('<div>').addClass('gallery-grid');
                categoryData.images.forEach(image => {
                    const a = $('<a>').attr('href', image.url).attr('data-lightbox', category).attr('data-title', image.description);
                    const img = $('<img>').attr('src', image.url).attr('alt', image.title || '');
                    a.append(img);
                    grid.append(a);
                });
                portfolioContainer.append(grid);
                // Initialiseer Lightbox2 opnieuw voor de nieuwe elementen
                lightbox.init();
            } else if (categoryData.subcategories) {
                // Renderen als subcategorieën (kaarten)
                const subGrid = $('<div>').addClass('sub-gallery-grid');
                categoryData.subcategories.forEach((sub) => {
                    const heroImageUrl = sub.hero_image || 'https://placehold.co/800x600/eeeeee/333333?text=Afbeelding+komt+eraan';
                    const subCard = $('<div>').addClass('sub-gallery-card').css('background-image', `url(${heroImageUrl})`);

                    const overlay = $('<div>').addClass('sub-gallery-overlay');
                    const text = $('<div>').addClass('sub-gallery-text');
                    const title = $('<h3>').text(sub.title);
                    const description = $('<p>').text(sub.description);

                    text.append(title, description);
                    subCard.append(overlay, text);

                    subCard.on('click', () => {
                        renderSubGallery(sub.title, sub.images);
                    });

                    subGrid.append(subCard);
                });
                portfolioContainer.append(subGrid);
            }
        };

        // Laad de portfolio JSON en render de navigatie en de eerste galerij
        $.getJSON('assets/data/portfolio.json', function(data) {
            galleryData = data;
            const categories = Object.keys(data);

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

            // Handlers voor navigatieknoppen en dropdown
            galleryNavUl.on('click', 'button', function() {
                const category = $(this).data('category');
                galleryNavUl.find('button').removeClass('active');
                $(this).addClass('active');
                gallerySelect.val(category);
                renderGallery(category);
            });

            gallerySelect.on('change', function() {
                const category = $(this).val();
                galleryNavUl.find('button').removeClass('active');
                galleryNavUl.find(`button[data-category="${category}"]`).addClass('active');
                renderGallery(category);
            });

            backButton.on('click', () => {
                const activeCategory = galleryNavUl.find('button.active').data('category');
                renderGallery(activeCategory);
            });

            // Toon de eerste categorie bij het laden
            const firstCategory = categories[0];
            const firstButton = galleryNavUl.find(`button[data-category="${firstCategory}"]`);
            if (firstButton.length) {
                firstButton.addClass('active');
                gallerySelect.val(firstCategory);
                renderGallery(firstCategory);
            }
        }).fail(function() {
            console.error('Fout bij het laden van portfolio.json');
        });
    };

    // Voer de initialisatiefunctie uit als we op de portfolio-pagina zijn
    if (page === 'portfolio' && lang === 'nl') {
        initPortfolioPage();
    }
});
