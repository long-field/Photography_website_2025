#!/bin/bash

# Script to set up directory structure and empty files for dietervanlangenaker.be
# Run from the project root (dietervanlangenaker/)

# Create directory structure
mkdir -p assets/{css,js,data,fonts,images/{logos,weddings,portraits,artistic,fashion,music,family,ballet,golden-hour}}

# Create empty HTML files
touch index.html
touch portfolio.html
touch contact.html
touch about.html

# Create empty CSS and JS files
touch assets/css/custom.css
touch assets/js/main.js

# Create empty .htaccess file
touch .htaccess

# Create empty images.json with initial structure
cat > assets/data/images.json << EOL
{
  "logos": [],
  "weddings": [],
  "portraits": [],
  "artistic": [],
  "fashion": [],
  "music": [],
  "family": [],
  "ballet": [],
  "golden-hour": []
}
EOL

# Create empty font files (assuming you'll add lato.css and playfair-display.css later)
touch assets/fonts/lato.css
touch assets/fonts/playfair-display.css

echo "Directory structure and empty files created successfully."
echo "Populate assets/data/images.json with image metadata when ready."
echo "Add font files to assets/fonts/ or use CDN links in custom.css."