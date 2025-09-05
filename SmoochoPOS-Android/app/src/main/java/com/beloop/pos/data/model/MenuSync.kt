package com.beloop.pos.data.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import java.util.Date

@Parcelize
data class MenuSyncData(
    val products: List<Product>,
    val categories: List<Category>,
    val lastUpdated: Date,
    val version: String,
    val checksum: String
) : Parcelable

@Parcelize
data class Category(
    val id: String,
    val name: String,
    val description: String? = null,
    val imageUrl: String? = null,
    val displayOrder: Int = 0,
    val isActive: Boolean = true,
    val createdAt: Date = Date(),
    val updatedAt: Date = Date()
) : Parcelable

@Parcelize
data class SyncResponse(
    val success: Boolean,
    val data: MenuSyncData? = null,
    val error: String? = null,
    val timestamp: Date = Date()
) : Parcelable

@Parcelize
data class SyncRequest(
    val lastSyncTimestamp: Date? = null,
    val deviceId: String,
    val appVersion: String,
    val platform: String = "android"
) : Parcelable
