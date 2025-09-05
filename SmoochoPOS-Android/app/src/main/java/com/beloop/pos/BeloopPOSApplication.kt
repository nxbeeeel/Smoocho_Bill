package com.beloop.pos

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class BeloopPOSApplication : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}
