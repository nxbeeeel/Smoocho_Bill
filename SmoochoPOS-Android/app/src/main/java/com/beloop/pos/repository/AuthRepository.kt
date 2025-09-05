package com.beloop.pos.repository

import com.beloop.pos.data.firebase.FirebaseAuthService
import com.beloop.pos.data.model.User
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val firebaseAuthService: FirebaseAuthService
) {
    
    fun getCurrentUser(): Flow<com.google.firebase.auth.FirebaseUser?> {
        return firebaseAuthService.getCurrentUser()
    }
    
    suspend fun login(username: String, password: String): Result<User> {
        // For demo purposes, we'll use a simple check
        // In production, you'd use Firebase Auth
        return if (username == "admin" && password == "admin123") {
            val demoUser = User(
                id = 1L,
                username = "admin",
                email = "admin@beloop.com",
                password = "",
                name = "Admin User",
                role = com.beloop.pos.data.model.UserRole.ADMIN
            )
            Result.success(demoUser)
        } else {
            Result.failure(Exception("Invalid credentials"))
        }
    }
    
    suspend fun register(email: String, password: String, userData: User): Result<User> {
        return firebaseAuthService.register(email, password, userData)
    }
    
    suspend fun logout(): Result<Unit> {
        return firebaseAuthService.logout()
    }
    
    suspend fun updateUser(user: User): Result<User> {
        return firebaseAuthService.updateUser(user)
    }
    
    suspend fun changePassword(newPassword: String): Result<Unit> {
        return firebaseAuthService.changePassword(newPassword)
    }
    
    suspend fun resetPassword(email: String): Result<Unit> {
        return firebaseAuthService.resetPassword(email)
    }
    
    fun isUserLoggedIn(): Boolean {
        return firebaseAuthService.isUserLoggedIn()
    }
}
