package com.beloop.pos.data.model

import android.os.Parcelable
import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.parcelize.Parcelize

@Entity(tableName = "settings")
@Parcelize
data class Settings(
    @PrimaryKey
    val key: String,
    val value: String,
    val description: String? = null
) : Parcelable

@Parcelize
data class ReceiptTemplate(
    val header: String,
    val subHeader: String,
    val address: String,
    val phone: String,
    val footer: String
) : Parcelable

@Parcelize
data class ShopSettings(
    val shopName: String,
    val address: String,
    val phone: String,
    val email: String,
    val taxRate: Double,
    val currency: String,
    val receiptTemplate: ReceiptTemplate
) : Parcelable
