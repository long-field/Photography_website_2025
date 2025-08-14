// includes.js

// Functie om de deelsbestanden te laden
function loadIncludes() {
    console.log("Start met het laden van de deelsbestanden.");

    const includeElements = $('[data-include]');
    const totalIncludes = includeElements.length;
    let includesLoaded = 0;

    // Als er geen deelsbestanden zijn om te laden, triggert het de event meteen
    if (totalIncludes === 0) {
        console.log("Geen deelsbestanden gevonden, trigger includesLoaded event.");
        $(document).trigger('includesLoaded');
        return;
    }

    // Loop door elk element en laad de content
    includeElements.each(function() {
        const file = $(this).data('include');
        const element = $(this);

        console.log("Laden van deelsbestand:", file);

        element.load(file, function(response, status, xhr) {
            if (status === "error") {
                console.error("Fout bij het laden van deelsbestand:", file, xhr.status, xhr.statusText);
            } else {
                console.log("Deelsbestand geladen:", file);
            }

            includesLoaded++;

            // Als alle deelsbestanden geladen zijn, vuur het event af
            if (includesLoaded === totalIncludes) {
                console.log("Alle deelsbestanden zijn geladen, trigger includesLoaded event.");
                $(document).trigger('includesLoaded');
            }
        });
    });
}

// Start het laden van de deelsbestanden nadat de DOM volledig is geladen
$(document).ready(function() {
    console.log("Document is klaar.");
    loadIncludes();
});
