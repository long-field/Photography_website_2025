
async function initPortfolioPage(content) {
    console.log("Start met het vullen van de portfolio-pagina.");

    // Laad de galerijdata
    const galleriesDataResponse = await fetch('assets/data/galleries.json');
    const galleriesData = await galleriesDataResponse.json();

    // Stel de SEO- en algemene teksten in
    document.title = content.pageTitle;
    $('.page-heading h1').text(content.portfolioHeading);

    const galleriesContainer = $('#galleries-container');

    // Genereer de galerijen op basis van de JSON-data
    galleriesData.sections.forEach(section => {
        if (section.type === 'photo-gallery') {
            const gallerySection = $('<section>').addClass('gallery-section').attr('id', section.id);
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