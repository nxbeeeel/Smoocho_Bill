package com.beloop.pos.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.beloop.pos.data.model.Product
import com.beloop.pos.ui.theme.*
import com.beloop.pos.viewmodel.MenuEditorViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MenuEditorScreen(
    navController: NavController,
    viewModel: MenuEditorViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BeloopBackground)
    ) {
        // Premium Header
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(GradientStart, GradientEnd)
                    )
                )
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Menu Editor",
                        style = MaterialTheme.typography.headlineLarge,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = "Manage your restaurant menu",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.White.copy(alpha = 0.9f)
                    )
                }
                
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    IconButton(
                        onClick = { /* Add new product */ },
                        modifier = Modifier
                            .background(
                                Color.White.copy(alpha = 0.2f),
                                RoundedCornerShape(8.dp)
                            )
                    ) {
                        Icon(
                            Icons.Default.Add,
                            contentDescription = "Add Product",
                            tint = Color.White
                        )
                    }
                    
                    IconButton(
                        onClick = { navController.popBackStack() },
                        modifier = Modifier
                            .background(
                                Color.White.copy(alpha = 0.2f),
                                RoundedCornerShape(8.dp)
                            )
                    ) {
                        Icon(
                            Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White
                        )
                    }
                }
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Categories Filter
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(horizontal = 16.dp)
        ) {
            items(uiState.categories) { category ->
                FilterChip(
                    onClick = { viewModel.selectCategory(category) },
                    label = { 
                        Text(
                            text = category,
                            fontWeight = FontWeight.Medium
                        ) 
                    },
                    selected = uiState.selectedCategory == category,
                    modifier = Modifier
                        .shadow(
                            elevation = if (uiState.selectedCategory == category) 4.dp else 2.dp,
                            shape = RoundedCornerShape(20.dp)
                        ),
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = BeloopPrimary,
                        selectedLabelColor = Color.White,
                        containerColor = BeloopSurface,
                        labelColor = BeloopOnSurface
                    )
                )
            }
        }
        
        Spacer(modifier = Modifier.height(20.dp))
        
        // Products List
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(uiState.products) { product ->
                AnimatedVisibility(
                    visible = true,
                    enter = slideInVertically() + fadeIn(),
                    exit = slideOutVertically() + fadeOut()
                ) {
                    ProductEditorCard(
                        product = product,
                        onEdit = { /* Edit product */ },
                        onToggleActive = { viewModel.toggleProductActive(product) },
                        onDelete = { viewModel.deleteProduct(product) }
                    )
                }
            }
        }
    }
}

@Composable
fun ProductEditorCard(
    product: Product,
    onEdit: () -> Unit,
    onToggleActive: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(
                elevation = 4.dp,
                shape = RoundedCornerShape(12.dp)
            ),
        colors = CardDefaults.cardColors(
            containerColor = BeloopSurface
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = product.name,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = BeloopOnSurface
                    )
                    
                    Spacer(modifier = Modifier.width(8.dp))
                    
                    if (product.isActive) {
                        Card(
                            colors = CardDefaults.cardColors(
                                containerColor = BeloopSuccess.copy(alpha = 0.1f)
                            ),
                            shape = RoundedCornerShape(4.dp)
                        ) {
                            Text(
                                text = "Active",
                                style = MaterialTheme.typography.labelSmall,
                                color = BeloopSuccess,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    } else {
                        Card(
                            colors = CardDefaults.cardColors(
                                containerColor = BeloopError.copy(alpha = 0.1f)
                            ),
                            shape = RoundedCornerShape(4.dp)
                        ) {
                            Text(
                                text = "Inactive",
                                style = MaterialTheme.typography.labelSmall,
                                color = BeloopError,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                }
                
                Text(
                    text = product.category,
                    style = MaterialTheme.typography.bodySmall,
                    color = BeloopOnSurfaceVariant
                )
                
                Text(
                    text = "$${String.format("%.2f", product.price)}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = BeloopPrimary
                )
            }
            
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                IconButton(
                    onClick = onEdit,
                    modifier = Modifier
                        .background(
                            BeloopPrimary.copy(alpha = 0.1f),
                            RoundedCornerShape(6.dp)
                        )
                ) {
                    Icon(
                        Icons.Default.Edit,
                        contentDescription = "Edit",
                        modifier = Modifier.size(20.dp),
                        tint = BeloopPrimary
                    )
                }
                
                IconButton(
                    onClick = onToggleActive,
                    modifier = Modifier
                        .background(
                            if (product.isActive) BeloopWarning.copy(alpha = 0.1f) else BeloopSuccess.copy(alpha = 0.1f),
                            RoundedCornerShape(6.dp)
                        )
                ) {
                    Icon(
                        if (product.isActive) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                        contentDescription = if (product.isActive) "Deactivate" else "Activate",
                        modifier = Modifier.size(20.dp),
                        tint = if (product.isActive) BeloopWarning else BeloopSuccess
                    )
                }
                
                IconButton(
                    onClick = onDelete,
                    modifier = Modifier
                        .background(
                            BeloopError.copy(alpha = 0.1f),
                            RoundedCornerShape(6.dp)
                        )
                ) {
                    Icon(
                        Icons.Default.Delete,
                        contentDescription = "Delete",
                        modifier = Modifier.size(20.dp),
                        tint = BeloopError
                    )
                }
            }
        }
    }
}
