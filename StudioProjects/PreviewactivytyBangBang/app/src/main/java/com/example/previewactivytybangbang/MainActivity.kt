package com.example.previewactivytybangbang

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
//import com.example.previewactivytybang
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.core.os.bundleOf
import com.example.previewactivytybangbang.ui.theme.PreviewactivytyBangBangTheme
import com.google.firebase.analytics.FirebaseAnalytics
import com.google.firebase.analytics.ktx.analytics
import com.google.firebase.analytics.ktx.logEvent
import com.google.firebase.ktx.Firebase

class MainActivity : ComponentActivity() {
    private lateinit var firebaseAnalytics: FirebaseAnalytics

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Obtain the FirebaseAnalytics instance.
        firebaseAnalytics = Firebase.analytics

        setContent {
            PreviewactivytyBangBangTheme {
                // A surface container using the 'background' color from the theme
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background,
                ) {
                    MainScreenContent()
                    // Example usage of logEvent
                    logSelectItemEvent("itemId123", "itemNameExample")
                }
            }
        }
    }

    private fun logSelectItemEvent(id: String, name: String) {
        firebaseAnalytics.logEvent(FirebaseAnalytics.Event.SELECT_ITEM, bundleOf(
            FirebaseAnalytics.Param.ITEM_ID to id,
            FirebaseAnalytics.Param.ITEM_NAME to name,
            FirebaseAnalytics.Param.CONTENT_TYPE to "image"
        ))
    }
}

@Composable
fun MainScreenContent() {
    BakingScreen()
}

@Preview(showSystemUi = true)
@Composable
fun MainActivityPreview() {
    PreviewactivytyBangBangTheme {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            MainScreenContent()
        }
    }
}