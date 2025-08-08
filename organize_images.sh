#!/bin/bash

# Script to organize images and generate images.json for dietervanlangenaker.be
# Run from the project root (dietervanlangenaker/)

# Create directory structure
mkdir -p assets/images/{logos,weddings,portraits,artistic,fashion,music,family,ballet,golden-hour}
mkdir -p assets/data

# Initialize images.json
echo "{" > assets/data/images.json

# Function to extract width and height from filename
extract_dimensions() {
    local filename="$1"
    # Extract dimensions (e.g., weddings012686x3760.jpg -> 2686, 3760)
    if [[ $filename =~ ([0-9]+)x([0-9]+)\.jpg$ ]]; then
        echo "${BASH_REMATCH[1]},${BASH_REMATCH[2]}"
    else
        echo "0,0" # Default if no dimensions found
    fi
}

# Function to add image to images.json
add_to_json() {
    local category="$1"
    local filename="$2"
    local url="assets/images/$category/$filename"
    # Convert filename to title (e.g., weddings01.jpg -> Weddings01)
    local title=$(echo "$filename" | sed 's/\([0-9]\+x[0-9]\+\)\.jpg$//' | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++){$i=toupper(substr($i,1,1)) tolower(substr($i,2))}}1')
    local description=""
    case $category in
        weddings) description="Wedding moment captured in soft light." ;;
        portraits) description="Portrait with natural elegance." ;;
        artistic) description="Artistic composition with creative flair." ;;
        fashion) description="Stylish fashion shot in vibrant settings." ;;
        music) description="Dynamic music-themed photography." ;;
        family) description="Heartwarming family moment." ;;
        ballet) description="Graceful ballet pose in serene settings." ;;
        golden-hour) description="Golden hour glow in stunning light." ;;
        logos) description="Branding logo for Dieter Van Langenaker." ;;
        *) description="Photography by Dieter Van Langenaker." ;;
    esac
    read width height <<< $(extract_dimensions "$filename")
    echo "    \"$filename\": {" >> assets/data/images.json
    echo "      \"url\": \"$url\"," >> assets/data/images.json
    echo "      \"title\": \"$title\"," >> assets/data/images.json
    echo "      \"description\": \"$description\"," >> assets/data/images.json
    echo "      \"width\": $width," >> assets/data/images.json
    echo "      \"height\": $height" >> assets/data/images.json
    echo "    }" >> assets/data/images.json
}

# Define categories and their filename patterns
declare -A categories=(
    ["weddings"]="weddings0[1-4].jpg|weddingsigning.jpg"
    ["portraits"]="girlportret.jpg|upclosefrontfaceyounggirl.jpg|banwpregnancyportret.jpg|mywifeandchild.jpg|novaly.jpg|me.jpg|modelbywindow.jpg|modelinbathingsuitbyarchitecturalwindow.jpg"
    ["artistic"]="artpicture.jpg|artpictureinbarcelonbandw.jpg|artpicturestairsinbudapest.jpg|artsydrummer.jpg|artsyguitarplayer.jpg|artsyindustrialcolorimageblueandgreen.jpg|artsyminimalbandwiscecream.jpg|artsymodel.jpg"
    ["fashion"]="fashionoutdoorspanishcitystairs.jpg|girlfashionshotoutdoor.jpg"
    ["music"]="coolbassplayer.jpg|guitarplayerlive.jpg"
    ["family"]="kidsfamilyshootbandw.jpg|kiidshootoutdoorwithballoon.jpg"
    ["ballet"]="ballletposebetweentrees.jpg|outdoorballetposesvenity.jpg"
    ["golden-hour"]="coolteenagegirlgoldenhourshoot.jpg|goldenhourlightblonderedhair.jpg|girlshootgoldencolrs.jpg|girlshoottree.jpg|Mybestshoteverwithcarolineasmodel.jpg"
)

# Process each category
first_category=true
for category in "${!categories[@]}"; do
    if [ "$first_category" = false ]; then
        echo "," >> assets/data/images.json
    fi
    echo "  \"$category\": [" >> assets/data/images.json
    first_image=true
    for pattern in ${categories[$category]}; do
        for file in images/$pattern; do
            if [ -f "$file" ]; then
                filename=$(basename "$file")
                mv "$file" "assets/images/$category/$filename"
                if [ "$first_image" = false ]; then
                    echo "," >> assets/data/images.json
                fi
                add_to_json "$category" "$filename"
                first_image=false
            fi
        done
    done
    echo "  ]" >> assets/data/images.json
    first_category=false
done

# Process logos separately
if [ -d "images/logos" ]; then
    if [ "$first_category" = false ]; then
        echo "," >> assets/data/images.json
    fi
    echo "  \"logos\": [" >> assets/data/images.json
    first_image=true
    for file in images/logos/*.jpg; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            mv "$file" "assets/images/logos/$filename"
            if [ "$first_image" = false ]; then
                echo "," >> assets/data/images.json
            fi
            add_to_json "logos" "$filename"
            first_image=false
        fi
    done
    echo "  ]" >> assets/data/images.json
fi

# Close images.json
echo "}" >> assets/data/images.json

# Clean up empty images folder
rmdir images/logos 2>/dev/null
rmdir images 2>/dev/null

echo "Images organized into assets/images/ and images.json generated."
echo "Edit assets/data/images.json to customize titles and descriptions."