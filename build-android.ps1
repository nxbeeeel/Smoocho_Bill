# Android APK Build Script for Smoocho Bill
# This script creates an Android Studio project that loads the PWA locally

Write-Host "🚀 Building Android APK for Smoocho Bill..." -ForegroundColor Green
Write-Host ""

# Check if client is built
if (-not (Test-Path "client/dist")) {
    Write-Host "❌ Client not built! Please run 'npm run build:prod' in client directory first." -ForegroundColor Red
    exit 1
}

# Check if server is built
if (-not (Test-Path "server/dist")) {
    Write-Host "❌ Server not built! Please run 'npm run build' in server directory first." -ForegroundColor Red
    exit 1
}

# Define Android project directory
$androidDir = "android"

# Create Android project structure
Write-Host "📁 Creating Android project structure..." -ForegroundColor Blue
New-Item -ItemType Directory -Force -Path $androidDir | Out-Null
New-Item -ItemType Directory -Force -Path "$androidDir/app" | Out-Null
New-Item -ItemType Directory -Force -Path "$androidDir/app/src/main" | Out-Null
New-Item -ItemType Directory -Force -Path "$androidDir/app/src/main/java/com/smoocho/bill" | Out-Null
New-Item -ItemType Directory -Force -Path "$androidDir/app/src/main/res" | Out-Null
New-Item -ItemType Directory -Force -Path "$androidDir/app/src/main/res/values" | Out-Null
New-Item -ItemType Directory -Force -Path "$androidDir/app/src/main/res/layout" | Out-Null
New-Item -ItemType Directory -Force -Path "$androidDir/www" | Out-Null

# Copy built client to Android project
Write-Host "📄 Copying built client to Android project..." -ForegroundColor Blue
Copy-Item -Path "client/dist/*" -Destination "$androidDir/www/" -Recurse -Force

# Create AndroidManifest.xml
Write-Host "📝 Creating AndroidManifest.xml..." -ForegroundColor Blue
$manifestContent = @'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.smoocho.bill">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.SmoochoBill"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:launchMode="singleTop"
            android:theme="@style/Theme.SmoochoBill.NoActionBar"
            android:configChanges="orientation|screenSize|keyboardHidden|smallestScreenSize|screenLayout|density|uiMode"
            android:screenOrientation="fullSensor">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
'@

$manifestContent | Out-File -FilePath "$androidDir/app/src/main/AndroidManifest.xml" -Encoding UTF8

# Create MainActivity
Write-Host "📝 Creating MainActivity..." -ForegroundColor Blue
$mainActivityContent = @'
package com.smoocho.bill;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        webView = new WebView(this);
        setContentView(webView);
        
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setLoadsImagesAutomatically(true);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });
        
        // Load the local PWA
        webView.loadUrl("file:///android_asset/www/index.html");
    }
    
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
'@

$mainActivityContent | Out-File -FilePath "$androidDir/app/src/main/java/com/smoocho/bill/MainActivity.java" -Encoding UTF8

# Create build.gradle
Write-Host "📝 Creating build configuration..." -ForegroundColor Blue
$buildGradleContent = @'
plugins {
    id 'com.android.application'
}

android {
    compileSdk 34
    
    defaultConfig {
        applicationId "com.smoocho.bill"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
        
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.debug
        }
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
    
    buildFeatures {
        viewBinding true
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.10.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
}
'@

$buildGradleContent | Out-File -FilePath "$androidDir/app/build.gradle" -Encoding UTF8

# Create project-level build.gradle
Write-Host "📝 Creating project-level build.gradle..." -ForegroundColor Blue
$projectBuildGradleContent = @'
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.1.0'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
'@

$projectBuildGradleContent | Out-File -FilePath "$androidDir/build.gradle" -Encoding UTF8

# Create gradle.properties
Write-Host "📝 Creating gradle properties..." -ForegroundColor Blue
$gradlePropertiesContent = @'
org.gradle.jvmargs=-Xmx2048m
android.useAndroidX=true
android.enableJetifier=true
'@

$gradlePropertiesContent | Out-File -FilePath "$androidDir/gradle.properties" -Encoding UTF8

# Create settings.gradle
Write-Host "📝 Creating settings configuration..." -ForegroundColor Blue
$settingsGradleContent = @'
rootProject.name = "SmoochoBill"
include ':app'
'@

$settingsGradleContent | Out-File -FilePath "$androidDir/settings.gradle" -Encoding UTF8

# Create strings.xml
Write-Host "📝 Creating string resources..." -ForegroundColor Blue
$stringsContent = @'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Smoocho Bill</string>
</resources>
'@

$stringsContent | Out-File -FilePath "$androidDir/app/src/main/res/values/strings.xml" -Encoding UTF8

# Create activity_main.xml
Write-Host "📝 Creating layout file..." -ForegroundColor Blue
$layoutContent = @'
<?xml version="1.0" encoding="utf-8"?>
<WebView xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/webview"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
'@

$layoutContent | Out-File -FilePath "$androidDir/app/src/main/res/layout/activity_main.xml" -Encoding UTF8

# Create proguard-rules.pro
Write-Host "📝 Creating ProGuard rules..." -ForegroundColor Blue
$proguardContent = @'
# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile
'@

$proguardContent | Out-File -FilePath "$androidDir/app/proguard-rules.pro" -Encoding UTF8

Write-Host "✅ Android project structure created successfully in '$androidDir'!" -ForegroundColor Green
Write-Host ""
Write-Host "👉 Next steps:" -ForegroundColor Cyan
Write-Host "1. Open the '$androidDir' folder in Android Studio." -ForegroundColor Cyan
Write-Host "2. Build and run the project on an emulator or physical device." -ForegroundColor Cyan
Write-Host "3. To generate a signed APK for release, follow Android Studio's 'Build > Generate Signed Bundle / APK...' wizard." -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 The APK will load your PWA locally and work offline!" -ForegroundColor Green

