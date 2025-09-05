package com.beloop.pos.data.firebase

import com.beloop.pos.data.model.*
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FirebaseSyncService @Inject constructor(
    private val firestore: FirebaseFirestore
) {
    
    companion object {
        private const val PRODUCTS_COLLECTION = "products"
        private const val ORDERS_COLLECTION = "orders"
        private const val INVENTORY_COLLECTION = "inventory"
        private const val USERS_COLLECTION = "users"
        private const val SETTINGS_COLLECTION = "settings"
    }
    
    // Products Sync
    fun getProductsFlow(): Flow<List<Product>> = callbackFlow {
        val listener = firestore.collection(PRODUCTS_COLLECTION)
            .whereEqualTo("isActive", true)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                
                val products = snapshot?.documents?.mapNotNull { doc ->
                    try {
                        doc.toObject(Product::class.java)?.copy(id = doc.id.toLongOrNull() ?: 0L)
                    } catch (e: Exception) {
                        null
                    }
                } ?: emptyList()
                
                trySend(products)
            }
        
        awaitClose { listener.remove() }
    }
    
    suspend fun syncProduct(product: Product): Result<Product> {
        return try {
            val docRef = if (product.id == 0L) {
                firestore.collection(PRODUCTS_COLLECTION).document()
            } else {
                firestore.collection(PRODUCTS_COLLECTION).document(product.id.toString())
            }
            
            val productToSync = product.copy(
                id = docRef.id.toLongOrNull() ?: product.id,
                lastSyncedAt = java.util.Date(),
                syncStatus = SyncStatus.SYNCED
            )
            
            docRef.set(productToSync).await()
            Result.success(productToSync)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Orders Sync
    fun getOrdersFlow(): Flow<List<Order>> = callbackFlow {
        val listener = firestore.collection(ORDERS_COLLECTION)
            .orderBy("createdAt", com.google.firebase.firestore.Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                
                val orders = snapshot?.documents?.mapNotNull { doc ->
                    try {
                        doc.toObject(Order::class.java)?.copy(id = doc.id.toLongOrNull() ?: 0L)
                    } catch (e: Exception) {
                        null
                    }
                } ?: emptyList()
                
                trySend(orders)
            }
        
        awaitClose { listener.remove() }
    }
    
    suspend fun syncOrder(order: Order): Result<Order> {
        return try {
            val docRef = if (order.id == 0L) {
                firestore.collection(ORDERS_COLLECTION).document()
            } else {
                firestore.collection(ORDERS_COLLECTION).document(order.id.toString())
            }
            
            val orderToSync = order.copy(
                id = docRef.id.toLongOrNull() ?: order.id,
                lastSyncedAt = java.util.Date(),
                syncStatus = SyncStatus.SYNCED
            )
            
            docRef.set(orderToSync).await()
            Result.success(orderToSync)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Inventory Sync
    fun getInventoryFlow(): Flow<List<InventoryItem>> = callbackFlow {
        val listener = firestore.collection(INVENTORY_COLLECTION)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                
                val inventory = snapshot?.documents?.mapNotNull { doc ->
                    try {
                        doc.toObject(InventoryItem::class.java)?.copy(id = doc.id.toLongOrNull() ?: 0L)
                    } catch (e: Exception) {
                        null
                    }
                } ?: emptyList()
                
                trySend(inventory)
            }
        
        awaitClose { listener.remove() }
    }
    
    suspend fun syncInventoryItem(item: InventoryItem): Result<InventoryItem> {
        return try {
            val docRef = if (item.id == 0L) {
                firestore.collection(INVENTORY_COLLECTION).document()
            } else {
                firestore.collection(INVENTORY_COLLECTION).document(item.id.toString())
            }
            
            val itemToSync = item.copy(id = docRef.id.toLongOrNull() ?: item.id)
            docRef.set(itemToSync).await()
            Result.success(itemToSync)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Users Sync
    fun getUsersFlow(): Flow<List<User>> = callbackFlow {
        val listener = firestore.collection(USERS_COLLECTION)
            .whereEqualTo("isActive", true)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                
                val users = snapshot?.documents?.mapNotNull { doc ->
                    try {
                        doc.toObject(User::class.java)?.copy(id = doc.id.toLongOrNull() ?: 0L)
                    } catch (e: Exception) {
                        null
                    }
                } ?: emptyList()
                
                trySend(users)
            }
        
        awaitClose { listener.remove() }
    }
    
    suspend fun syncUser(user: User): Result<User> {
        return try {
            val docRef = if (user.id == 0L) {
                firestore.collection(USERS_COLLECTION).document()
            } else {
                firestore.collection(USERS_COLLECTION).document(user.id.toString())
            }
            
            val userToSync = user.copy(id = docRef.id.toLongOrNull() ?: user.id)
            docRef.set(userToSync).await()
            Result.success(userToSync)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Settings Sync
    fun getSettingsFlow(): Flow<List<Settings>> = callbackFlow {
        val listener = firestore.collection(SETTINGS_COLLECTION)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                
                val settings = snapshot?.documents?.mapNotNull { doc ->
                    try {
                        doc.toObject(Settings::class.java)
                    } catch (e: Exception) {
                        null
                    }
                } ?: emptyList()
                
                trySend(settings)
            }
        
        awaitClose { listener.remove() }
    }
    
    suspend fun syncSetting(setting: Settings): Result<Settings> {
        return try {
            firestore.collection(SETTINGS_COLLECTION)
                .document(setting.key)
                .set(setting)
                .await()
            Result.success(setting)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Bulk Sync Operations
    suspend fun syncAllProducts(products: List<Product>): Result<List<Product>> {
        return try {
            val batch = firestore.batch()
            val syncedProducts = mutableListOf<Product>()
            
            products.forEach { product ->
                val docRef = if (product.id == 0L) {
                    firestore.collection(PRODUCTS_COLLECTION).document()
                } else {
                    firestore.collection(PRODUCTS_COLLECTION).document(product.id.toString())
                }
                
                val productToSync = product.copy(
                    id = docRef.id.toLongOrNull() ?: product.id,
                    lastSyncedAt = java.util.Date(),
                    syncStatus = SyncStatus.SYNCED
                )
                
                batch.set(docRef, productToSync)
                syncedProducts.add(productToSync)
            }
            
            batch.commit().await()
            Result.success(syncedProducts)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun syncAllOrders(orders: List<Order>): Result<List<Order>> {
        return try {
            val batch = firestore.batch()
            val syncedOrders = mutableListOf<Order>()
            
            orders.forEach { order ->
                val docRef = if (order.id == 0L) {
                    firestore.collection(ORDERS_COLLECTION).document()
                } else {
                    firestore.collection(ORDERS_COLLECTION).document(order.id.toString())
                }
                
                val orderToSync = order.copy(
                    id = docRef.id.toLongOrNull() ?: order.id,
                    lastSyncedAt = java.util.Date(),
                    syncStatus = SyncStatus.SYNCED
                )
                
                batch.set(docRef, orderToSync)
                syncedOrders.add(orderToSync)
            }
            
            batch.commit().await()
            Result.success(syncedOrders)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Health Check
    suspend fun checkConnection(): Result<Boolean> {
        return try {
            firestore.collection("health").document("check").set(mapOf("timestamp" to System.currentTimeMillis())).await()
            Result.success(true)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
