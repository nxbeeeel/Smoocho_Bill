package com.beloop.pos.data.dao

import androidx.room.*
import com.beloop.pos.data.model.Settings
import kotlinx.coroutines.flow.Flow

@Dao
interface SettingsDao {
    @Query("SELECT * FROM settings")
    fun getAllSettings(): Flow<List<Settings>>
    
    @Query("SELECT * FROM settings WHERE key = :key")
    suspend fun getSettingByKey(key: String): Settings?
    
    @Query("SELECT value FROM settings WHERE key = :key")
    suspend fun getSettingValue(key: String): String?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSetting(setting: Settings)
    
    @Update
    suspend fun updateSetting(setting: Settings)
    
    @Delete
    suspend fun deleteSetting(setting: Settings)
    
    @Query("DELETE FROM settings WHERE key = :key")
    suspend fun deleteSettingByKey(key: String)
}
