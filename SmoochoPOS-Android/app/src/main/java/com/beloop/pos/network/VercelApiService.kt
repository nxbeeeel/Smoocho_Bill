package com.beloop.pos.network

import com.beloop.pos.data.model.Order
import com.beloop.pos.data.model.Product
import com.beloop.pos.data.model.User
import retrofit2.Response
import retrofit2.http.*

interface VercelApiService {
    
    // Authentication
    @POST("api/auth/login")
    suspend fun login(@Body credentials: LoginRequest): Response<LoginResponse>
    
    @POST("api/auth/register")
    suspend fun register(@Body user: RegisterRequest): Response<RegisterResponse>
    
    @GET("api/auth/profile")
    suspend fun getProfile(@Header("Authorization") token: String): Response<User>
    
    // Products
    @GET("api/products")
    suspend fun getProducts(): Response<List<Product>>
    
    @POST("api/products")
    suspend fun createProduct(@Body product: Product): Response<Product>
    
    @PUT("api/products/{id}")
    suspend fun updateProduct(@Path("id") id: Long, @Body product: Product): Response<Product>
    
    @DELETE("api/products/{id}")
    suspend fun deleteProduct(@Path("id") id: Long): Response<Unit>
    
    // Orders
    @GET("api/orders")
    suspend fun getOrders(): Response<List<Order>>
    
    @POST("api/orders")
    suspend fun createOrder(@Body order: Order): Response<Order>
    
    @PUT("api/orders/{id}")
    suspend fun updateOrder(@Path("id") id: Long, @Body order: Order): Response<Order>
    
    @DELETE("api/orders/{id}")
    suspend fun deleteOrder(@Path("id") id: Long): Response<Unit>
    
    // Sync
    @POST("api/sync/upload")
    suspend fun uploadData(@Body data: SyncData): Response<SyncResponse>
    
    @GET("api/sync/download")
    suspend fun downloadData(@Query("lastSync") lastSync: Long): Response<SyncData>
    
    // Health Check
    @GET("api/sync/health")
    suspend fun healthCheck(): Response<HealthResponse>
}

data class LoginRequest(
    val username: String,
    val password: String
)

data class LoginResponse(
    val token: String,
    val user: User,
    val expiresIn: Long
)

data class RegisterRequest(
    val name: String,
    val email: String,
    val username: String,
    val password: String,
    val role: String = "admin"
)

data class RegisterResponse(
    val token: String,
    val user: User
)

data class SyncData(
    val orders: List<Order>,
    val products: List<Product>,
    val lastSync: Long,
    val deviceId: String
)

data class SyncResponse(
    val success: Boolean,
    val message: String,
    val conflicts: List<ConflictItem> = emptyList()
)

data class ConflictItem(
    val type: String,
    val id: Long,
    val localData: Any,
    val serverData: Any
)

data class HealthResponse(
    val status: String,
    val timestamp: Long,
    val version: String
)
