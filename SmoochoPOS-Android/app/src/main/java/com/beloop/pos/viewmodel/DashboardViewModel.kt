package com.beloop.pos.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.beloop.pos.data.model.Order
import com.beloop.pos.data.model.User
import com.beloop.pos.repository.DashboardRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val dashboardRepository: DashboardRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()
    
    init {
        loadDashboardData()
    }
    
    private fun loadDashboardData() {
        viewModelScope.launch {
            dashboardRepository.getCurrentUser().collect { user ->
                _uiState.value = _uiState.value.copy(currentUser = user)
            }
        }
        
        viewModelScope.launch {
            dashboardRepository.getQuickStats().collect { stats: List<QuickStat> ->
                _uiState.value = _uiState.value.copy(quickStats = stats)
            }
        }
        
        viewModelScope.launch {
            dashboardRepository.getQuickActions().collect { actions: List<QuickAction> ->
                _uiState.value = _uiState.value.copy(quickActions = actions)
            }
        }
        
        viewModelScope.launch {
            dashboardRepository.getRecentOrders().collect { orders ->
                _uiState.value = _uiState.value.copy(recentOrders = orders)
            }
        }
        
        viewModelScope.launch {
            dashboardRepository.getLowStockItems().collect { items ->
                _uiState.value = _uiState.value.copy(lowStockItems = items)
            }
        }
    }
    
    fun refreshData() {
        loadDashboardData()
    }
}

data class DashboardUiState(
    val currentUser: User? = null,
    val quickStats: List<QuickStat> = emptyList(),
    val quickActions: List<QuickAction> = emptyList(),
    val recentOrders: List<Order> = emptyList(),
    val lowStockItems: List<com.beloop.pos.data.model.InventoryItem> = emptyList()
)

data class QuickStat(
    val title: String,
    val value: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
    val color: androidx.compose.ui.graphics.Color,
    val onClick: () -> Unit
)

data class QuickAction(
    val title: String,
    val description: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
    val color: androidx.compose.ui.graphics.Color,
    val route: String
)
