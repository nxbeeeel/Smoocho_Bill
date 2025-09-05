package com.beloop.pos.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.beloop.pos.data.model.InventoryItem
import com.beloop.pos.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PremiumInventoryScreen(
    navController: NavController,
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var showAddItemDialog by remember { mutableStateOf(false) }
    var selectedItem by remember { mutableStateOf<InventoryItem?>(null) }
    
    // Mock inventory data for demonstration
    val inventoryItems = remember {
        listOf(
            InventoryItem(
                id = 1,
                productId = 1,
                productName = "Hazelnut Kunafa",
                currentStock = 15,
                minStock = 10,
                maxStock = 50,
                unitPrice = 299.0,
                lastUpdated = System.currentTimeMillis()
            ),
            InventoryItem(
                id = 2,
                productId = 2,
                productName = "White Chocolate Kunafa",
                currentStock = 5,
                minStock = 10,
                maxStock = 50,
                unitPrice = 329.0,
                lastUpdated = System.currentTimeMillis()
            ),
            InventoryItem(
                id = 3,
                productId = 3,
                productName = "Pista Kunafa",
                currentStock = 25,
                minStock = 10,
                maxStock = 50,
                unitPrice = 349.0,
                lastUpdated = System.currentTimeMillis()
            )
        )
    }
    
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
            PremiumInventoryHeader(
                onBackClick = { navController.popBackStack() },
                onAddItem = { showAddItemDialog = true }
            )
            
            // Stats Cards
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                PremiumInventoryStatCard(
                    title = "Total Items",
                    value = inventoryItems.size.toString(),
                    icon = Icons.Default.Inventory,
                    color = BeloopPrimary
                )
                
                PremiumInventoryStatCard(
                    title = "Low Stock",
                    value = inventoryItems.count { it.currentStock <= it.minStock }.toString(),
                    icon = Icons.Default.Warning,
                    color = BeloopWarning
                )
                
                PremiumInventoryStatCard(
                    title = "Total Value",
                    value = "₹${String.format("%.0f", inventoryItems.sumOf { it.currentStock * it.unitPrice })}",
                    icon = Icons.Default.AttachMoney,
                    color = BeloopSuccess
                )
            }
            
            // Inventory Items List
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(inventoryItems) { item ->
                    PremiumInventoryItemCard(
                        item = item,
                        onEdit = { selectedItem = item },
                        onUpdateStock = { /* Handle stock update */ }
                    )
                }
            }
        }
        
        // Add/Edit Item Dialog
        if (showAddItemDialog || selectedItem != null) {
            PremiumInventoryDialog(
                item = selectedItem,
                onDismiss = { 
                    showAddItemDialog = false
                    selectedItem = null
                },
                onSave = { /* Handle save */ }
            )
        }
    }
}

@Composable
fun PremiumInventoryHeader(
    onBackClick: () -> Unit,
    onAddItem: () -> Unit
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
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                IconButton(
                    onClick = onBackClick,
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color.White.copy(alpha = 0.2f))
                ) {
                    Icon(
                        Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = Color.White
                    )
                }
                
                Column {
                    Text(
                        text = "Inventory",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White
                    )
                    Text(
                        text = "Manage your stock",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.White.copy(alpha = 0.8f)
                    )
                }
            }
            
            Button(
                onClick = onAddItem,
                modifier = Modifier
                    .height(48.dp)
                    .clip(RoundedCornerShape(12.dp)),
                colors = ButtonDefaults.buttonColors(containerColor = BeloopSuccess)
            ) {
                Icon(
                    Icons.Default.Add,
                    contentDescription = "Add Item",
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    "Add Item",
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
fun PremiumInventoryStatCard(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color
) {
    Card(
        modifier = Modifier
            .weight(1f)
            .height(100.dp)
            .shadow(12.dp, RoundedCornerShape(16.dp), ambientColor = Color.Black.copy(alpha = 0.2f)),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.1f)),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = color,
                modifier = Modifier.size(24.dp)
            )
            
            Column {
                Text(
                    text = value,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color.White
                )
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.White.copy(alpha = 0.7f)
                )
            }
        }
    }
}

@Composable
fun PremiumInventoryItemCard(
    item: InventoryItem,
    onEdit: () -> Unit,
    onUpdateStock: () -> Unit
) {
    val isLowStock = item.currentStock <= item.minStock
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(12.dp, RoundedCornerShape(16.dp), ambientColor = Color.Black.copy(alpha = 0.2f)),
        colors = CardDefaults.cardColors(
            containerColor = if (isLowStock) 
                BeloopWarning.copy(alpha = 0.1f) 
            else 
                Color.White.copy(alpha = 0.1f)
        ),
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Stock Status Icon
            Icon(
                imageVector = if (isLowStock) Icons.Default.Warning else Icons.Default.CheckCircle,
                contentDescription = "Stock Status",
                tint = if (isLowStock) BeloopWarning else BeloopSuccess,
                modifier = Modifier.size(32.dp)
            )
            
            Spacer(modifier = Modifier.width(16.dp))
            
            // Item Info
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = item.productName,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "Current: ${item.currentStock} | Min: ${item.minStock} | Max: ${item.maxStock}",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.White.copy(alpha = 0.7f)
                )
                Text(
                    text = "₹${String.format("%.0f", item.unitPrice)} per unit",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = BeloopSuccess
                )
            }
            
            // Action Buttons
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                IconButton(
                    onClick = onUpdateStock,
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(BeloopInfo)
                ) {
                    Icon(
                        Icons.Default.Edit,
                        contentDescription = "Update Stock",
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }
                
                IconButton(
                    onClick = onEdit,
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(BeloopPrimary)
                ) {
                    Icon(
                        Icons.Default.Settings,
                        contentDescription = "Edit",
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun PremiumInventoryDialog(
    item: InventoryItem?,
    onDismiss: () -> Unit,
    onSave: (InventoryItem) -> Unit
) {
    var productName by remember { mutableStateOf(item?.productName ?: "") }
    var currentStock by remember { mutableStateOf(item?.currentStock?.toString() ?: "") }
    var minStock by remember { mutableStateOf(item?.minStock?.toString() ?: "") }
    var maxStock by remember { mutableStateOf(item?.maxStock?.toString() ?: "") }
    var unitPrice by remember { mutableStateOf(item?.unitPrice?.toString() ?: "") }
    
    androidx.compose.ui.window.Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
                .shadow(24.dp, RoundedCornerShape(20.dp)),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            shape = RoundedCornerShape(20.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (item == null) "Add Inventory Item" else "Edit Inventory Item",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold,
                        color = BeloopPrimary
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }
                
                Spacer(modifier = Modifier.height(24.dp))
                
                // Form Fields
                OutlinedTextField(
                    value = productName,
                    onValueChange = { productName = it },
                    label = { Text("Product Name") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedTextField(
                        value = currentStock,
                        onValueChange = { currentStock = it },
                        label = { Text("Current Stock") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    )
                    
                    OutlinedTextField(
                        value = minStock,
                        onValueChange = { minStock = it },
                        label = { Text("Min Stock") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    )
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedTextField(
                        value = maxStock,
                        onValueChange = { maxStock = it },
                        label = { Text("Max Stock") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    )
                    
                    OutlinedTextField(
                        value = unitPrice,
                        onValueChange = { unitPrice = it },
                        label = { Text("Unit Price (₹)") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    )
                }
                
                Spacer(modifier = Modifier.height(24.dp))
                
                // Save Button
                Button(
                    onClick = {
                        val updatedItem = item?.copy(
                            productName = productName,
                            currentStock = currentStock.toIntOrNull() ?: 0,
                            minStock = minStock.toIntOrNull() ?: 0,
                            maxStock = maxStock.toIntOrNull() ?: 0,
                            unitPrice = unitPrice.toDoubleOrNull() ?: 0.0
                        ) ?: InventoryItem(
                            id = System.currentTimeMillis().toInt(),
                            productId = System.currentTimeMillis().toInt(),
                            productName = productName,
                            currentStock = currentStock.toIntOrNull() ?: 0,
                            minStock = minStock.toIntOrNull() ?: 0,
                            maxStock = maxStock.toIntOrNull() ?: 0,
                            unitPrice = unitPrice.toDoubleOrNull() ?: 0.0,
                            lastUpdated = System.currentTimeMillis()
                        )
                        onSave(updatedItem)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                        .clip(RoundedCornerShape(16.dp)),
                    colors = ButtonDefaults.buttonColors(containerColor = BeloopSuccess)
                ) {
                    Text(
                        if (item == null) "Add Item" else "Update Item",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
