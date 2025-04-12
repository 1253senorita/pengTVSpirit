

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    //alias(libs.plugins.google.gms.google.services)
    alias(libs.plugins.google.android.libraries.mapsplatform.secrets.gradle.plugin)
    id("com.google.devtools.ksp")
}

android {
    namespace = "com.example.previewactivytybangbang"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.previewactivytybangbang"
        minSdk = 24
        targetSdk = 35
        versionCode = 2
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
    packaging {
        resources {
            excludes += "META-INF/INDEX.LIST" // 중복된 파일 제외
        }
    }


}

dependencies {
    // Firebase BOM 적용
    implementation(platform(libs.firebase.bom))

    // Firebase 의존성
    implementation(libs.firebase.auth)
    implementation(libs.firebase.firestore)
    implementation(libs.firebase.dataconnect)
    implementation(libs.firebase.crashlytics) // Crashlytics 추가
    implementation(libs.firebase.analytics)   // Analytics 추가
    implementation(libs.firebase.storage) // Firebase Storage 추가
    implementation(libs.firebase.messaging) // Firebase Messaging 추가
    //implementation(libs.firebase.crashlytics) // Crashlytics 추가
    //implementation(platform(libs.firebase.bom)

    // AndroidX 의존성
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)

    // Compose BOM 적용
    implementation(platform(libs.androidx.compose.bom))

    // Compose 의존성
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)

    // 기타 의존성
    implementation(libs.generativeai)
    implementation(libs.play.services.measurement.api)
    implementation(libs.timber) // Timber 추가

    // Ktor 의존성
    implementation(libs.ktor.server.core)
    implementation(libs.ktor.server.netty)

    // Test 의존성
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)

    // Debug 의존성
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)

    //kotlinx serialization
    implementation(libs.kotlinx.serialization.json)

    // Room 의존성
    implementation(libs.androidx.room.runtime)
    ksp(libs.androidx.room.compiler)
}