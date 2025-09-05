package com.beloop.pos.data.dao

import androidx.room.*
import com.beloop.pos.data.model.Order
import kotlinx.coroutines.flow.Flow
import java.util.Date

@Dao
interface OrderDao {
    @Query("SELECT * FROM orders ORDER BY createdAt DESC")
    fun getAllOrders(): Flow<List<Order>>
    
    @Query("SELECT * FROM orders WHERE id = :id")
    suspend fun getOrderById(id: Long): Order?
    
    @Query("SELECT * FROM orders WHERE orderNumber = :orderNumber")
    suspend fun getOrderByNumber(orderNumber: String): Order?
    
    @Query("SELECT * FROM orders WHERE createdAt BETWEEN :startDate AND :endDate")
    fun getOrdersByDateRange(startDate: Date, endDate: Date): Flow<List<Order>>
    
    @Query("SELECT * FROM orders WHERE orderStatus = :status")
    fun getOrdersByStatus(status: String): Flow<List<Order>>
    
    @Query("SELECT * FROM orders WHERE paymentMethod = :paymentMethod")
    fun getOrdersByPaymentMethod(paymentMethod: String): Flow<List<Order>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrder(order: Order): Long
    
    @Update
    suspend fun updateOrder(order: Order)
    
    @Delete
    suspend fun deleteOrder(order: Order)
    
    @Query("SELECT COUNT(*) FROM orders WHERE createdAt BETWEEN :startDate AND :endDate")
    suspend fun getOrderCountByDateRange(startDate: Date, endDate: Date): Int
    
    @Query("SELECT SUM(total) FROM orders WHERE createdAt BETWEEN :startDate AND :endDate")
    suspend fun getTotalSalesByDateRange(startDate: Date, endDate: Date): Double?
    
    @Query("SELECT AVG(total) FROM orders WHERE createdAt BETWEEN :startDate AND :endDate")
    suspend fun getAverageOrderValueByDateRange(startDate: Date, endDate: Date): Double?
    
    @Query("SELECT * FROM orders WHERE syncStatus = 'PENDING'")
    suspend fun getPendingSyncOrders(): List<Order>
    
    @Query("UPDATE orders SET syncStatus = :status WHERE id = :id")
    suspend fun updateOrderSyncStatus(id: Long, status: String)
}
