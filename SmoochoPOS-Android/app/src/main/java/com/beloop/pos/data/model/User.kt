package com.beloop.pos.data.model

import android.os.Parcelable
import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.parcelize.Parcelize
import java.util.Date

@Entity(tableName = "users")
@Parcelize
data class User(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val username: String,
    val email: String,
    val password: String,
    val name: String,
    val role: UserRole,
    val shopId: Long? = null,
    val isActive: Boolean = true,
    val lastLogin: Long? = null,
    val createdAt: Date = Date(),
    val updatedAt: Date = Date()
) : Parcelable

enum class UserRole {
    ADMIN, MANAGER, CASHIER
}
