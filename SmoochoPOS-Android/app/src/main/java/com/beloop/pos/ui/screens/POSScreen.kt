package com.beloop.pos.ui.screens

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.beloop.pos.data.model.OrderItem
import com.beloop.pos.data.model.Product
import com.beloop.pos.ui.theme.*
import com.beloop.pos.viewmodel.POSViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun POSScreen(
    navController: NavController,
    viewModel: POSViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    // Premium gradient background
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.radialGradient(
                    colors = listOf(
                        BeloopBackground,
                        BeloopSurfaceVariant.copy(alpha = 0.1f),
                        BeloopPrimary.copy(alpha = 0.05f)
                    ),
                    radius = 1200f
                )
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            // Premium Header
            PremiumHeader(
                title = "Beloop POS",
                subtitle = "Premium Point of Sale",
                onBackClick = { navController.popBackStack() }
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Main Content Row
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .weight(1f),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Left Panel - Products (70% width)
                Box(
                    modifier = Modifier
                        .weight(0.7f)
                        .fillMaxHeight()
                ) {
                    PremiumProductPanel(
                        products = uiState.products,
                        selectedCategory = uiState.selectedCategory ?: "All",
                        onCategorySelected = viewModel::selectCategory,
                        onProductSelected = viewModel::addToCart,
                        isLoading = false
                    )
                }
                
                // Right Panel - Cart (30% width)
                Box(
                    modifier = Modifier
                        .weight(0.3f)
                        .fillMaxHeight()
                ) {
                    PremiumCartPanel(
                        cartItems = uiState.cartItems,
                        total = uiState.total,
                        onQuantityChange = { productId, quantity -> 
                            // Find the cart item by productId and update quantity
                            val item = uiState.cartItems.find { it.productId == productId }
                            item?.let { viewModel.updateCartItemQuantity(it, quantity) }
                        },
                        onRemoveItem = { productId ->
                            // Find the cart item by productId and remove it
                            val item = uiState.cartItems.find { it.productId == productId }
                            item?.let { viewModel.removeFromCart(it) }
                        },
                        onCheckout = { viewModel.processOrder() },
                        onClearCart = { /* TODO: Implement clearCart */ },
                        isProcessing = false
                    )
                }
            }
        }
    }
}

@Composable
fun PremiumHeader(
    title: String,
    subtitle: String,
    onBackClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(
                elevation = 8.dp,
                shape = RoundedCornerShape(16.dp),
                ambientColor = BeloopPrimary.copy(alpha = 0.3f),
                spotColor = BeloopPrimary.copy(alpha = 0.3f)
            ),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = BeloopSurface
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onBackClick,
                modifier = Modifier
                    .size(48.dp)
                    .background(
                        color = BeloopPrimary.copy(alpha = 0.1f),
                        shape = RoundedCornerShape(12.dp)
                    )
            ) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = BeloopPrimary,
                    modifier = Modifier.size(24.dp)
                )
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.headlineMedium,
                    color = BeloopPrimary,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = BeloopOnSurfaceVariant
                )
            }
            
            // Status indicator
            Box(
                modifier = Modifier
                    .size(12.dp)
                    .background(
                        color = BeloopSuccess,
                        shape = RoundedCornerShape(6.dp)
                    )
            )
        }
    }
}

@Composable
fun PremiumProductPanel(
    products: List<Product>,
    selectedCategory: String,
    onCategorySelected: (String) -> Unit,
    onProductSelected: (Product) -> Unit,
    isLoading: Boolean
) {
    Card(
        modifier = Modifier
            .fillMaxSize()
            .shadow(
                elevation = 6.dp,
                shape = RoundedCornerShape(20.dp),
                ambientColor = BeloopPrimary.copy(alpha = 0.2f),
                spotColor = BeloopPrimary.copy(alpha = 0.2f)
            ),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = BeloopSurface
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp)
        ) {
            // Category Filter
            PremiumCategoryFilter(
                selectedCategory = selectedCategory,
                onCategorySelected = onCategorySelected
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Products Grid
            if (isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(
                        color = BeloopPrimary,
                        strokeWidth = 3.dp
                    )
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(products) { product ->
                        PremiumProductCard(
                            product = product,
                            onClick = { onProductSelected(product) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun PremiumCategoryFilter(
    selectedCategory: String,
    onCategorySelected: (String) -> Unit
) {
    val categories = listOf("All", "Kunafa Bowls", "Signatures", "Choco Desserts", "Crispy Rice Tubs", "Fruits Choco Mix", "Ice Creams", "Drinks", "Toppings")
    
    LazyRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(categories) { category ->
            val isSelected = category == selectedCategory
            val backgroundColor = if (isSelected) BeloopPrimary else BeloopSurfaceVariant
            val contentColor = if (isSelected) Color.White else BeloopOnSurface
            
            Card(
                modifier = Modifier
                    .clickable { onCategorySelected(category) }
                    .shadow(
                        elevation = if (isSelected) 4.dp else 2.dp,
                        shape = RoundedCornerShape(12.dp)
                    ),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(
                    containerColor = backgroundColor
                )
            ) {
                Text(
                    text = category,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                    style = MaterialTheme.typography.labelMedium,
                    color = contentColor,
                    fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal
                )
            }
        }
    }
}

@Composable
fun PremiumProductCard(
    product: Product,
    onClick: () -> Unit
) {
    var isPressed by remember { mutableStateOf(false) }
    
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.95f else 1f,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessLow
        ),
        label = "scale"
    )
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .scale(scale)
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) {
                isPressed = true
                onClick()
                isPressed = false
            }
            .shadow(
                elevation = 4.dp,
                shape = RoundedCornerShape(16.dp),
                ambientColor = BeloopPrimary.copy(alpha = 0.1f),
                spotColor = BeloopPrimary.copy(alpha = 0.1f)
            ),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = BeloopSurface
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Product Image Placeholder
            Box(
                modifier = Modifier
                    .size(60.dp)
                    .background(
                        brush = Brush.linearGradient(
                            colors = listOf(
                                BeloopPrimary.copy(alpha = 0.1f),
                                BeloopSecondary.copy(alpha = 0.1f)
                            )
                        ),
                        shape = RoundedCornerShape(12.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Restaurant,
                    contentDescription = null,
                    tint = BeloopPrimary,
                    modifier = Modifier.size(24.dp)
                )
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            // Product Info
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = product.name,
                    style = MaterialTheme.typography.titleMedium,
                    color = BeloopOnSurface,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = product.description ?: "",
                    style = MaterialTheme.typography.bodySmall,
                    color = BeloopOnSurfaceVariant,
                    maxLines = 2
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "⏱️ ${product.preparationTime}min",
                        style = MaterialTheme.typography.labelSmall,
                        color = BeloopInfo
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "🔥 ${product.nutritionalInfo?.calories ?: 0} cal",
                        style = MaterialTheme.typography.labelSmall,
                        color = BeloopWarning
                    )
                }
            }
            
            // Price
            Column(
                horizontalAlignment = Alignment.End
            ) {
                Text(
                    text = "$${String.format("%.2f", product.price)}",
                    style = MaterialTheme.typography.titleLarge,
                    color = BeloopSuccess,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = product.category,
                    style = MaterialTheme.typography.labelSmall,
                    color = BeloopOnSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun PremiumCartPanel(
    cartItems: List<OrderItem>,
    total: Double,
    onQuantityChange: (Long, Int) -> Unit,
    onRemoveItem: (Long) -> Unit,
    onCheckout: () -> Unit,
    onClearCart: () -> Unit,
    isProcessing: Boolean
) {
    Card(
        modifier = Modifier
            .fillMaxSize()
            .shadow(
                elevation = 8.dp,
                shape = RoundedCornerShape(20.dp),
                ambientColor = BeloopSuccess.copy(alpha = 0.3f),
                spotColor = BeloopSuccess.copy(alpha = 0.3f)
            ),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = BeloopSurface
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp)
        ) {
            // Cart Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Order Cart",
                    style = MaterialTheme.typography.headlineSmall,
                    color = BeloopOnSurface,
                    fontWeight = FontWeight.Bold
                )
                if (cartItems.isNotEmpty()) {
                    TextButton(
                        onClick = onClearCart,
                        colors = ButtonDefaults.textButtonColors(
                            contentColor = BeloopError
                        )
                    ) {
                        Text("Clear All")
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Cart Items
            if (cartItems.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.ShoppingCart,
                            contentDescription = null,
                            tint = BeloopOnSurfaceVariant,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Cart is empty",
                            style = MaterialTheme.typography.bodyLarge,
                            color = BeloopOnSurfaceVariant
                        )
                        Text(
                            text = "Add items to get started",
                            style = MaterialTheme.typography.bodySmall,
                            color = BeloopOnSurfaceVariant
                        )
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(cartItems) { item ->
                        PremiumCartItem(
                            item = item,
                            onQuantityChange = onQuantityChange,
                            onRemove = onRemoveItem
                        )
                    }
                }
            }
            
            // Total and Checkout
            if (cartItems.isNotEmpty()) {
                Spacer(modifier = Modifier.height(16.dp))
                
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = BeloopSuccess.copy(alpha = 0.1f)
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Total Items:",
                                style = MaterialTheme.typography.bodyMedium,
                                color = BeloopOnSurface
                            )
                            Text(
                                text = "${cartItems.sumOf { it.quantity }}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = BeloopOnSurface,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Total Amount:",
                                style = MaterialTheme.typography.titleMedium,
                                color = BeloopOnSurface,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "$${String.format("%.2f", total)}",
                                style = MaterialTheme.typography.titleLarge,
                                color = BeloopSuccess,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Button(
                    onClick = onCheckout,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    enabled = !isProcessing,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = BeloopSuccess
                    ),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    if (isProcessing) {
                        CircularProgressIndicator(
                            color = Color.White,
                            strokeWidth = 2.dp,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Processing...")
                    } else {
                        Icon(
                            imageVector = Icons.Default.Payment,
                            contentDescription = null,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Checkout",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun PremiumCartItem(
    item: OrderItem,
    onQuantityChange: (Long, Int) -> Unit,
    onRemove: (Long) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = BeloopSurfaceVariant.copy(alpha = 0.5f)
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = item.productName,
                    style = MaterialTheme.typography.bodyMedium,
                    color = BeloopOnSurface,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = "$${String.format("%.2f", item.unitPrice)} each",
                    style = MaterialTheme.typography.bodySmall,
                    color = BeloopOnSurfaceVariant
                )
            }
            
            // Quantity Controls
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = { 
                        if (item.quantity > 1) {
                            onQuantityChange(item.productId, item.quantity - 1)
                        } else {
                            onRemove(item.productId)
                        }
                    },
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Remove,
                        contentDescription = "Decrease",
                        tint = BeloopError,
                        modifier = Modifier.size(16.dp)
                    )
                }
                
                Text(
                    text = "${item.quantity}",
                    modifier = Modifier
                        .padding(horizontal = 8.dp)
                        .background(
                            color = BeloopPrimary.copy(alpha = 0.1f),
                            shape = RoundedCornerShape(8.dp)
                        )
                        .padding(horizontal = 12.dp, vertical = 4.dp),
                    style = MaterialTheme.typography.bodyMedium,
                    color = BeloopPrimary,
                    fontWeight = FontWeight.Bold
                )
                
                IconButton(
                    onClick = { onQuantityChange(item.productId, item.quantity + 1) },
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "Increase",
                        tint = BeloopSuccess,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.width(8.dp))
            
            Text(
                text = "$${String.format("%.2f", item.totalPrice)}",
                style = MaterialTheme.typography.bodyMedium,
                color = BeloopSuccess,
                fontWeight = FontWeight.Bold
            )
        }
    }
}