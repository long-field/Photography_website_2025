async function initPortfolioPage(content) {
    console.log("Start met het vullen van de portfolio-pagina.");

    // Load gallery data
    const galleriesDataResponse = await fetch('assets/data/galleries.json');
    const galleriesData = await galleriesDataResponse.json();

    // Set SEO and general texts
    document.title = content.pageTitle;
    $('.page-heading h1').text(content.portfolioHeading);

    const galleriesContainer = $('#galleries-container');
    const categoryList = $('.portfolio-category-list');
    const galleryList = $('.portfolio-gallery-list');
    const highlightImage = $('.portfolio-highlight-image');
    const highlightTitle = $('.portfolio-highlight-title');
    const highlightDescription = $('.portfolio-highlight-description');

    // Render category selector
    function renderCategorySelector(categories, sections) {
        categoryList.empty();
        categories.forEach((category, index) => {
            const item = $('<div>')
                .addClass('portfolio-category-item')
                .text(category.name)
                .data('category', category.id)
                .data('index', index);
            categoryList.append(item);
        });

        // Set initial active category
        const initialCategory = categories[0].id;
        const initialIndex = 0;
        $(`.portfolio-category-item[data-category="${initialCategory}"]`).addClass('active');
        updateCategoryCarousel(initialIndex);
        renderGallerySelector(initialCategory, sections);
        updateHighlightSection(sections.find(s => s.category === initialCategory));

        // Category click event
        $('.portfolio-category-item').on('click', function() {
            $('.portfolio-category-item').removeClass('active');
            $(this).addClass('active');
            const selectedCategory = $(this).data('category');
            const index = $(this).data('index');
            updateCategoryCarousel(index);
            renderGallerySelector(selectedCategory, sections);
            updateHighlightSection(sections.find(s => s.category === selectedCategory));
        });

        // Arrow navigation for categories
        $('.portfolio-category-prev').on('click', function() {
            const current = $('.portfolio-category-item.active');
            const prev = current.prev('.portfolio-category-item');
            if (prev.length) {
                $('.portfolio-category-item').removeClass('active');
                prev.addClass('active');
                const selectedCategory = prev.data('category');
                const index = prev.data('index');
                updateCategoryCarousel(index);
                renderGallerySelector(selectedCategory, sections);
                updateHighlightSection(sections.find(s => s.category === selectedCategory));
            }
        });

        $('.portfolio-category-next').on('click', function() {
            const current = $('.portfolio-category-item.active');
            const next = current.next('.portfolio-category-item');
            if (next.length) {
                $('.portfolio-category-item').removeClass('active');
                next.addClass('active');
                const selectedCategory = next.data('category');
                const index = next.data('index');
                updateCategoryCarousel(index);
                renderGallerySelector(selectedCategory, sections);
                updateHighlightSection(sections.find(s => s.category === selectedCategory));
            }
        });
    }

    // Update category carousel position
    function updateCategoryCarousel(activeIndex) {
        const itemWidth = $('.portfolio-category-item').outerWidth();
        const totalItems = $('.portfolio-category-item').length;
        const offset = -itemWidth * (activeIndex - 1); // Center the active item
        categoryList.css('transform', `translateX(${offset}px)`);
    }

    // Render gallery selector
    function renderGallerySelector(selectedCategory, sections) {
        galleryList.empty();
        const filteredSections = sections.filter(section => section.category === selectedCategory);

        filteredSections.forEach((section, index) => {
            const item = $('<div>')
                .addClass('portfolio-gallery-item')
                .text(section.title)
                .data('section-id', section.id)
                .data('index', index);
            galleryList.append(item);
        });

        // Set initial active gallery
        if (filteredSections.length > 0) {
            const firstGalleryId = filteredSections[0].id;
            $(`.portfolio-gallery-item[data-section-id="${firstGalleryId}"]`).addClass('active');
            updateGalleryCarousel(0);
            renderGallery([sections.find(s => s.id === firstGalleryId)]);
            updateHighlightSection(sections.find(s => s.id === firstGalleryId));
        } else {
            galleryList.empty();
            galleriesContainer.empty();
            updateHighlightSection(null);
        }

        // Gallery click event
        $('.portfolio-gallery-item').on('click', function() {
            $('.portfolio-gallery-item').removeClass('active');
            $(this).addClass('active');
            const selectedGalleryId = $(this).data('section-id');
            const index = $(this).data('index');
            updateGalleryCarousel(index);
            renderGallery([sections.find(s => s.id === selectedGalleryId)]);
            updateHighlightSection(sections.find(s => s.id === selectedGalleryId));
        });

        // Arrow navigation for galleries
        $('.portfolio-gallery-prev').on('click', function() {
            const current = $('.portfolio-gallery-item.active');
            const prev = current.prev('.portfolio-gallery-item');
            if (prev.length) {
                $('.portfolio-gallery-item').removeClass('active');
                prev.addClass('active');
                const selectedGalleryId = prev.data('section-id');
                const index = prev.data('index');
                updateGalleryCarousel(index);
                renderGallery([sections.find(s => s.id === selectedGalleryId)]);
                updateHighlightSection(sections.find(s => s.id === selectedGalleryId));
            }
        });

        $('.portfolio-gallery-next').on('click', function() {
            const current = $('.portfolio-gallery-item.active');
            const next = current.next('.portfolio-gallery-item');
            if (next.length) {
                $('.portfolio-gallery-item').removeClass('active');
                next.addClass('active');
                const selectedGalleryId = next.data('section-id');
                const index = next.data('index');
                updateGalleryCarousel(index);
                renderGallery([sections.find(s => s.id === selectedGalleryId)]);
                updateHighlightSection(sections.find(s => s.id === selectedGalleryId));
            }
        });
    }

    // Update gallery carousel position
    function updateGalleryCarousel(activeIndex) {
        const itemWidth = $('.portfolio-gallery-item').outerWidth();
        const totalItems = $('.portfolio-gallery-item').length;
        const offset = -itemWidth * (activeIndex - 1); // Center the active item
        galleryList.css('transform', `translateX(${offset}px)`);
    }

    // Render galleries
    function renderGallery(sections) {
        galleriesContainer.empty();
        sections.forEach(section => {
            if (section.type === 'photo-gallery') {
                const gallerySection = $('<section>').addClass('gallery-section').attr({
                    'id': section.id,
                    'data-category': section.category
                });

                const title = $('<h2>').text(section.title);
                const description = $('<p>').text(section.description);

                gallerySection.append(title, description);

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

    // Update highlighted image section
    function updateHighlightSection(section) {
        if (section && section.images) {
            const highlightImageData = section.images.find(img => img.isHighlight) || section.images[0];
            highlightImage.removeClass('active');
            highlightImage.css('background-image', `url(${highlightImageData.path})`);
            highlightImage.addClass('active');
            highlightTitle.text(section.title);
            highlightDescription.text(section.description);
        } else {
            highlightImage.removeClass('active');
            highlightImage.css('background-image', 'none');
            highlightTitle.text('');
            highlightDescription.text('');
        }
    }

    // Initialize
    renderCategorySelector(galleriesData.gallery.categories, galleriesData.sections);

    // Update carousel positions on window resize
    $(window).on('resize', function() {
        const activeCategory = $('.portfolio-category-item.active');
        const activeGallery = $('.portfolio-gallery-item.active');
        if (activeCategory.length) {
            updateCategoryCarousel(activeCategory.data('index'));
        }
        if (activeGallery.length) {
            updateGalleryCarousel(activeGallery.data('index'));
        }
    });
}