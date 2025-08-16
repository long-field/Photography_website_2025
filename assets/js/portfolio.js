async function initPortfolioPage(content) {
    console.log("Start met het vullen van de portfolio-pagina.");

    // Laad de galerijdata
    const galleriesDataResponse = await fetch('assets/data/galleries.json');
    const galleriesData = await galleriesDataResponse.json();

    // Stel de SEO- en algemene teksten in
    document.title = content.pageTitle;
    $('.page-heading h1').text(content.portfolioHeading);

    const galleriesContainer = $('#galleries-container');
    const categoryNavContainer = $('#category-nav');

    // Functie om de navigatiebalk te renderen
    function renderCategoryNav(categories, sections) {
        // Leeg de navigatiecontainer eerst
        categoryNavContainer.empty();

        // Voeg categorieknoppen toe op basis van de JSON-data
        categories.forEach(category => {
            const button = $('<button>').addClass('category-button').text(category.name).data('category', category.id);
            categoryNavContainer.append(button);
        });

        // Voeg de klik-events toe aan de categorieknoppen
        $('.category-button').on('click', function() {
            $('.category-button').removeClass('active');
            $(this).addClass('active');
            const selectedCategory = $(this).data('category');

            // Toon de subnavigatie voor de geselecteerde categorie
            renderSubNav(selectedCategory, sections);

            // Verberg alle galerijen om te beginnen
            $('.gallery-section').hide();
        });

        // Roep de subnavigatie aan voor de initiële selectie van de eerste categorie
        const initialCategory = categories[0].id;
        $(`.category-button[data-category="${initialCategory}"]`).addClass('active');
        renderSubNav(initialCategory, sections);
    }

    // Nieuwe functie om de subnavigatie te renderen
    function renderSubNav(selectedCategory, sections) {
        // Verwijder de oude subnavigatie, als die er is
        $('.sub-nav-container').remove();

        const subNavContainer = $('<div>').addClass('sub-nav-container');
        const filteredSections = sections.filter(section => section.category === selectedCategory);

        // Voeg de CSS-stijl toe om de knoppen te centreren
        subNavContainer.css({
            'text-align': 'center',
            'margin-top': '1rem'
        });

        filteredSections.forEach((section, index) => {
            const subButton = $('<button>').addClass('sub-button').text(section.title).data('section-id', section.id);
            subNavContainer.append(subButton);
        });

        // Voeg de subnavigatie toe na de hoofdcategorieën
        categoryNavContainer.after(subNavContainer);

        // Debug: Check of de ge-filterde secties correct zijn
        console.log("DEBUG: Number of filtered sections for category '" + selectedCategory + "':", filteredSections.length);

        // Selecteer en render de eerste galerij standaard
        if (filteredSections.length > 0) {
            console.log("DEBUG: Condition 'filteredSections.length > 0' is true. Attempting to render first gallery.");

            // Dit is de correcte manier om de eerste subknop in de nieuwe container te vinden
            const firstSubButton = subNavContainer.find('.sub-button').first();
            const firstGalleryId = firstSubButton.data('section-id');

            console.log("DEBUG: First sub-button found:", firstSubButton);
            console.log("DEBUG: ID of first gallery to load:", firstGalleryId);

            // Zoek de volledige sectie en laad deze
            const sectionToRender = sections.find(s => s.id === firstGalleryId);

            console.log("DEBUG: Section object to render:", sectionToRender);

            if (sectionToRender) {
                firstSubButton.addClass('active');
                renderGalleries([sectionToRender]);
                console.log("DEBUG: Gallery successfully rendered.");
            } else {
                console.log("DEBUG: Section object not found. Cannot render gallery.");
            }
        }

        // Voeg de klik-events toe aan de subknoppen
        $('.sub-button').on('click', function() {
            $('.sub-button').removeClass('active');
            $(this).addClass('active');
            const selectedGalleryId = $(this).data('section-id');

            // Render alleen de geselecteerde galerij
            renderGalleries([sections.find(s => s.id === selectedGalleryId)]);
        });
    }

    // Genereer de galerijen op basis van de JSON-data
    function renderGalleries(sections) {
        // Leeg de container voordat we nieuwe galerijen toevoegen
        galleriesContainer.empty();

        sections.forEach(section => {
            if (section.type === 'photo-gallery') {
                const gallerySection = $('<section>').addClass('gallery-section').attr({
                    'id': section.id,
                    'data-category': section.category
                });

                const title = $('<h2>').text(section.title);
                const description = $('<p>').text(section.description);

                gallerySection.append(title);
                gallerySection.append(description);

                const grid = $('<div>').addClass('gallery-grid');
                grid.css({
                    'display': 'grid',
                    'grid-template-columns': `repeat(${section.displaySettings.gridColumns}, 1fr)`,
                    'gap': section.displaySettings.gap
                });

                // Mobile view settings
                const style = document.createElement('style');
                style.innerHTML = `@media (max-width: 768px) {
                    #${section.id} .gallery-grid {
                        grid-template-columns: repeat(${section.displaySettings.mobileColumns}, 1fr);
                    }
                }`;
                document.head.appendChild(style);

                section.images.forEach(image => {
                    const galleryItem = $('<div>').addClass('gallery-item');
                    const link = $('<a>').attr({
                        'href': image.path,
                        'data-lightbox': section.id,
                        'data-title': image.alt
                    });
                    const img = $('<img>').attr({
                        'src': image.thumbnailPath,
                        'alt': image.alt
                    });

                    link.append(img);
                    galleryItem.append(link);
                    grid.append(galleryItem);
                });

                gallerySection.append(grid);
                galleriesContainer.append(gallerySection);
            }
        });
        console.log("Portfolio-galerijen zijn geladen.");
    }

    // Start de renderfuncties
    renderCategoryNav(galleriesData.gallery.categories, galleriesData.sections);

    // Voeg CSS toe voor de knopstijlen
    const style = document.createElement('style');
    style.innerHTML = `
        .sub-button {
            background-color: transparent;
            border: none;
            cursor: pointer;
            padding: 0.5rem 1rem;
            font-size: 1rem;
            color: #333;
            text-decoration: none;
        }
        .sub-button:hover {
            text-decoration: underline;
        }
        .sub-button.active {
            font-weight: bold;
            text-decoration: underline;
        }
    `;
    document.head.appendChild(style);
}