#!/bin/bash

# Script to move and rename images to assets/images/ and generate images.json for dietervanlangenaker.be
# Run from the project root (/Users/dietervanlangenaker/Desktop/nieuwe pogingen website/dietervanlangenaker.be/)

# Debug mode: print commands and their arguments
set -x

# Ensure we are in the correct directory
PROJECT_ROOT="/Users/dietervanlangenaker/Desktop/nieuwe pogingen website/dietervanlangenaker.be"
if [ "$(pwd)" != "$PROJECT_ROOT" ]; then
    echo "Error: Please run this script from $PROJECT_ROOT"
    exit 1
fi

# Check if images/ directory exists
if [ ! -d "images" ]; then
    echo "Error: images/ directory not found in $PROJECT_ROOT"
    exit 1
fi

# Create directory structure
echo "Creating directory structure..."
mkdir -p assets/images/{logos,weddings,portraits,artistic,fashion,music,family,ballet,golden-hour}
mkdir -p assets/data

# Clear existing images in assets/images/ to avoid duplicates
echo "Clearing existing images in assets/images/..."
for category in logos weddings portraits artistic fashion music family ballet golden-hour; do
    rm -f assets/images/$category/*.jpg
done

# Initialize images.json
echo "Initializing assets/data/images.json..."
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
    # Convert filename to title (e.g., weddings01.jpg -> Weddings 01)
    local title=$(echo "$filename" | sed 's/\([0-9]\+x[0-9]\+\)\.jpg$//' | sed 's/\.jpg$//' | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++){$i=toupper(substr($i,1,1)) tolower(substr($i,2))}}1')
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

# Define categories and mappings for original to new filenames
declare -A categories=(
    ["weddings"]="weddings012686x3760.jpg:weddings01.jpg|weddings022487x3482.jpg:weddings02.jpg|weddings034765x2978.jpg:weddings03.jpg|weddings043448x5168.jpg:weddings04.jpg|weddingsigning4753x2971.jpg:weddingsigning.jpg"
    ["portraits"]="girlportret2607x3907.jpg:girlportret.jpg|upclosefrontfaceyounggirl5065x2849.jpg:upclosefrontfaceyounggirl.jpg|banwpregnancyportret2847x3986.jpg:banwpregnancyportret.jpg|mywifeandchild1737x2432.jpg:mywifeandchild.jpg|novaly15110x3407.jpg:novaly.jpg|me2732x4096.jpg:me.jpg|modelbywindow1755x2458.jpg:modelbywindow.jpg|modelinbathingsuitbyarchitecturalwindow5706x4076.jpg:modelinbathingsuitbyarchitecturalwindow.jpg|girlinfrontofwater2766x4146.jpg:girlinfrontofwater.jpg"
    ["artistic"]="artpicture3303x4624.jpg:artpicture.jpg|artpictureinbarcelonbandw3303x4624.jpg:artpictureinbarcelonbandw.jpg|artpicturestairsinbudapest1866x1244.jpg:artpicturestairsinbudapest.jpg|artsydrummer2732x4096.jpg:artsydrummer.jpg|artsyguitarplayer2732x4096.jpg:artsyguitarplayer.jpg|artsyindustrialcolorimageblueandgreen1543x1025.jpg:artsyindustrialcolorimageblueandgreen.jpg|artsyminimalbandwiscecream4096x2720.jpg:artsyminimalbandwiscecream.jpg|artsymodel4096x2925.jpg:artsymodel.jpg"
    ["fashion"]="fashionoutdoorspanishcitystairs3166x3958.jpg:fashionoutdoorspanishcitystairs.jpg|girlfashionshotoutdoor2015x3020.jpg:girlfashionshotoutdoor.jpg"
    ["music"]="coolbassplayer4096x2303.jpg:coolbassplayer.jpg|guitarplayerlive1372x1920.jpg:guitarplayerlive.jpg"
    ["family"]="kidsfamilyshootbandw3195x4472.jpg:kidsfamilyshootbandw.jpg|kiidshootoutdoorwithballoon5072x3381.jpg:kiidshootoutdoorwithballoon.jpg"
    ["ballet"]="ballletposebetweentrees2702x3782.jpg:ballletposebetweentrees.jpg|outdoorballetposesvenity2504x1789.jpg:outdoorballetposesvenity.jpg"
    ["golden-hour"]="coolteenagegirlgoldenhourshoot3963x2644.jpg:coolteenagegirlgoldenhourshoot.jpg|goldenhourlightblonderedhair1340x1876.jpg:goldenhourlightblonderedhair.jpg|girlshootgoldencolrs4820x2711.jpg:girlshootgoldencolrs.jpg|girlshoottree4217x2814.jpg:girlshoottree.jpg|Mybestshoteverwithcarolineasmodel2048x1365.jpg:mybestshoteverwithcarolineasmodel.jpg"
    ["logos"]="mainlogoimagewwhitfontblackbackgroundfullscreen1050x600.jpg:mainlogoimagewhitefontblackbackgroundfullscreen1050x600.jpg|mysignaturelogotransparantbgwhitefont1007x591.jpg:mysignaturelogotransparantbgwhitefont1007x591.jpg"
)

# Process each category
echo "Processing images..."
first_category=true
for category in "${!categories[@]}"; do
    if [ "$first_category" = false ]; then
        echo "," >> assets/data/images.json
    fi
    echo "  \"$category\": [" >> assets/data/images.json
    first_image=true
    IFS='|' read -ra mappings <<< "${categories[$category]}"
    for mapping in "${mappings[@]}"; do
        IFS=':' read -r original new <<< "$mapping"
        source_path="images/$original"
        if [ -f "$source_path" ]; then
            echo "Moving $source_path to assets/images/$category/$new"
            mv "$source_path" "assets/images/$category/$new"
            if [ $? -eq 0 ]; then
                if [ "$first_image" = false ]; then
                    echo "," >> assets/data/images.json
                fi
                add_to_json "$category" "$new"
                first_image=false
            else
                echo "Error: Failed to move $source_path"
            fi
        else
            echo "Warning: $source_path not found, skipping."
        fi
    done
    echo "  ]" >> assets/data/images.json
    first_category=false
done

# Close images.json
echo "}" >> assets/data/images.json

# Clean up empty images folder
echo "Cleaning up images/ directory..."
rmdir images 2>/dev/null

echo "Script completed."
echo "Images moved and renamed to assets/images/ subfolders."
echo "Updated assets/data/images.json generated."
echo "Check assets/images/ for moved images."
echo "Validate assets/data/images.json at jsonlint.com if errors persist."
echo "Next steps: Fix fonts and Lightbox2, test locally, and deploy to one.com."

