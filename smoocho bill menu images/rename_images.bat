@echo off
echo SMOOCHO BILL - IMAGE RENAMING TOOL
echo ==================================
echo.
echo This tool will help you rename your menu images to match the correct names.
echo.
echo Instructions:
echo 1. Place all your menu images in this folder
echo 2. Run this script to see what images you have
echo 3. The script will show you which images need to be renamed
echo.
echo Press any key to continue...
pause

echo.
echo SCANNING FOR IMAGES...
echo =====================

set count=0
for %%f in (*.jpg *.jpeg *.png *.gif *.webp *.bmp) do (
    set /a count+=1
    echo Found: %%f
)

echo.
echo Total images found: %count%
echo.

if %count%==0 (
    echo No images found in this folder.
    echo Please add your menu images here first.
    pause
    exit
)

echo.
echo RECOMMENDED IMAGE NAMES:
echo ========================
echo.
echo KUNAFA BOWLS:
echo 01_hazelnut_kunafa.jpg
echo 02_white_chocolate_kunafa.jpg
echo 03_pista_kunafa.jpg
echo 04_biscoff_kunafa.jpg
echo 05_hazelnut_white_kunafa.jpg
echo 06_biscoff_hazelnut_kunafa.jpg
echo 07_pista_white_kunafa.jpg
echo 08_hazelnut_pista_kunafa.jpg
echo 09_biscoff_white_kunafa.jpg
echo 10_pista_biscoff_kunafa.jpg
echo 11_coffee_hazelnut_kunafa.jpg
echo 12_pista_coffee_kunafa.jpg
echo.
echo SIGNATURES:
echo 13_choco_tsunami.jpg
echo 14_mango_tsunami.jpg
echo 15_hazelnut_mango_cyclone.jpg
echo 16_pista_mango_thunderstorm.jpg
echo 17_biscoff_mango_hurricane.jpg
echo 18_pista_hazelnut_earthquake.jpg
echo 19_pista_biscoff_tsunami.jpg
echo 20_coffee_mango_cyclone.jpg
echo 21_pista_coffee_earthquake.jpg
echo.
echo CHOCO DESSERTS:
echo 22_choco_sponge_classic.jpg
echo 23_choco_sponge_premium.jpg
echo 24_choco_brownie_classic.jpg
echo 25_choco_brownie_premium.jpg
echo 26_coffee_sponge_classic.jpg
echo 27_coffee_sponge_premium.jpg
echo 28_coffee_brownie_classic.jpg
echo 29_coffee_brownie_premium.jpg
echo.
echo CRISPY RICE TUBS:
echo 30_hazelnut_white_crispy_rice.jpg
echo 31_hazelnut_biscoff_crispy_rice.jpg
echo 32_mango_hazelnut_crispy_rice.jpg
echo 33_pista_hazelnut_crispy_rice.jpg
echo 34_mango_pista_crispy_rice.jpg
echo 35_biscoff_white_crispy_rice.jpg
echo 36_pista_biscoff_crispy_rice.jpg
echo 37_mango_biscoff_crispy_rice.jpg
echo 38_coffee_hazelnut_crispy_rice.jpg
echo 39_mango_coffee_crispy_rice.jpg
echo 40_biscoff_coffee_crispy_rice.jpg
echo 41_coffee_pista_crispy_rice.jpg
echo.
echo FRUITS CHOCO MIX:
echo 42_choco_strawberry.jpg
echo 43_choco_kiwi.jpg
echo 44_choco_mixed_fruits_classic.jpg
echo 45_choco_mixed_fruits_premium.jpg
echo 46_choco_mango_classic.jpg
echo 47_choco_mango_premium.jpg
echo 48_choco_robusto_classic.jpg
echo 49_choco_robusto_premium.jpg
echo.
echo ICE CREAMS:
echo 50_choco_vanilla_scoop.jpg
echo 51_choco_chocolate_scoop.jpg
echo 52_choco_strawberry_scoop.jpg
echo 53_choco_mango_scoop.jpg
echo.
echo DRINKS:
echo 54_milo_dinauser.jpg
echo 55_malaysian_mango_milk.jpg
echo 56_korean_strawberry_milk.jpg
echo 57_vietnamese_iced_coffee.jpg
echo 58_premium_iced_coffee.jpg
echo.
echo TOPPINGS:
echo 59_fresh_robust_banana.jpg
echo 60_diced_mango.jpg
echo 61_sliced_strawberry.jpg
echo 62_sliced_kiwi.jpg
echo.
echo ==================================
echo TOTAL: 62 MENU ITEMS
echo ==================================
echo.
echo Please rename your images to match these exact names.
echo You can rename them manually or use this script as a reference.
echo.
echo Press any key to exit...
pause
