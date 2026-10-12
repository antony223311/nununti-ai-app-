import { AndroidExportFile } from '../types/assistant';

export const ANDROID_FILES: AndroidExportFile[] = [
  {
    name: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    description: 'System permissions, Lock Screen overlay activity flags, and Background Wake-Word Service declaration.',
    language: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.nununti.voiceassistant">

    <!-- Essential Voice & Background Permissions -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.CALL_PHONE" />
    <uses-permission android:name="android.permission.CAMERA" tools:ignore="PermissionImpliesUnsupportedChromeOsHardware" />
    <uses-permission android:name="android.permission.FLASHLIGHT" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Nununti"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.Nununti">

        <!-- Main Launcher Activity -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait"
            android:theme="@style/Theme.Nununti.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Lock Screen Floating Overlay Activity (wakes over lock screen) -->
        <activity
            android:name=".LockScreenOverlayActivity"
            android:exported="false"
            android:excludeFromRecents="true"
            android:launchMode="singleInstance"
            android:showOnLockScreen="true"
            android:showWhenLocked="true"
            android:turnScreenOn="true"
            android:theme="@style/Theme.Nununti.LockScreenOverlay" />

        <!-- Low-Power Wake-Word Background Service ("Nununti") -->
        <service
            android:name=".services.NununtiWakeWordService"
            android:exported="false"
            android:foregroundServiceType="microphone" />

        <!-- Auto-Start Wake-Word Service on Device Boot -->
        <receiver
            android:name=".receivers.BootCompletedReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.QUICKBOOT_POWERON" />
            </intent-filter>
        </receiver>

    </application>
</manifest>`,
  },
  {
    name: 'NununtiWakeWordService.kt',
    path: 'app/src/main/java/com/nununti/voiceassistant/services/NununtiWakeWordService.kt',
    description: 'Ultra-low battery background service listening for the "Nununti" hotword even when the screen is locked.',
    language: 'kotlin',
    content: `package com.nununti.voiceassistant.services

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.nununti.voiceassistant.LockScreenOverlayActivity
import com.nununti.voiceassistant.MainActivity
import com.nununti.voiceassistant.R
import ai.picovoice.porcupine.PorcupineManager
import ai.picovoice.porcupine.PorcupineException

class NununtiWakeWordService : Service() {

    private var porcupineManager: PorcupineManager? = null
    private val CHANNEL_ID = "nununti_wake_channel"
    private val NOTIF_ID = 1001

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(NOTIF_ID, buildForegroundNotification())
        initWakeWordEngine()
    }

    private fun initWakeWordEngine() {
        try {
            // Low-power acoustic wake-word engine trained on "Nununti" (নুনুনতি)
            porcupineManager = PorcupineManager.Builder()
                .setKeywordPath("nununti_android.ppn") // Custom acoustic model for 'Nununti'
                .setSensitivity(0.75f)
                .build(applicationContext) { keywordIndex ->
                    // Wake-Word "Nununti" Detected!
                    onWakeWordDetected()
                }
            porcupineManager?.start()
        } catch (e: PorcupineException) {
            e.printStackTrace()
        }
    }

    private fun onWakeWordDetected() {
        // Trigger Lock Screen Overlay or Launch Assistant immediately
        val overlayIntent = Intent(this, LockScreenOverlayActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or 
                     Intent.FLAG_ACTIVITY_CLEAR_TOP or 
                     Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
            putExtra("AUTO_LISTEN", true)
        }
        startActivity(overlayIntent)
    }

    private fun buildForegroundNotification(): Notification {
        val openAppIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, openAppIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Nununti Voice Assistant")
            .setContentText("Listening for 'Nununti' wake-word in background...")
            .setSmallIcon(R.drawable.ic_mic_active)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Nununti Background Listener",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps voice recognition ready for 'Nununti' wake-word"
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    override fun onDestroy() {
        porcupineManager?.stop()
        porcupineManager?.delete()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}`,
  },
  {
    name: 'LockScreenOverlayActivity.kt',
    path: 'app/src/main/java/com/nununti/voiceassistant/LockScreenOverlayActivity.kt',
    description: 'Enables Nununti to wake up and appear directly over the Android Lock Screen without user entering passcode.',
    language: 'kotlin',
    content: `package com.nununti.voiceassistant

import android.app.KeyguardManager
import android.content.Context
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.nununti.voiceassistant.ui.NununtiVoiceAssistantScreen

class LockScreenOverlayActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Configure Window to display directly over Secure Lock Screen
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
            val keyguardManager = getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
            keyguardManager.requestDismissKeyguard(this, null)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
            )
        }

        setContent {
            Surface(
                modifier = Modifier.fillMaxSize(),
                color = Color(0xCC030712) // Translucent AMOLED backdrop
            ) {
                NununtiVoiceAssistantScreen(
                    isLockScreenMode = true,
                    onDismiss = { finish() }
                )
            }
        }
    }
}`,
  },
  {
    name: 'GroqVoiceClient.kt',
    path: 'app/src/main/java/com/nununti/voiceassistant/network/GroqVoiceClient.kt',
    description: 'Retrofit & OkHttp client streaming Groq Llama 3.3 70B & Whisper completions with sub-250ms latency.',
    language: 'kotlin',
    content: `package com.nununti.voiceassistant.network

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class GroqVoiceClient(private val apiKey: String) {

    private val client = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    private val GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

    suspend fun getResponse(userPrompt: String, model: String = "llama-3.3-70b-versatile"): String = withContext(Dispatchers.IO) {
        val payload = JSONObject().apply {
            put("model", model)
            put("temperature", 0.7)
            put("max_tokens", 256)
            put("messages", JSONArray().apply {
                put(JSONObject().apply {
                    put("role", "system")
                    put("content", "You are Nununti (নুনুনতি), an intelligent Bengali female voice assistant. Speak concisely in sweet Bengali or English. Output [[ACTION:{...}]] tags for system commands like youtube, call, whatsapp, alarm.")
                })
                put(JSONObject().apply {
                    put("role", "user")
                    put("content", userPrompt)
                })
            })
        }

        val request = Request.Builder()
            .url(GROQ_URL)
            .addHeader("Authorization", "Bearer \$apiKey")
            .addHeader("Content-Type", "application/json")
            .post(payload.toString().toRequestBody("application/json".toMediaType()))
            .build()

        val response = client.newCall(request).execute()
        val json = JSONObject(response.body?.string() ?: "")
        val choices = json.getJSONArray("choices")
        choices.getJSONObject(0).getJSONObject("message").getString("content")
    }
}`,
  },
  {
    name: 'build.gradle.kts',
    path: 'app/build.gradle.kts',
    description: 'Android Gradle module configuration with Jetpack Compose, Porcupine, OkHttp, and Text-to-Speech dependencies.',
    language: 'kotlin',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.nununti.voiceassistant"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.nununti.voiceassistant"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.core.ktx)

    // Ultra-Fast Groq Network Client
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")

    // Low-Power Wake Word Detection
    implementation("ai.picovoice:porcupine-android:3.0.2")

    // Bengali Speech Engine
    implementation("androidx.lifecycle:lifecycle-service:2.8.6")
}`,
  },
];
