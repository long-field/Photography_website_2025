#!/bin/bash

# Script to rename images in assets/images/ and generate images.json for dietervanlangenaker.be
# Run from the project root (/Users/dietervanlangenaker/Desktop/nieuwe pogingen website/dietervanlangenaker.be/)

# Debug mode: print commands and their arguments
set -x

# Ensure we are in the correct directory
PROJECT_ROOT="/Users/dietervanlangenaker/Desktop/nieuwe pogingen website/dietervanlangenaker.be"
if [ "$(pwd)" != "$PROJECT_ROOT" ]; then
    echo "Error: Please run this script from $PROJECT_ROOT"
    exit 1
fi

# Check if assets/images/ directory exists
if [ ! -d "assets/images" ]; then
    echo "Error: assets/images/ directory not found in $PROJECT_ROOT"
    exit 1
fi

# Ensure assets/data/ exists
mkdir -p assets/data

# Initialize images.json
echo "Initializing assets/data/images.json..."
echo "{" > assets/data/images.json

# Function to get dimensions from original filename mapping
get_dimensions() {
    local filename="$1"
    case "$filename" in
        weddings01.jpg) echo "2686,3760" ;;
        weddings02.jpg) echo "2487,3482" ;;
        weddings03.jpg) echo "4765,2978" ;;
        weddings04.jpg) echo "3448,5168" ;;
        weddingsigning.jpg) echo "4753,2971" ;;
        girlportret.jpg) echo "2607,3907" ;;
        upclosefrontfaceyounggirl.jpg) echo "5065,2849" ;;
        banwpregnancyportret.jpg) echo "2847,3986" ;;
        mywifeandchild.jpg) echo "1737,2432" ;;
        novaly.jpg) echo "15110,3407" ;;
        me.jpg) echo "2732,4096" ;;
        modelbywindow.jpg) echo "1755,2458" ;;
        modelinbathingsuitbyarchitecturalwindow.jpg) echo "5706,4076" ;;
        girlinfrontofwater.jpg) echo "2766,4146" ;;
        artpicture.jpg) echo "3303,4624" ;;
        artpictureinbarcelonbandw.jpg) echo "3303,4624" ;;
        artpicturestairsinbudapest.jpg) echo "1866,1244" ;;
        artsydrummer.jpg) echo "2732,4096" ;;
        artsyguitarplayer.jpg) echo "2732,4096" ;;
        artsyindustrialcolorimageblueandgreen.jpg) echo "1543,1025" ;;
        artsyminimalbandwiscecream.jpg) echo "4096,2720" ;;
        artsymodel.jpg) echo "4096,2925" ;;
        fashionoutdoorspanishcitystairs.jpg) echo "3166,3958" ;;
        girlfashionshotoutdoor.jpg) echo "2015,3020" ;;
        coolbassplayer.jpg) echo "4096,2303" ;;
        guitarplayerlive.jpg) echo "1372,1920" ;;
        kidsfamilyshootbandw.jpg) echo "3195,4472" ;;
        kiidshootoutdoorwithballoon.jpg) echo "5072,3381" ;;
        ballletposebetweentrees.jpg) echo "2702,3782" ;;
        outdoorballetposesvenity.jpg) echo "2504,1789" ;;
        coolteenagegirlgoldenhourshoot.jpg) echo "3963,2644" ;;
        goldenhourlightblonderedhair.jpg) echo "1340,1876" ;;
        girlshootgoldencolrs.jpg) echo "4820,2711" ;;
        girlshoottree.jpg) echo "4217,2814" ;;
        mybestshoteverwithcarolineasmodel.jpg) echo "2048,1365" ;;
        mainlogoimagewhitefontblackbackgroundfullscreen.jpg) echo "1050,600" ;;
        mysignaturelogotransparantbgwhitefont.jpg) echo "1007,591" ;;
        *) echo "0,0" ;;
    esac
}

# Function to add image to images.json
add_to_json() {
    local category="$1"
    local filename="$2"
    local url="assets/images/$category/$filename"
    # Convert filename to title (e.g., weddings01.jpg -> Weddings 01)
    local title=$(echo "$filename" | sed 's/\([0-9]\+x[0-9]\+\)\.jpg$//' | sed 's/\.jpg$//' | sed 's/\.png$//' | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++){$i=toupper(substr($i,1,1)) tolower(substr($i,2))}}1')
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
    read width height <<< $(get_dimensions "$filename")
    echo "    \"$filename\": {" >> assets/data/images.json
    echo "      \"url\": \"$url\"," >> assets/data/images.json
    echo "      \"title\": \"$title\"," >> assets/data/images.json
    echo "      \"description\": \"$description\"," >> assets/data/images.json
    echo "      \"width\": $width," >> assets/data/images.json
    echo "      \"height\": $height" >> assets/data/images.json
    echo "    }" >> assets/data/images.json
}

# Define categories and images (current filenames and desired filenames)
declare -A categories=(
    ["weddings"]="weddings01.jpg:weddings01.jpg|weddings02.jpg:weddings02.jpg|weddings03.jpg:weddings03.jpg|weddings04.jpg:weddings04.jpg|weddingsigning.jpg:weddingsigning.jpg"
    ["portraits"]="girlportret.jpg:girlportret.jpg|upclosefrontfaceyounggirl.jpg:upclosefrontfaceyounggirl.jpg|banwpregnancyportret.jpg:banwpregnancyportret.jpg|mywifeandchild.jpg:mywifeandchild.jpg|novaly1.jpg:novaly.jpg|me.jpg:me.jpg|modelbywindow.jpg:modelbywindow.jpg|modelinbathingsuitbyarchitecturalwindow.jpg:modelinbathingsuitbyarchitecturalwindow.jpg|girlinfrontofwater.jpg:girlinfrontofwater.jpg"
    ["artistic"]="artpicture.jpg:artpicture.jpg|artpictureinbarcelonbandw.jpg:artpictureinbarcelonbandw.jpg|artpicturestairsinbudapest.jpg:artpicturestairsinbudapest.jpg|artsydrummer.jpg:artsydrummer.jpg|artsyguitarplayer.jpg:artsyguitarplayer.jpg|artsyindustrialcolorimageblueandgreen.jpg:artsyindustrialcolorimageblueandgreen.jpg|artsyminimalbandwiscecream.jpg:artsyminimalbandwiscecream.jpg|artsymodel.jpg:artsymodel.jpg"
    ["fashion"]="fashionoutdoorspanishcitystairs.jpg:fashionoutdoorspanishcitystairs.jpg|girlfashionshotoutdoor.jpg:girlfashionshotoutdoor.jpg"
    ["music"]="coolbassplayer.jpg:coolbassplayer.jpg|guitarplayerlive.jpg:guitarplayerlive.jpg"
    ["family"]="kidsfamilyshootbandw.jpg:kidsfamilyshootbandw.jpg|kiidshootoutdoorwithballoon.jpg:kiidshootoutdoorwithballoon.jpg"
    ["ballet"]="ballletposebetweentrees.jpg:ballletposebetweentrees.jpg|outdoorballetposesvenity.jpg:outdoorballetposesvenity.jpg"
    ["golden-hour"]="coolteenagegirlgoldenhourshoot.jpg:coolteenagegirlgoldenhourshoot.jpg|goldenhourlightblonderedhair.jpg:goldenhourlightblonderedhair.jpg|girlshootgoldencolrs.jpg:girlshootgoldencolrs.jpg|girlshoottree.jpg:girlshoottree.jpg|Mybestshoteverwithcarolineasmodel.jpg:mybestshoteverwithcarolineasmodel.jpg"
    ["logos"]="mainlogoimagewwhitfontblackbackgroundfullscreen.png:mainlogoimagewhitefontblackbackgroundfullscreen.jpg|mysignaturelogotransparantbgwhitefont.png:mysignaturelogotransparantbgwhitefont.jpg"
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
        IFS=':' read -r current new <<< "$mapping"
        source_path="assets/images/$category/$current"
        dest_path="assets/images/$category/$new"
        if [ -f "$source_path" ]; then
            if [ "$current" != "$new" ]; then
                echo "Renaming $source_path to $dest_path"
                mv "$source_path" "$dest_path"
                if [ $? -eq 0 ]; then
                    if [ "$first_image" = false ]; then
                        echo "," >> assets/data/images.json
                    fi
                    add_to_json "$category" "$new"
                    first_image=false
                else
                    echo "Error: Failed to rename $source_path to $dest_path"
                fi
            else
                if [ "$first_image" = false ]; then
                    echo "," >> assets/data/images.json
                fi
                add_to_json "$category" "$new"
                first_image=false
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

echo "Script completed."
echo "Images renamed in assets/images/ subfolders."
echo "Updated assets/data/images.json generated."
echo "Check assets/images/ for renamed files."
echo "Validate assets/data/images.json at jsonlint.com if errors persist."
echo "Next steps: Fix fonts and Lightbox2, test locally, and deploy to one.com."