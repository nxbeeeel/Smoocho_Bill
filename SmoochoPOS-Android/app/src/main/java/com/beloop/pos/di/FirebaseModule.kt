package com.beloop.pos.di

import com.beloop.pos.data.firebase.FirebaseAuthService
import com.beloop.pos.data.firebase.FirebaseSyncService
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object FirebaseModule {
    
    @Provides
    @Singleton
    fun provideFirebaseAuth(): FirebaseAuth {
        return FirebaseAuth.getInstance()
    }
    
    @Provides
    @Singleton
    fun provideFirebaseFirestore(): FirebaseFirestore {
        return FirebaseFirestore.getInstance()
    }
    
    @Provides
    @Singleton
    fun provideFirebaseAuthService(
        auth: FirebaseAuth,
        firestore: FirebaseFirestore
    ): FirebaseAuthService {
        return FirebaseAuthService(auth, firestore)
    }
    
    @Provides
    @Singleton
    fun provideFirebaseSyncService(
        firestore: FirebaseFirestore
    ): FirebaseSyncService {
        return FirebaseSyncService(firestore)
    }
}
