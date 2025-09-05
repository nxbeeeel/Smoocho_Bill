package com.beloop.pos.data.model

import android.os.Parcelable
import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.parcelize.Parcelize
import java.util.Date

@Entity(tableName = "orders")
@Parcelize
data class Order(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val orderNumber: String,
    val items: List<OrderItem>,
    val subtotal: Double,
    val discount: Double = 0.0,
    val discountType: DiscountType = DiscountType.FLAT,
    val tax: Double,
    val total: Double,
    val paymentMethod: PaymentMethod,
    val paymentStatus: PaymentStatus,
    val orderStatus: OrderStatus = OrderStatus.PENDING,
    val cashierId: Long,
    val customerName: String? = null,
    val customerPhone: String? = null,
    val customerEmail: String? = null,
    val notes: String? = null,
    val tableNumber: String? = null,
    val estimatedTime: Int? = null, // in minutes
    val createdAt: Date = Date(),
    val updatedAt: Date = Date(),
    val completedAt: Date? = null,
    val lastSyncedAt: Date? = null,
    val syncStatus: SyncStatus = SyncStatus.PENDING
) : Parcelable

@Parcelize
data class OrderItem(
    val productId: Long,
    val productName: String,
    val quantity: Int,
    val unitPrice: Double,
    val totalPrice: Double,
    val specialInstructions: String? = null,
    val modifications: List<Modification> = emptyList()
) : Parcelable

@Parcelize
data class Modification(
    val name: String,
    val price: Double = 0.0,
    val isRemoval: Boolean = false
) : Parcelable

enum class DiscountType {
    FLAT, PERCENTAGE
}

enum class PaymentMethod {
    CASH, CARD, UPI, WALLET, CREDIT
}

enum class PaymentStatus {
    PENDING, COMPLETED, FAILED, REFUNDED
}

enum class OrderStatus {
    PENDING, CONFIRMED, PREPARING, READY, SERVED, COMPLETED, CANCELLED
}

enum class SyncStatus {
    PENDING, SYNCED, FAILED, CONFLICT
}
