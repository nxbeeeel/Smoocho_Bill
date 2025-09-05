package com.beloop.pos.repository

import com.beloop.pos.data.dao.InventoryDao
import com.beloop.pos.data.dao.OrderDao
import com.beloop.pos.data.dao.UserDao
import com.beloop.pos.data.model.InventoryItem
import com.beloop.pos.data.model.Order
import com.beloop.pos.data.model.User
import com.beloop.pos.viewmodel.DashboardViewModel
import com.beloop.pos.viewmodel.QuickStat
import com.beloop.pos.viewmodel.QuickAction
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.AttachMoney
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material.icons.filled.BarChart
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import java.util.Calendar
import java.util.Date
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DashboardRepository @Inject constructor(
    private val userDao: UserDao,
    private val orderDao: OrderDao,
    private val inventoryDao: InventoryDao
) {
    
    fun getCurrentUser(): Flow<User?> = flow {
        // For demo purposes, return a demo user
        val demoUser = User(
            id = 1L,
            username = "admin",
            email = "admin@beloop.com",
            password = "",
            name = "Admin User",
            role = com.beloop.pos.data.model.UserRole.ADMIN
        )
        emit(demoUser)
    }
    
    fun getQuickStats(): Flow<List<QuickStat>> = flow {
        val today = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }.time
        
        val tomorrow = Calendar.getInstance().apply {
            time = today
            add(Calendar.DAY_OF_MONTH, 1)
        }.time
        
        val orderCount = orderDao.getOrderCountByDateRange(today, tomorrow)
        val totalSales = orderDao.getTotalSalesByDateRange(today, tomorrow) ?: 0.0
        val avgOrderValue = orderDao.getAverageOrderValueByDateRange(today, tomorrow) ?: 0.0
        val lowStockCount = inventoryDao.getLowStockCount()
        
        val stats = listOf(
            QuickStat(
                title = "Today's Orders",
                value = orderCount.toString(),
                icon = Icons.Default.ShoppingCart,
                color = com.beloop.pos.ui.theme.BeloopPrimary,
                onClick = { }
            ),
            QuickStat(
                title = "Today's Sales",
                value = "$${String.format("%.0f", totalSales)}",
                icon = Icons.Default.AttachMoney,
                color = com.beloop.pos.ui.theme.BeloopSuccess,
                onClick = { }
            ),
            QuickStat(
                title = "Avg Order Value",
                value = "$${String.format("%.0f", avgOrderValue)}",
                icon = Icons.Default.TrendingUp,
                color = com.beloop.pos.ui.theme.BeloopInfo,
                onClick = { }
            ),
            QuickStat(
                title = "Low Stock Items",
                value = lowStockCount.toString(),
                icon = Icons.Default.Warning,
                color = com.beloop.pos.ui.theme.BeloopWarning,
                onClick = { }
            )
        )
        
        emit(stats)
    }
    
    fun getQuickActions(): Flow<List<QuickAction>> = flow {
        val actions = listOf(
            QuickAction(
                title = "POS",
                description = "Start new order",
                icon = Icons.Default.ShoppingCart,
                color = com.beloop.pos.ui.theme.BeloopPrimary,
                route = "pos"
            ),
            QuickAction(
                title = "Menu Editor",
                description = "Manage products",
                icon = Icons.Default.Restaurant,
                color = com.beloop.pos.ui.theme.BeloopSecondary,
                route = "menu-editor"
            ),
            QuickAction(
                title = "Inventory",
                description = "Stock management",
                icon = Icons.Default.Storage,
                color = com.beloop.pos.ui.theme.BeloopInfo,
                route = "inventory"
            ),
            QuickAction(
                title = "Reports",
                description = "Analytics & insights",
                icon = Icons.Default.BarChart,
                color = com.beloop.pos.ui.theme.BeloopSuccess,
                route = "reports"
            )
        )
        
        emit(actions)
    }
    
    fun getRecentOrders(): Flow<List<Order>> = flow {
        val today = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }.time
        
        val tomorrow = Calendar.getInstance().apply {
            time = today
            add(Calendar.DAY_OF_MONTH, 1)
        }.time
        
        val orders = orderDao.getOrdersByDateRange(today, tomorrow)
        // This would need to be collected in the repository, but for demo we'll return empty
        emit(emptyList())
    }
    
    fun getLowStockItems(): Flow<List<InventoryItem>> = flow {
        val lowStockItems = inventoryDao.getLowStockItems()
        // This would need to be collected in the repository, but for demo we'll return empty
        emit(emptyList())
    }
}
