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
    const highlightImage = $('.portfolio-highlight-image');
    const highlightTitle = $('.portfolio-highlight-title');
    const highlightDescription = $('.portfolio-highlight-description');

    // Store the current gallery index for navigation
    let currentGalleryIndex = 0;

    // Render category selector
    function renderCategorySelector(categories, sections) {
        const categoryList = $('.portfolio-category-list');
        categoryList.empty();
        categories.forEach((category, index) => {
            const item = $('<div>')
                .addClass('portfolio-category-item')
                .text(category.name)
                .attr('data-category', category.id)
                .data('index', index);
            categoryList.append(item);
        });

        // Function to update category arrow visibility
        function updateArrowVisibility(activeIndex) {
            $('.portfolio-category-prev').toggleClass('hidden', activeIndex === 0);
            $('.portfolio-category-next').toggleClass('hidden', activeIndex === categories.length - 1);
        }

        // Function to update gallery arrow visibility
        function updateGalleryArrowVisibility(currentGalleryIndex, filteredSections) {
            $('.gallery-prev').toggleClass('hidden', currentGalleryIndex === 0);
            $('.gallery-next').toggleClass('hidden', currentGalleryIndex === filteredSections.length - 1);
        }

        // Set initial active category and trigger rendering
        const initialCategory = categories[0].id;
        const initialIndex = 0;
        const initialItem = $(`.portfolio-category-item[data-category="${initialCategory}"]`);

        if (initialItem.length === 0) {
            console.error(`No item found for category: ${initialCategory}`);
            return;
        }

        setTimeout(() => {
            initialItem.addClass('active');
            console.log(`Initial category: ${initialCategory}, Active class applied: ${initialItem.hasClass('active')}`);
            console.log('Initial item:', initialItem[0]);

            // Force style recalculation
            initialItem[0].offsetHeight; // Trigger DOM reflow
            categoryList.css('display', 'flex');

            // Update carousel and arrows
            updateCategoryCarousel(initialIndex);
            updateArrowVisibility(initialIndex);

            // Render initial gallery
            const filteredSections = sections.filter(section => section.category === initialCategory);
            if (filteredSections.length > 0) {
                currentGalleryIndex = 0;
                renderGallery([filteredSections[0]]);
                updateHighlightSection(filteredSections[0]);
                updateGalleryArrowVisibility(currentGalleryIndex, filteredSections);
            } else {
                console.error(`No sections found for category: ${initialCategory}`);
            }
        }, 0);

        // Category click event
        $('.portfolio-category-item').on('click', function() {
            $('.portfolio-category-item').removeClass('active');
            $(this).addClass('active');
            const selectedCategory = $(this).data('category');
            const index = $(this).data('index');
            updateCategoryCarousel(index);
            updateArrowVisibility(index);
            const filteredSections = sections.filter(section => section.category === selectedCategory);
            if (filteredSections.length > 0) {
                currentGalleryIndex = 0;
                renderGallery([filteredSections[0]]);
                updateHighlightSection(filteredSections[0]);
                updateGalleryArrowVisibility(currentGalleryIndex, filteredSections);
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                console.error(`No sections found for category: ${selectedCategory}`);
            }
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
                updateArrowVisibility(index);
                const filteredSections = sections.filter(section => section.category === selectedCategory);
                if (filteredSections.length > 0) {
                    currentGalleryIndex = 0;
                    renderGallery([filteredSections[0]]);
                    updateHighlightSection(filteredSections[0]);
                    updateGalleryArrowVisibility(currentGalleryIndex, filteredSections);
                    // Scroll to top
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
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
                updateArrowVisibility(index);
                const filteredSections = sections.filter(section => section.category === selectedCategory);
                if (filteredSections.length > 0) {
                    currentGalleryIndex = 0;
                    renderGallery([filteredSections[0]]);
                    updateHighlightSection(filteredSections[0]);
                    updateGalleryArrowVisibility(currentGalleryIndex, filteredSections);
                    // Scroll to top
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        });

        // Gallery navigation with arrows
        $('.gallery-prev').on('click', function() {
            const selectedCategory = $('.portfolio-category-item.active').data('category');
            const filteredSections = sections.filter(section => section.category === selectedCategory);
            if (currentGalleryIndex > 0) {
                currentGalleryIndex--;
                renderGallery([filteredSections[currentGalleryIndex]]);
                updateHighlightSection(filteredSections[currentGalleryIndex]);
                updateGalleryArrowVisibility(currentGalleryIndex, filteredSections);
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        $('.gallery-next').on('click', function() {
            const selectedCategory = $('.portfolio-category-item.active').data('category');
            const filteredSections = sections.filter(section => section.category === selectedCategory);
            if (currentGalleryIndex < filteredSections.length - 1) {
                currentGalleryIndex++;
                renderGallery([filteredSections[currentGalleryIndex]]);
                updateHighlightSection(filteredSections[currentGalleryIndex]);
                updateGalleryArrowVisibility(currentGalleryIndex, filteredSections);
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    function renderGallery(sections) {
        const galleriesContainer = $('#galleries-container');
        galleriesContainer.empty();
        sections.forEach(section => {
            if (section.type === 'photo-gallery') {
                const gallerySection = $('<section>').addClass('gallery-section').attr({
                    'id': section.id,
                    'data-category': section.category
                });

                const grid = $('<div>').addClass('gallery-grid');
                grid.css({
                    'display': 'grid',
                    'grid-template-columns': `repeat(${section.displaySettings.gridColumns}, 1fr)`,
                    'gap': section.displaySettings.gap
                });

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

                // Add Back to Top button
                const backToTopButton = $('<button>')
                    .addClass('back-to-top')
                    .text('Terug naar boven ▲')
                    .on('click', function() {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    });
                gallerySection.append(backToTopButton);
            }
        });
        console.log("Portfolio-galerijen zijn geladen.");
    }
    // Update category carousel position
    function updateCategoryCarousel(activeIndex) {
        const itemWidth = $('.portfolio-category-item').outerWidth();
        const containerWidth = $('.portfolio-category-carousel').width();
        const offset = -(itemWidth * activeIndex) + (containerWidth / 2 - itemWidth / 2); // Center the active item
        console.log(`Carousel offset: ${offset}px, itemWidth: ${itemWidth}px, containerWidth: ${containerWidth}px, activeIndex: ${activeIndex}`);
        $('.portfolio-category-list').css({
            'transform': `translateX(${offset}px)`,
            'transition': 'transform 0.5s ease-in-out'
        });
    }
    // Render galleries

    // Update highlighted image section
    function updateHighlightSection(section) {
        if (section && section.images) {
            const highlightImageData = section.images.find(img => img.isHighlight) || section.images[0];
            highlightImage.removeClass('active');
            highlightImage.css({
                'background-image': `url(${highlightImageData.path})`
            });
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
        if (activeCategory.length) {
            updateCategoryCarousel(activeCategory.data('index'));
        }
    });
}