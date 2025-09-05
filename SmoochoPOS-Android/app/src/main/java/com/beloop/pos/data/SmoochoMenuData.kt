package com.beloop.pos.data

import com.beloop.pos.data.model.Product
import com.beloop.pos.data.model.NutritionalInfo
import java.util.Date

object SmoochoMenuData {
    
    fun getAllProducts(): List<Product> {
        return listOf(
            // KUNAFA BOWLS (12 items)
                                Product(
                        id = 1,
                        name = "Hazelnut Kunafa",
                        price = 299.0,
                        category = "Kunafa Bowls",
                        description = "Traditional kunafa with rich hazelnut cream",
                        imageUrl = "drawable://white_chocolate_kunafa", // Using available image
                        preparationTime = 8,
                        ingredients = listOf("Kunafa pastry", "Hazelnut cream", "Sugar syrup", "Pistachios"),
                        allergens = listOf("Nuts", "Dairy", "Gluten"),
                        nutritionalInfo = NutritionalInfo(calories = 450, protein = 8.0, carbs = 65.0, fat = 18.0),
                        tags = listOf("Traditional", "Premium", "Nuts")
                    ),
            Product(
                id = 2,
                name = "White Chocolate Kunafa",
                price = 13.99,
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
                price = 12.99,
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
                price = 14.99,
                category = "Kunafa Bowls",
                description = "Modern twist with Biscoff cookie spread",
                imageUrl = "drawable://biscoff_kunafa",
                preparationTime = 8,
                ingredients = listOf("Kunafa pastry", "Biscoff spread", "Cream", "Cookie crumbs"),
                allergens = listOf("Dairy", "Gluten", "Soy"),
                nutritionalInfo = NutritionalInfo(calories = 520, protein = 6.0, carbs = 72.0, fat = 22.0),
                tags = listOf("Modern", "Biscoff", "Cookie")
            ),
            Product(
                id = 5,
                name = "Hazelnut White Kunafa",
                price = 15.99,
                category = "Kunafa Bowls",
                description = "Premium combination of hazelnut and white chocolate",
                imageUrl = "drawable://hazelnut_white_kunafa",
                preparationTime = 10,
                ingredients = listOf("Kunafa pastry", "Hazelnut cream", "White chocolate", "Premium toppings"),
                allergens = listOf("Nuts", "Dairy", "Gluten"),
                nutritionalInfo = NutritionalInfo(calories = 550, protein = 8.0, carbs = 70.0, fat = 24.0),
                tags = listOf("Premium", "Combination", "Luxury")
            ),
            
            // SIGNATURES (9 items)
            Product(
                id = 6,
                name = "Choco Tsunami",
                price = 16.99,
                category = "Signatures",
                description = "Chocolate explosion with multiple layers",
                imageUrl = "drawable://gemini_image_main",
                preparationTime = 12,
                ingredients = listOf("Chocolate sponge", "Chocolate mousse", "Chocolate ganache", "Chocolate chips"),
                allergens = listOf("Dairy", "Gluten", "Eggs"),
                nutritionalInfo = NutritionalInfo(calories = 680, protein = 12.0, carbs = 85.0, fat = 32.0),
                tags = listOf("Signature", "Chocolate", "Premium")
            ),
            Product(
                id = 7,
                name = "Mango Tsunami",
                price = 15.99,
                category = "Signatures",
                description = "Tropical mango delight with creamy layers",
                imageUrl = "drawable://gemini_image_5",
                preparationTime = 10,
                ingredients = listOf("Mango puree", "Cream", "Sponge cake", "Mango chunks"),
                allergens = listOf("Dairy", "Gluten", "Eggs"),
                nutritionalInfo = NutritionalInfo(calories = 520, protein = 8.0, carbs = 78.0, fat = 18.0),
                tags = listOf("Signature", "Mango", "Tropical")
            ),
            Product(
                id = 8,
                name = "Hazelnut Mango Cyclone",
                price = 17.99,
                category = "Signatures",
                description = "Perfect blend of hazelnut and mango flavors",
                imageUrl = "drawable://gemini_image_6",
                preparationTime = 12,
                ingredients = listOf("Hazelnut cream", "Mango puree", "Sponge", "Premium toppings"),
                allergens = listOf("Nuts", "Dairy", "Gluten"),
                nutritionalInfo = NutritionalInfo(calories = 580, protein = 10.0, carbs = 75.0, fat = 26.0),
                tags = listOf("Signature", "Combination", "Premium")
            ),
            Product(
                id = 9,
                name = "Pista Mango Thunderstorm",
                price = 16.99,
                category = "Signatures",
                description = "Pistachio and mango storm of flavors",
                imageUrl = "drawable://gemini_image_7",
                preparationTime = 12,
                ingredients = listOf("Pistachio cream", "Mango puree", "Sponge", "Pistachio nuts"),
                allergens = listOf("Nuts", "Dairy", "Gluten"),
                nutritionalInfo = NutritionalInfo(calories = 540, protein = 11.0, carbs = 72.0, fat = 22.0),
                tags = listOf("Signature", "Pistachio", "Mango")
            ),
            Product(
                id = 10,
                name = "Biscoff Mango Hurricane",
                price = 18.99,
                category = "Signatures",
                description = "Biscoff and mango hurricane of taste",
                imageUrl = "drawable://gemini_image_8",
                preparationTime = 12,
                ingredients = listOf("Biscoff spread", "Mango puree", "Cream", "Cookie pieces"),
                allergens = listOf("Dairy", "Gluten", "Soy"),
                nutritionalInfo = NutritionalInfo(calories = 620, protein = 9.0, carbs = 82.0, fat = 28.0),
                tags = listOf("Signature", "Biscoff", "Mango")
            ),
            
            // CHOCO DESSERTS (8 items)
            Product(
                id = 11,
                name = "Choco Sponge Classic",
                price = 8.99,
                category = "Choco Desserts",
                description = "Classic chocolate sponge with rich cream",
                imageUrl = "drawable://gemini_image_main",
                preparationTime = 5,
                ingredients = listOf("Chocolate sponge", "Chocolate cream", "Chocolate sauce"),
                allergens = listOf("Dairy", "Gluten", "Eggs"),
                nutritionalInfo = NutritionalInfo(calories = 380, protein = 6.0, carbs = 52.0, fat = 16.0),
                tags = listOf("Classic", "Chocolate", "Sponge")
            ),
            Product(
                id = 12,
                name = "Choco Sponge Premium",
                price = 11.99,
                category = "Choco Desserts",
                description = "Premium chocolate sponge with luxury toppings",
                imageUrl = "drawable://gemini_image_y6jfux",
                preparationTime = 6,
                ingredients = listOf("Premium chocolate sponge", "Luxury cream", "Gold flakes", "Premium chocolate"),
                allergens = listOf("Dairy", "Gluten", "Eggs"),
                nutritionalInfo = NutritionalInfo(calories = 450, protein = 8.0, carbs = 58.0, fat = 20.0),
                tags = listOf("Premium", "Luxury", "Chocolate")
            ),
            Product(
                id = 13,
                name = "Choco Brownie Classic",
                price = 9.99,
                category = "Choco Desserts",
                description = "Rich chocolate brownie with classic toppings",
                imageUrl = "drawable://gemini_image_yet6yr",
                preparationTime = 5,
                ingredients = listOf("Chocolate brownie", "Chocolate sauce", "Whipped cream"),
                allergens = listOf("Dairy", "Gluten", "Eggs", "Nuts"),
                nutritionalInfo = NutritionalInfo(calories = 420, protein = 7.0, carbs = 55.0, fat = 18.0),
                tags = listOf("Classic", "Brownie", "Rich")
            ),
            Product(
                id = 14,
                name = "Choco Brownie Premium",
                price = 12.99,
                category = "Choco Desserts",
                description = "Premium chocolate brownie with luxury ingredients",
                imageUrl = "drawable://gemini_image_yet6yr_1",
                preparationTime = 6,
                ingredients = listOf("Premium brownie", "Luxury chocolate", "Gold dust", "Premium cream"),
                allergens = listOf("Dairy", "Gluten", "Eggs", "Nuts"),
                nutritionalInfo = NutritionalInfo(calories = 480, protein = 9.0, carbs = 62.0, fat = 22.0),
                tags = listOf("Premium", "Luxury", "Brownie")
            ),
            
            // CRISPY RICE TUBS (12 items)
            Product(
                id = 15,
                name = "Hazelnut White Crispy Rice",
                price = 10.99,
                category = "Crispy Rice Tubs",
                description = "Crispy rice with hazelnut and white chocolate",
                imageUrl = "drawable://white_chocolate_kunafa",
                preparationTime = 6,
                ingredients = listOf("Crispy rice", "Hazelnut cream", "White chocolate", "Sugar"),
                allergens = listOf("Nuts", "Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 350, protein = 5.0, carbs = 48.0, fat = 14.0),
                tags = listOf("Crispy", "Rice", "Hazelnut")
            ),
            Product(
                id = 16,
                name = "Hazelnut Biscoff Crispy Rice",
                price = 11.99,
                category = "Crispy Rice Tubs",
                description = "Crispy rice with hazelnut and Biscoff combination",
                imageUrl = "drawable://biscoff_kunafa",
                preparationTime = 6,
                ingredients = listOf("Crispy rice", "Hazelnut cream", "Biscoff spread", "Cookie pieces"),
                allergens = listOf("Nuts", "Dairy", "Gluten", "Soy"),
                nutritionalInfo = NutritionalInfo(calories = 380, protein = 6.0, carbs = 52.0, fat = 16.0),
                tags = listOf("Crispy", "Rice", "Biscoff")
            ),
            Product(
                id = 17,
                name = "Mango Hazelnut Crispy Rice",
                price = 11.99,
                category = "Crispy Rice Tubs",
                description = "Tropical mango with hazelnut crispy rice",
                imageUrl = "drawable://gemini_image_5",
                preparationTime = 6,
                ingredients = listOf("Crispy rice", "Mango puree", "Hazelnut cream", "Fresh mango"),
                allergens = listOf("Nuts", "Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 360, protein = 5.0, carbs = 55.0, fat = 12.0),
                tags = listOf("Crispy", "Rice", "Mango")
            ),
            Product(
                id = 18,
                name = "Pista Hazelnut Crispy Rice",
                price = 10.99,
                category = "Crispy Rice Tubs",
                description = "Pistachio and hazelnut crispy rice delight",
                imageUrl = "drawable://pista_kunafa",
                preparationTime = 6,
                ingredients = listOf("Crispy rice", "Pistachio cream", "Hazelnut cream", "Nuts"),
                allergens = listOf("Nuts", "Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 340, protein = 7.0, carbs = 45.0, fat = 15.0),
                tags = listOf("Crispy", "Rice", "Pistachio")
            ),
            
            // FRUITS CHOCO MIX (8 items)
            Product(
                id = 19,
                name = "Choco Strawberry",
                price = 9.99,
                category = "Fruits Choco Mix",
                description = "Fresh strawberries with chocolate cream",
                imageUrl = "drawable://gemini_image_6",
                preparationTime = 5,
                ingredients = listOf("Fresh strawberries", "Chocolate cream", "Whipped cream", "Chocolate sauce"),
                allergens = listOf("Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 280, protein = 4.0, carbs = 42.0, fat = 10.0),
                tags = listOf("Fruit", "Strawberry", "Chocolate")
            ),
            Product(
                id = 20,
                name = "Choco Kiwi",
                price = 9.99,
                category = "Fruits Choco Mix",
                description = "Fresh kiwi with chocolate cream",
                imageUrl = "drawable://gemini_image_7",
                preparationTime = 5,
                ingredients = listOf("Fresh kiwi", "Chocolate cream", "Whipped cream", "Chocolate sauce"),
                allergens = listOf("Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 260, protein = 4.0, carbs = 40.0, fat = 9.0),
                tags = listOf("Fruit", "Kiwi", "Chocolate")
            ),
            Product(
                id = 21,
                name = "Choco Mixed Fruits Classic",
                price = 11.99,
                category = "Fruits Choco Mix",
                description = "Mixed fresh fruits with classic chocolate cream",
                imageUrl = "drawable://gemini_image_8",
                preparationTime = 6,
                ingredients = listOf("Mixed fruits", "Chocolate cream", "Whipped cream", "Chocolate sauce"),
                allergens = listOf("Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 320, protein = 5.0, carbs = 48.0, fat = 12.0),
                tags = listOf("Fruit", "Mixed", "Classic")
            ),
            Product(
                id = 22,
                name = "Choco Mixed Fruits Premium",
                price = 14.99,
                category = "Fruits Choco Mix",
                description = "Premium mixed fruits with luxury chocolate cream",
                imageUrl = "drawable://gemini_image_y6jfux",
                preparationTime = 7,
                ingredients = listOf("Premium fruits", "Luxury chocolate", "Premium cream", "Gold flakes"),
                allergens = listOf("Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 380, protein = 6.0, carbs = 55.0, fat = 15.0),
                tags = listOf("Fruit", "Mixed", "Premium")
            ),
            Product(
                id = 23,
                name = "Choco Mango Classic",
                price = 10.99,
                category = "Fruits Choco Mix",
                description = "Fresh mango with classic chocolate cream",
                imageUrl = "drawable://gemini_image_5",
                preparationTime = 5,
                ingredients = listOf("Fresh mango", "Chocolate cream", "Whipped cream", "Chocolate sauce"),
                allergens = listOf("Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 300, protein = 4.0, carbs = 45.0, fat = 11.0),
                tags = listOf("Fruit", "Mango", "Classic")
            ),
            Product(
                id = 24,
                name = "Choco Mango Premium",
                price = 13.99,
                category = "Fruits Choco Mix",
                description = "Premium mango with luxury chocolate cream",
                imageUrl = "drawable://gemini_image_yet6yr",
                preparationTime = 6,
                ingredients = listOf("Premium mango", "Luxury chocolate", "Premium cream", "Gold dust"),
                allergens = listOf("Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 350, protein = 5.0, carbs = 52.0, fat = 13.0),
                tags = listOf("Fruit", "Mango", "Premium")
            ),
            
            // ICE CREAMS (4 items)
            Product(
                id = 25,
                name = "Choco Vanilla Scoop",
                price = 6.99,
                category = "Ice Creams",
                description = "Rich chocolate with creamy vanilla ice cream",
                imageUrl = "drawable://gemini_image_main",
                preparationTime = 3,
                ingredients = listOf("Chocolate ice cream", "Vanilla ice cream", "Chocolate sauce", "Whipped cream"),
                allergens = listOf("Dairy", "Eggs"),
                nutritionalInfo = NutritionalInfo(calories = 250, protein = 4.0, carbs = 35.0, fat = 10.0),
                tags = listOf("Ice Cream", "Chocolate", "Vanilla")
            ),
            Product(
                id = 26,
                name = "Choco Chocolate Scoop",
                price = 7.99,
                category = "Ice Creams",
                description = "Double chocolate ice cream delight",
                imageUrl = "drawable://gemini_image_y6jfux",
                preparationTime = 3,
                ingredients = listOf("Chocolate ice cream", "Chocolate chips", "Chocolate sauce", "Whipped cream"),
                allergens = listOf("Dairy", "Eggs"),
                nutritionalInfo = NutritionalInfo(calories = 280, protein = 5.0, carbs = 38.0, fat = 12.0),
                tags = listOf("Ice Cream", "Chocolate", "Double")
            ),
            Product(
                id = 27,
                name = "Choco Strawberry Scoop",
                price = 6.99,
                category = "Ice Creams",
                description = "Chocolate with fresh strawberry ice cream",
                imageUrl = "drawable://gemini_image_6",
                preparationTime = 3,
                ingredients = listOf("Chocolate ice cream", "Strawberry ice cream", "Fresh strawberries", "Chocolate sauce"),
                allergens = listOf("Dairy", "Eggs"),
                nutritionalInfo = NutritionalInfo(calories = 240, protein = 4.0, carbs = 33.0, fat = 9.0),
                tags = listOf("Ice Cream", "Chocolate", "Strawberry")
            ),
            Product(
                id = 28,
                name = "Choco Mango Scoop",
                price = 7.99,
                category = "Ice Creams",
                description = "Chocolate with tropical mango ice cream",
                imageUrl = "drawable://gemini_image_5",
                preparationTime = 3,
                ingredients = listOf("Chocolate ice cream", "Mango ice cream", "Fresh mango", "Chocolate sauce"),
                allergens = listOf("Dairy", "Eggs"),
                nutritionalInfo = NutritionalInfo(calories = 260, protein = 4.0, carbs = 36.0, fat = 10.0),
                tags = listOf("Ice Cream", "Chocolate", "Mango")
            ),
            
            // DRINKS (5 items)
            Product(
                id = 29,
                name = "Milo Dinosaur",
                price = 5.99,
                category = "Drinks",
                description = "Rich Milo with extra Milo powder on top",
                imageUrl = "drawable://gemini_image_yet6yr_1",
                preparationTime = 4,
                ingredients = listOf("Milo powder", "Milk", "Ice", "Extra Milo topping"),
                allergens = listOf("Dairy", "Gluten"),
                nutritionalInfo = NutritionalInfo(calories = 180, protein = 6.0, carbs = 28.0, fat = 4.0),
                tags = listOf("Drink", "Milo", "Milk")
            ),
            Product(
                id = 30,
                name = "Malaysian Mango Milk",
                price = 6.99,
                category = "Drinks",
                description = "Fresh mango with creamy milk",
                imageUrl = "drawable://gemini_image_5",
                preparationTime = 4,
                ingredients = listOf("Fresh mango", "Milk", "Ice", "Sugar"),
                allergens = listOf("Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 160, protein = 5.0, carbs = 32.0, fat = 3.0),
                tags = listOf("Drink", "Mango", "Milk")
            ),
            Product(
                id = 31,
                name = "Korean Strawberry Milk",
                price = 7.99,
                category = "Drinks",
                description = "Korean-style strawberry milk with fresh strawberries",
                imageUrl = "drawable://gemini_image_6",
                preparationTime = 4,
                ingredients = listOf("Fresh strawberries", "Milk", "Ice", "Strawberry syrup"),
                allergens = listOf("Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 150, protein = 4.0, carbs = 30.0, fat = 2.5),
                tags = listOf("Drink", "Korean", "Strawberry")
            ),
            Product(
                id = 32,
                name = "Vietnamese Iced Coffee",
                price = 4.99,
                category = "Drinks",
                description = "Traditional Vietnamese iced coffee with condensed milk",
                imageUrl = "drawable://gemini_image_yet6yr",
                preparationTime = 5,
                ingredients = listOf("Vietnamese coffee", "Condensed milk", "Ice", "Sugar"),
                allergens = listOf("Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 120, protein = 3.0, carbs = 20.0, fat = 3.0),
                tags = listOf("Drink", "Coffee", "Vietnamese")
            ),
            Product(
                id = 33,
                name = "Premium Iced Coffee",
                price = 6.99,
                category = "Drinks",
                description = "Premium blend iced coffee with luxury cream",
                imageUrl = "drawable://gemini_image_y6jfux",
                preparationTime = 5,
                ingredients = listOf("Premium coffee", "Luxury cream", "Ice", "Premium syrup"),
                allergens = listOf("Dairy"),
                nutritionalInfo = NutritionalInfo(calories = 140, protein = 3.0, carbs = 22.0, fat = 4.0),
                tags = listOf("Drink", "Coffee", "Premium")
            ),
            
            // TOPPINGS (4 items)
            Product(
                id = 34,
                name = "Fresh Robust Banana",
                price = 2.99,
                category = "Toppings",
                description = "Fresh sliced banana for your dessert",
                imageUrl = "drawable://gemini_image_7",
                preparationTime = 2,
                ingredients = listOf("Fresh banana"),
                allergens = listOf(),
                nutritionalInfo = NutritionalInfo(calories = 50, protein = 1.0, carbs = 12.0, fat = 0.2),
                tags = listOf("Topping", "Fresh", "Banana")
            ),
            Product(
                id = 35,
                name = "Diced Mango",
                price = 3.99,
                category = "Toppings",
                description = "Fresh diced mango pieces",
                imageUrl = "drawable://gemini_image_5",
                preparationTime = 2,
                ingredients = listOf("Fresh mango"),
                allergens = listOf(),
                nutritionalInfo = NutritionalInfo(calories = 60, protein = 1.0, carbs = 15.0, fat = 0.3),
                tags = listOf("Topping", "Fresh", "Mango")
            ),
            Product(
                id = 36,
                name = "Sliced Strawberry",
                price = 3.99,
                category = "Toppings",
                description = "Fresh sliced strawberries",
                imageUrl = "drawable://gemini_image_6",
                preparationTime = 2,
                ingredients = listOf("Fresh strawberries"),
                allergens = listOf(),
                nutritionalInfo = NutritionalInfo(calories = 40, protein = 1.0, carbs = 10.0, fat = 0.2),
                tags = listOf("Topping", "Fresh", "Strawberry")
            ),
            Product(
                id = 37,
                name = "Sliced Kiwi",
                price = 3.99,
                category = "Toppings",
                description = "Fresh sliced kiwi pieces",
                imageUrl = "drawable://gemini_image_7",
                preparationTime = 2,
                ingredients = listOf("Fresh kiwi"),
                allergens = listOf(),
                nutritionalInfo = NutritionalInfo(calories = 45, protein = 1.0, carbs = 11.0, fat = 0.3),
                tags = listOf("Topping", "Fresh", "Kiwi")
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
            "Drinks",
            "Toppings"
        )
    }
}
