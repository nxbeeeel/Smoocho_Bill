package com.beloop.pos.sync

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import androidx.work.*
import com.beloop.pos.data.dao.OrderDao
import com.beloop.pos.data.dao.ProductDao
import com.beloop.pos.data.model.Order
import com.beloop.pos.data.model.Product
import com.beloop.pos.data.model.SyncStatus
import com.beloop.pos.network.SyncData
import com.beloop.pos.network.VercelApiService
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class VercelSyncService @Inject constructor(
    @ApplicationContext private val context: Context,
    private val orderDao: OrderDao,
    private val productDao: ProductDao
) {
    
    private val apiService: VercelApiService by lazy {
        Retrofit.Builder()
            .baseUrl("https://beloop-pos-api.vercel.app/") // Your Vercel API URL
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(VercelApiService::class.java)
    }
    
    private val workManager = WorkManager.getInstance(context)
    
    fun startPeriodicSync() {
        val syncRequest = PeriodicWorkRequestBuilder<SyncWorker>(
            15, TimeUnit.MINUTES // Sync every 15 minutes
        )
            .setConstraints(
                Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build()
            )
            .build()
        
        workManager.enqueueUniquePeriodicWork(
            "vercel_sync",
            ExistingPeriodicWorkPolicy.KEEP,
            syncRequest
        )
    }
    
    fun stopPeriodicSync() {
        workManager.cancelUniqueWork("vercel_sync")
    }
    
    suspend fun syncNow(): SyncResult = withContext(Dispatchers.IO) {
        try {
            if (!isNetworkAvailable()) {
                return@withContext SyncResult.NoNetwork
            }
            
            // Download latest data from server
            val downloadResult = downloadFromServer()
            if (downloadResult is SyncResult.Success) {
                // Upload local changes to server
                val uploadResult = uploadToServer()
                if (uploadResult is SyncResult.Success) {
                    SyncResult.Success("Sync completed successfully")
                } else {
                    uploadResult
                }
            } else {
                downloadResult
            }
        } catch (e: Exception) {
            SyncResult.Error(e.message ?: "Unknown sync error")
        }
    }
    
    private suspend fun downloadFromServer(): SyncResult {
        return try {
            val response = apiService.downloadData(getLastSyncTime())
            if (response.isSuccessful) {
                val syncData = response.body()
                if (syncData != null) {
                    // Update local database with server data
                    syncData.products.forEach { product ->
                        productDao.insertOrUpdate(product)
                    }
                    syncData.orders.forEach { order ->
                        orderDao.insertOrUpdate(order)
                    }
                    updateLastSyncTime(syncData.lastSync)
                    SyncResult.Success("Downloaded ${syncData.products.size} products and ${syncData.orders.size} orders")
                } else {
                    SyncResult.Error("Empty response from server")
                }
            } else {
                SyncResult.Error("Server error: ${response.code()}")
            }
        } catch (e: Exception) {
            SyncResult.Error("Download failed: ${e.message}")
        }
    }
    
    private suspend fun uploadToServer(): SyncResult {
        return try {
            // Get pending orders and products
            val pendingOrders = orderDao.getPendingSyncOrders()
            val pendingProducts = productDao.getPendingSyncProducts()
            
            if (pendingOrders.isEmpty() && pendingProducts.isEmpty()) {
                return SyncResult.Success("No pending changes to upload")
            }
            
            val syncData = SyncData(
                orders = pendingOrders,
                products = pendingProducts,
                lastSync = getLastSyncTime(),
                deviceId = getDeviceId()
            )
            
            val response = apiService.uploadData(syncData)
            if (response.isSuccessful) {
                val syncResponse = response.body()
                if (syncResponse?.success == true) {
                    // Mark items as synced
                    pendingOrders.forEach { order ->
                        orderDao.updateSyncStatus(order.id, SyncStatus.SYNCED)
                    }
                    pendingProducts.forEach { product ->
                        productDao.updateSyncStatus(product.id, SyncStatus.SYNCED)
                    }
                    SyncResult.Success("Uploaded ${pendingOrders.size} orders and ${pendingProducts.size} products")
                } else {
                    SyncResult.Error(syncResponse?.message ?: "Upload failed")
                }
            } else {
                SyncResult.Error("Upload failed: ${response.code()}")
            }
        } catch (e: Exception) {
            SyncResult.Error("Upload failed: ${e.message}")
        }
    }
    
    private fun isNetworkAvailable(): Boolean {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
        return capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) ||
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)
    }
    
    private fun getLastSyncTime(): Long {
        val prefs = context.getSharedPreferences("sync_prefs", Context.MODE_PRIVATE)
        return prefs.getLong("last_sync", 0L)
    }
    
    private fun updateLastSyncTime(timestamp: Long) {
        val prefs = context.getSharedPreferences("sync_prefs", Context.MODE_PRIVATE)
        prefs.edit().putLong("last_sync", timestamp).apply()
    }
    
    private fun getDeviceId(): String {
        val prefs = context.getSharedPreferences("sync_prefs", Context.MODE_PRIVATE)
        var deviceId = prefs.getString("device_id", null)
        if (deviceId == null) {
            deviceId = "android_${System.currentTimeMillis()}"
            prefs.edit().putString("device_id", deviceId).apply()
        }
        return deviceId
    }
}

sealed class SyncResult {
    data class Success(val message: String) : SyncResult()
    data class Error(val message: String) : SyncResult()
    object NoNetwork : SyncResult()
    object InProgress : SyncResult()
}

class SyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {
    
    override suspend fun doWork(): Result {
        return try {
            // This would be injected in a real implementation
            // For now, we'll just return success
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
