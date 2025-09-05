package com.beloop.pos.repository

import com.beloop.pos.data.SmoochoMenuData
import com.beloop.pos.data.dao.ProductDao
import com.beloop.pos.data.firebase.FirebaseSyncService
import com.beloop.pos.data.model.Product
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProductRepository @Inject constructor(
    private val productDao: ProductDao,
    private val firebaseSyncService: FirebaseSyncService
) {
    
    fun getAllActiveProducts(): Flow<List<Product>> {
        return combine(
            productDao.getAllActiveProducts(),
            firebaseSyncService.getProductsFlow()
        ) { localProducts, cloudProducts ->
            // Merge local and cloud products, prioritizing cloud data
            val cloudProductMap = cloudProducts.associateBy { it.id }
            val mergedProducts = mutableListOf<Product>()
            
            // Add cloud products first
            mergedProducts.addAll(cloudProducts)
            
            // Add local products that aren't in cloud
            localProducts.forEach { localProduct ->
                if (!cloudProductMap.containsKey(localProduct.id)) {
                    mergedProducts.add(localProduct)
                }
            }
            
            mergedProducts
        }
    }
    
    fun getProductsByCategory(category: String): Flow<List<Product>> {
        return productDao.getProductsByCategory(category)
    }
    
    suspend fun getProductById(id: Long): Product? {
        return productDao.getProductById(id)
    }
    
    fun searchProducts(query: String): Flow<List<Product>> {
        return productDao.searchProducts(query)
    }
    
    suspend fun insertProduct(product: Product): Long {
        val localId = productDao.insertProduct(product)
        val productWithId = product.copy(id = localId)
        
        // Sync to Firebase
        firebaseSyncService.syncProduct(productWithId)
        
        return localId
    }
    
    suspend fun updateProduct(product: Product) {
        productDao.updateProduct(product)
        firebaseSyncService.syncProduct(product)
    }
    
    suspend fun deleteProduct(product: Product) {
        productDao.deleteProduct(product)
        // Note: Firebase doesn't have delete in this implementation
        // You might want to add a delete flag instead
    }
    
    fun getAllCategories(): Flow<List<String>> {
        return productDao.getAllCategories()
    }
    
    suspend fun deactivateProduct(id: Long) {
        productDao.deactivateProduct(id)
    }
    
    suspend fun getActiveProductCount(): Int {
        return productDao.getActiveProductCount()
    }
    
    // Initialize with Smoocho menu data
    suspend fun initializeMenuData() {
        val existingCount = getActiveProductCount()
        if (existingCount == 0) {
            val menuProducts = SmoochoMenuData.getAllProducts()
            menuProducts.forEach { product ->
                insertProduct(product)
            }
        }
    }
}
