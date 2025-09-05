package com.beloop.pos.data.database

import androidx.room.TypeConverter
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.beloop.pos.data.model.OrderItem
import com.beloop.pos.data.model.Modification
import com.beloop.pos.data.model.NutritionalInfo
import java.util.Date

class Converters {
    private val gson = Gson()
    
    @TypeConverter
    fun fromOrderItemList(value: List<OrderItem>): String {
        return gson.toJson(value)
    }
    
    @TypeConverter
    fun toOrderItemList(value: String): List<OrderItem> {
        val listType = object : TypeToken<List<OrderItem>>() {}.type
        return gson.fromJson(value, listType)
    }
    
    @TypeConverter
    fun fromModificationList(value: List<Modification>): String {
        return gson.toJson(value)
    }
    
    @TypeConverter
    fun toModificationList(value: String): List<Modification> {
        val listType = object : TypeToken<List<Modification>>() {}.type
        return gson.fromJson(value, listType)
    }
    
    @TypeConverter
    fun fromStringList(value: List<String>): String {
        return gson.toJson(value)
    }
    
    @TypeConverter
    fun toStringList(value: String): List<String> {
        val listType = object : TypeToken<List<String>>() {}.type
        return gson.fromJson(value, listType)
    }
    
    @TypeConverter
    fun fromNutritionalInfo(value: NutritionalInfo?): String? {
        return value?.let { gson.toJson(it) }
    }
    
    @TypeConverter
    fun toNutritionalInfo(value: String?): NutritionalInfo? {
        return value?.let { gson.fromJson(it, NutritionalInfo::class.java) }
    }
    
    @TypeConverter
    fun fromDate(date: Date?): Long? {
        return date?.time
    }
    
    @TypeConverter
    fun toDate(timestamp: Long?): Date? {
        return timestamp?.let { Date(it) }
    }
}
