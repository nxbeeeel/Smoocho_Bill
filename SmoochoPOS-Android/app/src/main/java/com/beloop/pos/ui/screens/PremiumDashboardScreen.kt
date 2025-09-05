package com.beloop.pos.ui.screens

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.beloop.pos.ui.theme.*
import com.beloop.pos.viewmodel.DashboardViewModel
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PremiumDashboardScreen(
    navController: NavController,
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF0F172A), // Deep navy
                        Color(0xFF1E293B)  // Slate
                    )
                )
            )
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            // Premium Header
            PremiumDashboardHeader(
                userName = uiState.currentUser?.name ?: "Admin",
                onProfileClick = { navController.navigate("account") }
            )
            
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                // Quick Stats Section
                item {
                    PremiumStatsSection(
                        stats = uiState.quickStats,
                        onStatClick = { stat -> stat.onClick() }
                    )
                }
                
                // Quick Actions Section
                item {
                    PremiumActionsSection(
                        actions = uiState.quickActions,
                        onActionClick = { action -> navController.navigate(action.route) }
                    )
                }
                
                // Recent Orders Section
                item {
                    PremiumRecentOrdersSection(
                        orders = uiState.recentOrders,
                        onOrderClick = { /* Handle order click */ }
                    )
                }
                
                // Low Stock Section
                item {
                    PremiumLowStockSection(
                        items = uiState.lowStockItems,
                        onItemClick = { /* Handle item click */ }
                    )
                }
            }
        }
    }
}

@Composable
fun PremiumDashboardHeader(
    userName: String,
    onProfileClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
            .shadow(24.dp, RoundedCornerShape(20.dp), ambientColor = Color.Black.copy(alpha = 0.3f)),
        colors = CardDefaults.cardColors(
            containerColor = Color.White.copy(alpha = 0.1f)
        ),
        shape = RoundedCornerShape(20.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Welcome back,",
                    style = MaterialTheme.typography.bodyLarge,
                    color = Color.White.copy(alpha = 0.8f)
                )
                Text(
                    text = userName,
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color.White
                )
                Text(
                    text = SimpleDateFormat("EEEE, MMMM dd", Locale.getDefault()).format(Date()),
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.White.copy(alpha = 0.7f)
                )
            }
            
            // Profile Button
            Card(
                modifier = Modifier
                    .size(56.dp)
                    .clickable { onProfileClick() },
                colors = CardDefaults.cardColors(containerColor = BeloopPrimary),
                shape = CircleShape
            ) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.Person,
                        contentDescription = "Profile",
                        tint = Color.White,
                        modifier = Modifier.size(28.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun PremiumStatsSection(
    stats: List<DashboardViewModel.QuickStat>,
    onStatClick: (DashboardViewModel.QuickStat) -> Unit
) {
    Column {
        Text(
            text = "Today's Overview",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.padding(bottom = 16.dp)
        )
        
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            items(stats) { stat ->
                PremiumStatCard(
                    stat = stat,
                    onClick = { onStatClick(stat) }
                )
            }
        }
    }
}

@Composable
fun PremiumStatCard(
    stat: DashboardViewModel.QuickStat,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier
            .width(160.dp)
            .height(120.dp)
            .shadow(16.dp, RoundedCornerShape(16.dp), ambientColor = Color.Black.copy(alpha = 0.2f)),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.1f)),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = stat.icon,
                    contentDescription = stat.title,
                    tint = stat.color,
                    modifier = Modifier.size(24.dp)
                )
                Icon(
                    Icons.Default.TrendingUp,
                    contentDescription = "Trend",
                    tint = BeloopSuccess,
                    modifier = Modifier.size(16.dp)
                )
            }
            
            Column {
                Text(
                    text = stat.value,
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color.White
                )
                Text(
                    text = stat.title,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.White.copy(alpha = 0.7f)
                )
            }
        }
    }
}

@Composable
fun PremiumActionsSection(
    actions: List<DashboardViewModel.QuickAction>,
    onActionClick: (DashboardViewModel.QuickAction) -> Unit
) {
    Column {
        Text(
            text = "Quick Actions",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.padding(bottom = 16.dp)
        )
        
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            items(actions) { action ->
                PremiumActionCard(
                    action = action,
                    onClick = { onActionClick(action) }
                )
            }
        }
    }
}

@Composable
fun PremiumActionCard(
    action: DashboardViewModel.QuickAction,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier
            .width(180.dp)
            .height(140.dp)
            .shadow(16.dp, RoundedCornerShape(16.dp), ambientColor = Color.Black.copy(alpha = 0.2f)),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.1f)),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = action.icon,
                    contentDescription = action.title,
                    tint = action.color,
                    modifier = Modifier.size(28.dp)
                )
                Icon(
                    Icons.Default.ArrowForward,
                    contentDescription = "Go",
                    tint = Color.White.copy(alpha = 0.7f),
                    modifier = Modifier.size(16.dp)
                )
            }
            
            Column {
                Text(
                    text = action.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = action.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.White.copy(alpha = 0.7f)
                )
            }
        }
    }
}

@Composable
fun PremiumRecentOrdersSection(
    orders: List<com.beloop.pos.data.model.Order>,
    onOrderClick: (com.beloop.pos.data.model.Order) -> Unit
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Recent Orders",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            TextButton(
                onClick = { /* Navigate to order history */ }
            ) {
                Text(
                    "View All",
                    color = BeloopPrimary,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        if (orders.isEmpty()) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(8.dp, RoundedCornerShape(12.dp)),
                colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.1f)),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        Icons.Default.Receipt,
                        contentDescription = "No Orders",
                        modifier = Modifier.size(48.dp),
                        tint = Color.White.copy(alpha = 0.5f)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "No recent orders",
                        style = MaterialTheme.typography.bodyLarge,
                        color = Color.White.copy(alpha = 0.7f)
                    )
                }
            }
        } else {
            orders.take(3).forEach { order ->
                PremiumOrderCard(
                    order = order,
                    onClick = { onOrderClick(order) }
                )
                Spacer(modifier = Modifier.height(8.dp))
            }
        }
    }
}

@Composable
fun PremiumOrderCard(
    order: com.beloop.pos.data.model.Order,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .shadow(8.dp, RoundedCornerShape(12.dp)),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.1f)),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Order #${order.orderNumber}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "${order.items.size} items • ₹${String.format("%.0f", order.total)}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.White.copy(alpha = 0.7f)
                )
            }
            
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = when (order.orderStatus) {
                        com.beloop.pos.data.model.OrderStatus.PENDING -> BeloopWarning.copy(alpha = 0.2f)
                        com.beloop.pos.data.model.OrderStatus.CONFIRMED -> BeloopInfo.copy(alpha = 0.2f)
                        com.beloop.pos.data.model.OrderStatus.PREPARING -> BeloopPrimary.copy(alpha = 0.2f)
                        com.beloop.pos.data.model.OrderStatus.READY -> BeloopSuccess.copy(alpha = 0.2f)
                        com.beloop.pos.data.model.OrderStatus.SERVED -> BeloopSuccess.copy(alpha = 0.2f)
                        com.beloop.pos.data.model.OrderStatus.COMPLETED -> BeloopSuccess.copy(alpha = 0.2f)
                        com.beloop.pos.data.model.OrderStatus.CANCELLED -> BeloopError.copy(alpha = 0.2f)
                    }
                ),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    text = order.orderStatus.name,
                    style = MaterialTheme.typography.labelMedium,
                    color = when (order.orderStatus) {
                        com.beloop.pos.data.model.OrderStatus.PENDING -> BeloopWarning
                        com.beloop.pos.data.model.OrderStatus.CONFIRMED -> BeloopInfo
                        com.beloop.pos.data.model.OrderStatus.PREPARING -> BeloopPrimary
                        com.beloop.pos.data.model.OrderStatus.READY -> BeloopSuccess
                        com.beloop.pos.data.model.OrderStatus.SERVED -> BeloopSuccess
                        com.beloop.pos.data.model.OrderStatus.COMPLETED -> BeloopSuccess
                        com.beloop.pos.data.model.OrderStatus.CANCELLED -> BeloopError
                    },
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
    }
}

@Composable
fun PremiumLowStockSection(
    items: List<com.beloop.pos.data.model.InventoryItem>,
    onItemClick: (com.beloop.pos.data.model.InventoryItem) -> Unit
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Low Stock Alert",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            if (items.isNotEmpty()) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = BeloopError.copy(alpha = 0.2f)),
                    shape = CircleShape
                ) {
                    Text(
                        text = items.size.toString(),
                        style = MaterialTheme.typography.labelMedium,
                        color = BeloopError,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        if (items.isEmpty()) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(8.dp, RoundedCornerShape(12.dp)),
                colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.1f)),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        Icons.Default.CheckCircle,
                        contentDescription = "All Good",
                        modifier = Modifier.size(48.dp),
                        tint = BeloopSuccess
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "All items in stock",
                        style = MaterialTheme.typography.bodyLarge,
                        color = Color.White.copy(alpha = 0.7f)
                    )
                }
            }
        } else {
            items.take(3).forEach { item ->
                PremiumLowStockCard(
                    item = item,
                    onClick = { onItemClick(item) }
                )
                Spacer(modifier = Modifier.height(8.dp))
            }
        }
    }
}

@Composable
fun PremiumLowStockCard(
    item: com.beloop.pos.data.model.InventoryItem,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .shadow(8.dp, RoundedCornerShape(12.dp)),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.1f)),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Icon(
                    Icons.Default.Warning,
                    contentDescription = "Low Stock",
                    tint = BeloopWarning,
                    modifier = Modifier.size(24.dp)
                )
                Column {
                    Text(
                        text = item.productName,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = "Current: ${item.currentStock}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.White.copy(alpha = 0.7f)
                    )
                }
            }
            
            Card(
                colors = CardDefaults.cardColors(containerColor = BeloopWarning.copy(alpha = 0.2f)),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    text = "Low",
                    style = MaterialTheme.typography.labelMedium,
                    color = BeloopWarning,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                )
            }
        }
    }
}
