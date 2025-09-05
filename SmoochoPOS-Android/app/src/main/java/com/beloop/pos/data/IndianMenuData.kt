package com.beloop.pos.data

import com.beloop.pos.data.model.Product
import com.beloop.pos.data.model.NutritionalInfo

object IndianMenuData {
    
    fun getAllProducts(): List<Product> {
        return listOf(
            // KUNAFA BOWLS (12 items)
            Product(
                id = 1,
                name = "Hazelnut Kunafa",
                price = 299.0,
                category = "Kunafa Bowls",
                description = "Traditional kunafa with rich hazelnut cream",
                imageUrl = "drawable://white_chocolate_kunafa",
                preparationTime = 8,
                ingredients = listOf("Kunafa pastry", "Hazelnut cream", "Sugar syrup", "Pistachios"),
                allergens = listOf("Nuts", "Dairy", "Gluten"),
                nutritionalInfo = NutritionalInfo(calories = 450, protein = 8.0, carbs = 65.0, fat = 18.0),
                tags = listOf("Traditional", "Premium", "Nuts")
            ),
            Product(
                id = 2,
                name = "White Chocolate Kunafa",
                price = 329.0,
                category = "Kunafa Bowls",
                description = "Creamy white chocolate kunafa with premium toppings",
                imageUrl = "drawable://white_chocolate_kunafa",
                preparationTime = 8,
                ingredients = listOf("Kunafa pastry", "White chocolate", "Cream", "Sugar syrup"),
                allergens = listOf("Dairy", "Gluten"),
                nutritionalInfo = NutritionalInfo(calories = 480, protein = 7.0, carbs = 68.0, fat = 20.0),
                tags = listOf("Premium", "Chocolate", "Creamy")
            ),
            Product(
                id = 3,
                name = "Pista Kunafa",
                price = 349.0,
                category = "Kunafa Bowls",
                description = "Authentic pistachio kunafa with traditional flavors",
                imageUrl = "drawable://pista_kunafa",
                preparationTime = 8,
                ingredients = listOf("Kunafa pastry", "Pistachio cream", "Sugar syrup", "Rose water"),
                allergens = listOf("Nuts", "Dairy", "Gluten"),
                nutritionalInfo = NutritionalInfo(calories = 420, protein = 9.0, carbs = 62.0, fat = 16.0),
                tags = listOf("Traditional", "Pistachio", "Authentic")
            ),
            Product(
                id = 4,
                name = "Biscoff Kunafa",
                price = 379.0,
                category = "Kunafa Bowls",
                description = "Decadent kunafa with Biscoff cookie spread",
                imageUrl = "drawable://biscoff_kunafa",
                preparationTime = 8,
                ingredients = listOf("Kunafa pastry", "Biscoff spread", "Cream", "Cookie crumbs"),
                allergens = listOf("Dairy", "Gluten", "Nuts"),
                nutritionalInfo = NutritionalInfo(calories = 520, protein = 6.0, carbs = 72.0, fat = 22.0),
                tags = listOf("Premium", "Biscoff", "Decadent")
            ),
            Product(
                id = 5,
                name = "Hazelnut White Kunafa",
                price = 399.0,
                category = "Kunafa Bowls",
                description = "Premium kunafa with hazelnut and white chocolate",
                imageUrl = "drawable://hazelnut_white_kunafa",
                preparationTime = 8,
                ingredients = listOf("Kunafa pastry", "Hazelnut cream", "White chocolate", "Nuts"),
                allergens = listOf("Nuts", "Dairy", "Gluten"),
                nutritionalInfo = NutritionalInfo(calories = 550, protein = 8.0, carbs = 70.0, fat = 24.0),
                tags = listOf("Premium", "Hazelnut", "White Chocolate")
            ),
            Product(
                id = 6,
                name = "Classic Kunafa",
                price = 279.0,
                category = "Kunafa Bowls",
                description = "Traditional kunafa with authentic Middle Eastern flavors",
                imageUrl = "drawable://white_chocolate_kunafa",
                preparationTime = 8,
                ingredients = listOf("Kunafa pastry", "Sweet cheese", "Sugar syrup", "Pistachios"),
                allergens = listOf("Dairy", "Gluten", "Nuts"),
                nutritionalInfo = NutritionalInfo(calories = 380, protein = 10.0, carbs = 58.0, fat = 14.0),
                tags = listOf("Traditional", "Classic", "Authentic")
            ),
            Product(
                id = 7,
                name = "Chocolate Kunafa",
                price = 319.0,
                category = "Kunafa Bowls",
                description = "Rich chocolate kunafa with cocoa cream",
                imageUrl = "drawable://white_chocolate_kunafa",
                preparationTime = 8,
                ingredients = listOf("Kunafa pastry", "Chocolate cream", "Cocoa powder", "Sugar syrup"),
                allergens = listOf("Dairy", "Gluten"),
                nutritionalInfo = NutritionalInfo(calories = 460, protein = 7.0, carbs = 66.0, fat = 19.0),
                tags = listOf("Chocolate", "Rich", "Cocoa")
            ),
            Product(
                id = 8,
                name = "Strawberry Kunafa",
                price = 339.0,
                category = "Kunafa Bowls",
                description = "Fresh strawberry kunafa with berry cream",
                imageUrl = "drawable://white_chocolate_kunafa",
                preparationTime = 8,
                ingredients = listOf("Kunafa pastry", "Strawberry cream", "Fresh strawberries", "Sugar syrup"),
                allergens = listOf("Dairy", "Gluten"),
                nutritionalInfo = NutritionalInfo(calories = 400, protein = 6.0, carbs = 64.0, fat = 15.0),
                tags = listOf("Fruity", "Strawberry", "Fresh")
            ),
            Product(
                id = 9,
                name = "Mango Kunafa",
                price = 359.0,
                category = "Kunafa Bowls",
                description = "Tropical mango kunafa with mango cream",
                imageUrl = "drawable://white_chocolate_kunafa",
                preparationTime = 8,
                ingredients = listOf("Kunafa pastry", "Mango cream", "Mango pieces", "Sugar syrup"),
                allergens = listOf("Dairy", "Gluten"),
                nutritionalInfo = NutritionalInfo(calories = 420, protein = 6.0, carbs = 68.0, fat = 16.0),
                tags = listOf("Tropical", "Mango", "Fruity")
            ),
            Product(
                id = 10,
                name = "Oreo Kunafa",
                price = 369.0,
                category = "Kunafa Bowls",
                description = "Crunchy Oreo kunafa with cookie cream",
                imageUrl = "drawable://white_chocolate_kunafa",
                preparationTime = 8,
                ingredients = listOf("Kunafa pastry", "Oreo cream", "Oreo cookies", "Sugar syrup"),
                allergens = listOf("Dairy", "Gluten"),
                nutritionalInfo = NutritionalInfo(calories = 500, protein = 6.0, carbs = 74.0, fat = 21.0),
                tags = listOf("Oreo", "Crunchy", "Cookie")
            ),
            Product(
                id = 11,
                name = "Red Velvet Kunafa",
                price = 389.0,
                category = "Kunafa Bowls",
                description = "Luxurious red velvet kunafa with cream cheese",
                imageUrl = "drawable://white_chocolate_kunafa",
                preparationTime = 8,
                ingredients = listOf("Kunafa pastry", "Red velvet cream", "Cream cheese", "Sugar syrup"),
                allergens = listOf("Dairy", "Gluten"),
                nutritionalInfo = NutritionalInfo(calories = 480, protein = 8.0, carbs = 70.0, fat = 20.0),
                tags = listOf("Red Velvet", "Luxurious", "Cream Cheese")
            ),
            Product(
                id = 12,
                name = "Tiramisu Kunafa",
                price = 409.0,
                category = "Kunafa Bowls",
                description = "Italian-inspired tiramisu kunafa with coffee cream",
                imageUrl = "drawable://white_chocolate_kunafa",
                preparationTime = 8,
                ingredients = listOf("Kunafa pastry", "Coffee cream", "Mascarpone", "Cocoa powder"),
                allergens = listOf("Dairy", "Gluten"),
                nutritionalInfo = NutritionalInfo(calories = 520, protein = 9.0, carbs = 72.0, fat = 22.0),
                tags = listOf("Tiramisu", "Coffee", "Italian")
            ),

            // SIGNATURES (8 items)
            Product(
                id = 13,
                name = "Smoocho Special",
                price = 449.0,
                category = "Signatures",
                description = "Our signature dessert with premium ingredients",
                imageUrl = "drawable://gemini_image_main",
                preparationTime = 10,
                ingredients = listOf("Premium cream", "Mixed nuts", "Honey", "Rose petals"),
                allergens = listOf("Nuts", "Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 580, protein = 12.0, carbs = 45.0, fat = 35.0),
                tags = listOf("Signature", "Premium", "Special")
            ),
            Product(
                id = 14,
                name = "Royal Delight",
                price = 499.0,
                category = "Signatures",
                description = "Royal combination of premium desserts",
                imageUrl = "drawable://gemini_image_5",
                preparationTime = 12,
                ingredients = listOf("Gold leaf", "Premium cream", "Exotic fruits", "Champagne syrup"),
                allergens = listOf("Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 650, protein = 8.0, carbs = 55.0, fat = 40.0),
                tags = listOf("Royal", "Premium", "Luxury")
            ),
            Product(
                id = 15,
                name = "Chocolate Symphony",
                price = 429.0,
                category = "Signatures",
                description = "Multi-layered chocolate masterpiece",
                imageUrl = "drawable://gemini_image_6",
                preparationTime = 10,
                ingredients = listOf("Dark chocolate", "Milk chocolate", "White chocolate", "Cocoa nibs"),
                allergens = listOf("Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 720, protein = 10.0, carbs = 65.0, fat = 45.0),
                tags = listOf("Chocolate", "Multi-layered", "Symphony")
            ),
            Product(
                id = 16,
                name = "Berry Bliss",
                price = 399.0,
                category = "Signatures",
                description = "Fresh berry combination with cream",
                imageUrl = "drawable://gemini_image_7",
                preparationTime = 8,
                ingredients = listOf("Mixed berries", "Vanilla cream", "Mint leaves", "Berry syrup"),
                allergens = listOf("Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 380, protein = 6.0, carbs = 48.0, fat = 18.0),
                tags = listOf("Berry", "Fresh", "Bliss")
            ),
            Product(
                id = 17,
                name = "Nutty Paradise",
                price = 459.0,
                category = "Signatures",
                description = "Rich nut combination with premium cream",
                imageUrl = "drawable://gemini_image_8",
                preparationTime = 10,
                ingredients = listOf("Almonds", "Pistachios", "Walnuts", "Hazelnuts"),
                allergens = listOf("Nuts", "Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 680, protein = 15.0, carbs = 35.0, fat = 55.0),
                tags = listOf("Nuts", "Rich", "Paradise")
            ),
            Product(
                id = 18,
                name = "Caramel Dream",
                price = 379.0,
                category = "Signatures",
                description = "Smooth caramel with vanilla cream",
                imageUrl = "drawable://gemini_image_main",
                preparationTime = 8,
                ingredients = listOf("Caramel sauce", "Vanilla cream", "Sea salt", "Caramelized sugar"),
                allergens = listOf("Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 520, protein = 7.0, carbs = 68.0, fat = 25.0),
                tags = listOf("Caramel", "Smooth", "Dream")
            ),
            Product(
                id = 19,
                name = "Tropical Escape",
                price = 419.0,
                category = "Signatures",
                description = "Tropical fruits with coconut cream",
                imageUrl = "drawable://gemini_image_5",
                preparationTime = 9,
                ingredients = listOf("Mango", "Pineapple", "Coconut cream", "Passion fruit"),
                allergens = listOf("Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 450, protein = 5.0, carbs = 58.0, fat = 22.0),
                tags = listOf("Tropical", "Fruits", "Coconut")
            ),
            Product(
                id = 20,
                name = "Midnight Velvet",
                price = 469.0,
                category = "Signatures",
                description = "Dark chocolate velvet with gold accents",
                imageUrl = "drawable://gemini_image_6",
                preparationTime = 11,
                ingredients = listOf("Dark chocolate", "Velvet cream", "Gold dust", "Cocoa powder"),
                allergens = listOf("Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 680, protein = 9.0, carbs = 72.0, fat = 38.0),
                tags = listOf("Dark Chocolate", "Velvet", "Luxury")
            ),

            // CHOCO DESSERTS (6 items)
            Product(
                id = 21,
                name = "Chocolate Lava Cake",
                price = 299.0,
                category = "Choco Desserts",
                description = "Warm chocolate cake with molten center",
                imageUrl = "drawable://gemini_image_7",
                preparationTime = 15,
                ingredients = listOf("Dark chocolate", "Butter", "Eggs", "Sugar"),
                allergens = listOf("Dairy", "Eggs", "Gluten"),
                nutritionalInfo = NutritionalInfo(calories = 650, protein = 8.0, carbs = 75.0, fat = 35.0),
                tags = listOf("Lava Cake", "Warm", "Molten")
            ),
            Product(
                id = 22,
                name = "Chocolate Mousse",
                price = 249.0,
                category = "Choco Desserts",
                description = "Light and airy chocolate mousse",
                imageUrl = "drawable://gemini_image_8",
                preparationTime = 5,
                ingredients = listOf("Dark chocolate", "Heavy cream", "Egg whites", "Sugar"),
                allergens = listOf("Dairy", "Eggs"),
                nutritionalInfo = NutritionalInfo(calories = 420, protein = 6.0, carbs = 35.0, fat = 28.0),
                tags = listOf("Mousse", "Light", "Airy")
            ),
            Product(
                id = 23,
                name = "Chocolate Truffles",
                price = 199.0,
                category = "Choco Desserts",
                description = "Premium chocolate truffles (6 pieces)",
                imageUrl = "drawable://gemini_image_main",
                preparationTime = 3,
                ingredients = listOf("Dark chocolate", "Heavy cream", "Cocoa powder", "Vanilla"),
                allergens = listOf("Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 380, protein = 4.0, carbs = 28.0, fat = 30.0),
                tags = listOf("Truffles", "Premium", "Rich")
            ),
            Product(
                id = 24,
                name = "Chocolate Brownie",
                price = 229.0,
                category = "Choco Desserts",
                description = "Fudgy chocolate brownie with ice cream",
                imageUrl = "drawable://gemini_image_5",
                preparationTime = 8,
                ingredients = listOf("Dark chocolate", "Butter", "Flour", "Walnuts"),
                allergens = listOf("Dairy", "Gluten", "Nuts"),
                nutritionalInfo = NutritionalInfo(calories = 580, protein = 7.0, carbs = 68.0, fat = 32.0),
                tags = listOf("Brownie", "Fudgy", "Ice Cream")
            ),
            Product(
                id = 25,
                name = "Chocolate Cheesecake",
                price = 329.0,
                category = "Choco Desserts",
                description = "Rich chocolate cheesecake with berry compote",
                imageUrl = "drawable://gemini_image_6",
                preparationTime = 10,
                ingredients = listOf("Cream cheese", "Dark chocolate", "Graham crackers", "Berries"),
                allergens = listOf("Dairy", "Gluten", "Eggs"),
                nutritionalInfo = NutritionalInfo(calories = 720, protein = 12.0, carbs = 65.0, fat = 45.0),
                tags = listOf("Cheesecake", "Rich", "Berry")
            ),
            Product(
                id = 26,
                name = "Chocolate Fondue",
                price = 399.0,
                category = "Choco Desserts",
                description = "Warm chocolate fondue with fresh fruits",
                imageUrl = "drawable://gemini_image_7",
                preparationTime = 12,
                ingredients = listOf("Dark chocolate", "Heavy cream", "Fresh fruits", "Marshmallows"),
                allergens = listOf("Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 550, protein = 8.0, carbs = 58.0, fat = 32.0),
                tags = listOf("Fondue", "Warm", "Fruits")
            ),

            // CRISPY RICE TUBS (4 items)
            Product(
                id = 27,
                name = "Crispy Rice Chocolate",
                price = 179.0,
                category = "Crispy Rice Tubs",
                description = "Crispy rice with chocolate coating",
                imageUrl = "drawable://gemini_image_8",
                preparationTime = 5,
                ingredients = listOf("Crispy rice", "Dark chocolate", "Butter", "Vanilla"),
                allergens = listOf("Dairy", "Gluten"),
                nutritionalInfo = NutritionalInfo(calories = 320, protein = 4.0, carbs = 45.0, fat = 15.0),
                tags = listOf("Crispy", "Rice", "Chocolate")
            ),
            Product(
                id = 28,
                name = "Crispy Rice Vanilla",
                price = 169.0,
                category = "Crispy Rice Tubs",
                description = "Crispy rice with vanilla coating",
                imageUrl = "drawable://gemini_image_main",
                preparationTime = 5,
                ingredients = listOf("Crispy rice", "White chocolate", "Vanilla extract", "Butter"),
                allergens = listOf("Dairy", "Gluten"),
                nutritionalInfo = NutritionalInfo(calories = 300, protein = 3.0, carbs = 42.0, fat = 14.0),
                tags = listOf("Crispy", "Rice", "Vanilla")
            ),
            Product(
                id = 29,
                name = "Crispy Rice Strawberry",
                price = 189.0,
                category = "Crispy Rice Tubs",
                description = "Crispy rice with strawberry coating",
                imageUrl = "drawable://gemini_image_5",
                preparationTime = 5,
                ingredients = listOf("Crispy rice", "Strawberry chocolate", "Strawberry extract", "Butter"),
                allergens = listOf("Dairy", "Gluten"),
                nutritionalInfo = NutritionalInfo(calories = 310, protein = 3.0, carbs = 44.0, fat = 14.0),
                tags = listOf("Crispy", "Rice", "Strawberry")
            ),
            Product(
                id = 30,
                name = "Crispy Rice Mixed",
                price = 199.0,
                category = "Crispy Rice Tubs",
                description = "Mixed crispy rice with assorted flavors",
                imageUrl = "drawable://gemini_image_6",
                preparationTime = 5,
                ingredients = listOf("Crispy rice", "Mixed chocolates", "Nuts", "Dried fruits"),
                allergens = listOf("Dairy", "Gluten", "Nuts"),
                nutritionalInfo = NutritionalInfo(calories = 350, protein = 5.0, carbs = 48.0, fat = 16.0),
                tags = listOf("Crispy", "Rice", "Mixed")
            ),

            // FRUITS CHOCO MIX (3 items)
            Product(
                id = 31,
                name = "Fruit Chocolate Mix",
                price = 229.0,
                category = "Fruits Choco Mix",
                description = "Fresh fruits with chocolate coating",
                imageUrl = "drawable://gemini_image_7",
                preparationTime = 6,
                ingredients = listOf("Fresh fruits", "Dark chocolate", "White chocolate", "Nuts"),
                allergens = listOf("Dairy", "Nuts"),
                nutritionalInfo = NutritionalInfo(calories = 280, protein = 4.0, carbs = 35.0, fat = 16.0),
                tags = listOf("Fruits", "Chocolate", "Fresh")
            ),
            Product(
                id = 32,
                name = "Berry Chocolate Mix",
                price = 249.0,
                category = "Fruits Choco Mix",
                description = "Mixed berries with chocolate coating",
                imageUrl = "drawable://gemini_image_8",
                preparationTime = 6,
                ingredients = listOf("Mixed berries", "Dark chocolate", "Mint leaves", "Honey"),
                allergens = listOf("Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 260, protein = 3.0, carbs = 32.0, fat = 15.0),
                tags = listOf("Berries", "Chocolate", "Mixed")
            ),
            Product(
                id = 33,
                name = "Tropical Chocolate Mix",
                price = 269.0,
                category = "Fruits Choco Mix",
                description = "Tropical fruits with chocolate coating",
                imageUrl = "drawable://gemini_image_main",
                preparationTime = 6,
                ingredients = listOf("Mango", "Pineapple", "Kiwi", "Dark chocolate"),
                allergens = listOf("Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 290, protein = 3.0, carbs = 38.0, fat = 16.0),
                tags = listOf("Tropical", "Fruits", "Chocolate")
            ),

            // ICE CREAMS (2 items)
            Product(
                id = 34,
                name = "Premium Vanilla Ice Cream",
                price = 149.0,
                category = "Ice Creams",
                description = "Rich and creamy vanilla ice cream",
                imageUrl = "drawable://gemini_image_5",
                preparationTime = 2,
                ingredients = listOf("Fresh cream", "Vanilla beans", "Sugar", "Egg yolks"),
                allergens = listOf("Dairy", "Eggs"),
                nutritionalInfo = NutritionalInfo(calories = 250, protein = 4.0, carbs = 25.0, fat = 15.0),
                tags = listOf("Vanilla", "Creamy", "Premium")
            ),
            Product(
                id = 35,
                name = "Chocolate Ice Cream",
                price = 169.0,
                category = "Ice Creams",
                description = "Rich chocolate ice cream with cocoa",
                imageUrl = "drawable://gemini_image_6",
                preparationTime = 2,
                ingredients = listOf("Fresh cream", "Dark chocolate", "Cocoa powder", "Sugar"),
                allergens = listOf("Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 280, protein = 5.0, carbs = 28.0, fat = 18.0),
                tags = listOf("Chocolate", "Rich", "Cocoa")
            ),

            // DRINKS (2 items)
            Product(
                id = 36,
                name = "Premium Coffee",
                price = 99.0,
                category = "Drinks",
                description = "Premium arabica coffee with cream",
                imageUrl = "drawable://gemini_image_7",
                preparationTime = 3,
                ingredients = listOf("Arabica beans", "Fresh cream", "Sugar", "Vanilla"),
                allergens = listOf("Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 120, protein = 2.0, carbs = 15.0, fat = 6.0),
                tags = listOf("Coffee", "Premium", "Arabica")
            ),
            Product(
                id = 37,
                name = "Fresh Juice",
                price = 79.0,
                category = "Drinks",
                description = "Fresh seasonal fruit juice",
                imageUrl = "drawable://gemini_image_8",
                preparationTime = 2,
                ingredients = listOf("Fresh fruits", "Ice", "Mint leaves", "Honey"),
                allergens = listOf(),
                nutritionalInfo = NutritionalInfo(calories = 80, protein = 1.0, carbs = 20.0, fat = 0.0),
                tags = listOf("Fresh", "Juice", "Seasonal")
            )
        )
    }
    
    fun getCategories(): List<String> {
        return listOf(
            "All",
            "Kunafa Bowls",
            "Signatures", 
            "Choco Desserts",
            "Crispy Rice Tubs",
            "Fruits Choco Mix",
            "Ice Creams",
            "Drinks"
        )
    }
}
