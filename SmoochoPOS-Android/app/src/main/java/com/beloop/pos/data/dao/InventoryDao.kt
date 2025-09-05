package com.beloop.pos.data.dao

import androidx.room.*
import com.beloop.pos.data.model.InventoryItem
import kotlinx.coroutines.flow.Flow
import java.util.Date

@Dao
interface InventoryDao {
    @Query("SELECT * FROM inventory ORDER BY name ASC")
    fun getAllInventoryItems(): Flow<List<InventoryItem>>
    
    @Query("SELECT * FROM inventory WHERE id = :id")
    suspend fun getInventoryItemById(id: Long): InventoryItem?
    
    @Query("SELECT * FROM inventory WHERE name LIKE :searchTerm")
    fun searchInventoryItems(searchTerm: String): Flow<List<InventoryItem>>
    
    @Query("SELECT * FROM inventory WHERE quantity <= threshold")
    fun getLowStockItems(): Flow<List<InventoryItem>>
    
    @Query("SELECT * FROM inventory WHERE category = :category")
    fun getInventoryByCategory(category: String): Flow<List<InventoryItem>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertInventoryItem(item: InventoryItem): Long
    
    @Update
    suspend fun updateInventoryItem(item: InventoryItem)
    
    @Delete
    suspend fun deleteInventoryItem(item: InventoryItem)
    
    @Query("UPDATE inventory SET quantity = :newQuantity WHERE id = :id")
    suspend fun updateQuantity(id: Long, newQuantity: Double)
    
    @Query("SELECT DISTINCT category FROM inventory")
    fun getAllCategories(): Flow<List<String>>
    
    @Query("SELECT COUNT(*) FROM inventory WHERE quantity <= threshold")
    suspend fun getLowStockCount(): Int
}
