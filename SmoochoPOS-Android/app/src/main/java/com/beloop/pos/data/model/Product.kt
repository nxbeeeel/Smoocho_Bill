package com.beloop.pos.data.model

import android.os.Parcelable
import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.parcelize.Parcelize
import java.util.Date

@Entity(tableName = "products")
@Parcelize
data class Product(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val price: Double,
    val category: String,
    val description: String? = null,
    val imageUrl: String? = null,
    val isActive: Boolean = true,
    val isAvailable: Boolean = true,
    val preparationTime: Int = 0, // in minutes
    val ingredients: List<String> = emptyList(),
    val allergens: List<String> = emptyList(),
    val nutritionalInfo: NutritionalInfo? = null,
    val tags: List<String> = emptyList(),
    val createdAt: Date = Date(),
    val updatedAt: Date = Date(),
    val lastSyncedAt: Date? = null,
    val syncStatus: SyncStatus = SyncStatus.PENDING
) : Parcelable

@Parcelize
data class NutritionalInfo(
    val calories: Int = 0,
    val protein: Double = 0.0,
    val carbs: Double = 0.0,
    val fat: Double = 0.0,
    val fiber: Double = 0.0,
    val sugar: Double = 0.0
) : Parcelable

