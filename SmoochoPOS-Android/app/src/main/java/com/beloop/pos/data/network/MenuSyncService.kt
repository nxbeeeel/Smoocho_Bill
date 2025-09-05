package com.beloop.pos.data.network

import com.beloop.pos.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface MenuSyncService {
    
    @GET("api/shops/{shopId}/products")
    suspend fun getProducts(
        @Path("shopId") shopId: String,
        @Query("lastSync") lastSync: String? = null
    ): Response<MenuSyncData>
    
    @POST("api/shops/{shopId}/products")
    suspend fun syncProducts(
        @Path("shopId") shopId: String,
        @Body products: List<Product>
    ): Response<SyncResponse>
    
    @GET("api/shops/{shopId}/orders")
    suspend fun getOrders(
        @Path("shopId") shopId: String,
        @Query("lastSync") lastSync: String? = null
    ): Response<List<Order>>
    
    @POST("api/shops/{shopId}/orders")
    suspend fun syncOrders(
        @Path("shopId") shopId: String,
        @Body orders: List<Order>
    ): Response<SyncResponse>
    
    @GET("api/sync/health")
    suspend fun checkHealth(): Response<Map<String, Any>>
    
    @POST("api/shops/{shopId}/sync")
    suspend fun fullSync(
        @Path("shopId") shopId: String,
        @Body request: SyncRequest
    ): Response<MenuSyncData>
}
