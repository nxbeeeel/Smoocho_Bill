package com.beloop.pos.ui.screens

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.beloop.pos.ui.theme.*
import com.beloop.pos.viewmodel.DashboardViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    navController: NavController,
    viewModel: DashboardViewModel = hiltViewModel()
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
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Premium Header
            item {
                PremiumDashboardHeader(
                    userName = uiState.currentUser?.name ?: "Admin",
                    userRole = uiState.currentUser?.role?.name ?: "Manager"
                )
            }
            
            // Quick Stats
            item {
                PremiumQuickStatsSection(
                    stats = uiState.quickStats
                )
            }
            
            // Quick Actions
            item {
                PremiumQuickActionsSection(
                    actions = uiState.quickActions,
                    onActionClick = { route ->
                        navController.navigate(route)
                    }
                )
            }
            
            // Recent Orders
            item {
                PremiumRecentOrdersSection(
                    orders = uiState.recentOrders
                )
            }
            
            // Low Stock Alert
            if (uiState.lowStockItems.isNotEmpty()) {
                item {
                    PremiumLowStockSection(
                        lowStockItems = uiState.lowStockItems
                    )
                }
            }
        }
    }
}

@Composable
fun PremiumDashboardHeader(
    userName: String,
    userRole: String
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(
                elevation = 12.dp,
                shape = RoundedCornerShape(20.dp),
                ambientColor = BeloopPrimary.copy(alpha = 0.3f),
                spotColor = BeloopPrimary.copy(alpha = 0.3f)
            ),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = BeloopSurface
        )
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            BeloopPrimary.copy(alpha = 0.1f),
                            BeloopSecondary.copy(alpha = 0.1f)
                        )
                    )
                )
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // User Avatar
                Box(
                    modifier = Modifier
                        .size(60.dp)
                        .background(
                            brush = Brush.linearGradient(
                                colors = listOf(BeloopPrimary, BeloopSecondary)
                            ),
                            shape = RoundedCornerShape(16.dp)
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(28.dp)
                    )
                }
                
                Spacer(modifier = Modifier.width(16.dp))
                
                Column(
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = "Welcome back,",
                        style = MaterialTheme.typography.bodyMedium,
                        color = BeloopOnSurfaceVariant
                    )
                    Text(
                        text = userName,
                        style = MaterialTheme.typography.headlineSmall,
                        color = BeloopPrimary,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = userRole,
                        style = MaterialTheme.typography.bodySmall,
                        color = BeloopOnSurfaceVariant
                    )
                }
                
                // Status Indicator
                Column(
                    horizontalAlignment = Alignment.End
                ) {
                    Box(
                        modifier = Modifier
                            .size(12.dp)
                            .background(
                                color = BeloopSuccess,
                                shape = RoundedCornerShape(6.dp)
                            )
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Online",
                        style = MaterialTheme.typography.labelSmall,
                        color = BeloopSuccess,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}

@Composable
fun PremiumQuickStatsSection(
    stats: List<com.beloop.pos.viewmodel.QuickStat>
) {
    Column {
        Text(
            text = "Today's Overview",
            style = MaterialTheme.typography.headlineSmall,
            color = BeloopOnSurface,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 12.dp)
        )
        
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(stats) { stat ->
                PremiumStatCard(stat = stat)
            }
        }
    }
}

@Composable
fun PremiumStatCard(
    stat: com.beloop.pos.viewmodel.QuickStat
) {
    Card(
        modifier = Modifier
            .width(160.dp)
            .shadow(
                elevation = 6.dp,
                shape = RoundedCornerShape(16.dp),
                ambientColor = stat.color.copy(alpha = 0.3f),
                spotColor = stat.color.copy(alpha = 0.3f)
            ),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = BeloopSurface
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .background(
                            color = stat.color.copy(alpha = 0.1f),
                            shape = RoundedCornerShape(10.dp)
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = stat.icon,
                        contentDescription = null,
                        tint = stat.color,
                        modifier = Modifier.size(20.dp)
                    )
                }
                
                Text(
                    text = stat.value,
                    style = MaterialTheme.typography.titleLarge,
                    color = stat.color,
                    fontWeight = FontWeight.Bold
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = stat.title,
                style = MaterialTheme.typography.bodyMedium,
                color = BeloopOnSurface,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

@Composable
fun PremiumQuickActionsSection(
    actions: List<com.beloop.pos.viewmodel.QuickAction>,
    onActionClick: (String) -> Unit
) {
    Column {
        Text(
            text = "Quick Actions",
            style = MaterialTheme.typography.headlineSmall,
            color = BeloopOnSurface,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 12.dp)
        )
        
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(actions) { action ->
                PremiumActionCard(
                    action = action,
                    onClick = { onActionClick(action.route) }
                )
            }
        }
    }
}

@Composable
fun PremiumActionCard(
    action: com.beloop.pos.viewmodel.QuickAction,
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
            .width(140.dp)
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
                elevation = 6.dp,
                shape = RoundedCornerShape(16.dp),
                ambientColor = action.color.copy(alpha = 0.3f),
                spotColor = action.color.copy(alpha = 0.3f)
            ),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = BeloopSurface
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(
                        color = action.color.copy(alpha = 0.1f),
                        shape = RoundedCornerShape(12.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = action.icon,
                    contentDescription = null,
                    tint = action.color,
                    modifier = Modifier.size(24.dp)
                )
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Text(
                text = action.title,
                style = MaterialTheme.typography.titleSmall,
                color = BeloopOnSurface,
                fontWeight = FontWeight.SemiBold,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = action.description,
                style = MaterialTheme.typography.bodySmall,
                color = BeloopOnSurfaceVariant,
                textAlign = TextAlign.Center,
                maxLines = 2
            )
        }
    }
}

@Composable
fun PremiumRecentOrdersSection(
    orders: List<com.beloop.pos.data.model.Order>
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(
                elevation = 6.dp,
                shape = RoundedCornerShape(16.dp),
                ambientColor = BeloopPrimary.copy(alpha = 0.2f),
                spotColor = BeloopPrimary.copy(alpha = 0.2f)
            ),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = BeloopSurface
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Recent Orders",
                    style = MaterialTheme.typography.headlineSmall,
                    color = BeloopOnSurface,
                    fontWeight = FontWeight.Bold
                )
                
                TextButton(
                    onClick = { /* Navigate to order history */ }
                ) {
                    Text("View All")
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            if (orders.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(120.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.Receipt,
                            contentDescription = null,
                            tint = BeloopOnSurfaceVariant,
                            modifier = Modifier.size(32.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "No recent orders",
                            style = MaterialTheme.typography.bodyMedium,
                            color = BeloopOnSurfaceVariant
                        )
                        Text(
                            text = "Start taking orders to see them here",
                            style = MaterialTheme.typography.bodySmall,
                            color = BeloopOnSurfaceVariant
                        )
                    }
                }
            } else {
                // Show recent orders here
                Text(
                    text = "Recent orders will appear here",
                    style = MaterialTheme.typography.bodyMedium,
                    color = BeloopOnSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun PremiumLowStockSection(
    lowStockItems: List<com.beloop.pos.data.model.InventoryItem>
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(
                elevation = 6.dp,
                shape = RoundedCornerShape(16.dp),
                ambientColor = BeloopWarning.copy(alpha = 0.3f),
                spotColor = BeloopWarning.copy(alpha = 0.3f)
            ),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = BeloopSurface
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .background(
                            color = BeloopWarning.copy(alpha = 0.1f),
                            shape = RoundedCornerShape(8.dp)
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = null,
                        tint = BeloopWarning,
                        modifier = Modifier.size(16.dp)
                    )
                }
                
                Spacer(modifier = Modifier.width(12.dp))
                
                Text(
                    text = "Low Stock Alert",
                    style = MaterialTheme.typography.titleMedium,
                    color = BeloopWarning,
                    fontWeight = FontWeight.Bold
                )
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Text(
                text = "${lowStockItems.size} items are running low on stock",
                style = MaterialTheme.typography.bodyMedium,
                color = BeloopOnSurface
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            TextButton(
                onClick = { /* Navigate to inventory */ }
            ) {
                Text("Manage Inventory")
            }
        }
    }
}