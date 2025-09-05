package com.beloop.pos.repository

import com.beloop.pos.data.dao.OrderDao
import com.beloop.pos.data.firebase.FirebaseSyncService
import com.beloop.pos.data.model.Order
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import java.util.Date
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class OrderRepository @Inject constructor(
    private val orderDao: OrderDao,
    private val firebaseSyncService: FirebaseSyncService
) {
    
    fun getAllOrders(): Flow<List<Order>> {
        return combine(
            orderDao.getAllOrders(),
            firebaseSyncService.getOrdersFlow()
        ) { localOrders, cloudOrders ->
            // Merge local and cloud orders, prioritizing cloud data
            val cloudOrderMap = cloudOrders.associateBy { it.id }
            val mergedOrders = mutableListOf<Order>()
            
            // Add cloud orders first
            mergedOrders.addAll(cloudOrders)
            
            // Add local orders that aren't in cloud
            localOrders.forEach { localOrder ->
                if (!cloudOrderMap.containsKey(localOrder.id)) {
                    mergedOrders.add(localOrder)
                }
            }
            
            mergedOrders.sortedByDescending { it.createdAt }
        }
    }
    
    suspend fun getOrderById(id: Long): Order? {
        return orderDao.getOrderById(id)
    }
    
    suspend fun getOrderByNumber(orderNumber: String): Order? {
        return orderDao.getOrderByNumber(orderNumber)
    }
    
    fun getOrdersByDateRange(startDate: Date, endDate: Date): Flow<List<Order>> {
        return orderDao.getOrdersByDateRange(startDate, endDate)
    }
    
    fun getOrdersByStatus(status: String): Flow<List<Order>> {
        return orderDao.getOrdersByStatus(status)
    }
    
    fun getOrdersByPaymentMethod(paymentMethod: String): Flow<List<Order>> {
        return orderDao.getOrdersByPaymentMethod(paymentMethod)
    }
    
    suspend fun insertOrder(order: Order): Long {
        val localId = orderDao.insertOrder(order)
        val orderWithId = order.copy(id = localId)
        
        // Sync to Firebase
        firebaseSyncService.syncOrder(orderWithId)
        
        return localId
    }
    
    suspend fun updateOrder(order: Order) {
        orderDao.updateOrder(order)
        firebaseSyncService.syncOrder(order)
    }
    
    suspend fun deleteOrder(order: Order) {
        orderDao.deleteOrder(order)
    }
    
    suspend fun getOrderCountByDateRange(startDate: Date, endDate: Date): Int {
        return orderDao.getOrderCountByDateRange(startDate, endDate)
    }
    
    suspend fun getTotalSalesByDateRange(startDate: Date, endDate: Date): Double? {
        return orderDao.getTotalSalesByDateRange(startDate, endDate)
    }
    
    suspend fun getAverageOrderValueByDateRange(startDate: Date, endDate: Date): Double? {
        return orderDao.getAverageOrderValueByDateRange(startDate, endDate)
    }
    
    suspend fun getPendingSyncOrders(): List<Order> {
        return orderDao.getPendingSyncOrders()
    }
    
    suspend fun updateOrderSyncStatus(id: Long, status: String) {
        orderDao.updateOrderSyncStatus(id, status)
    }
}
