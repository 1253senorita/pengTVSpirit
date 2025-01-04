package com.example.vmretroapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.networklibrary.DataModel
import com.example.vmretroapp.ui.theme.VmRetroAppTheme

class MainActivity : ComponentActivity() {
    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            VmRetroAppTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background,
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .verticalScroll(rememberScrollState()),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Spacer(modifier = Modifier.height(200.dp))
                        NewScreenM(viewModel = viewModel)
                    }
                }
            }
        }
    }
}

@Composable
fun NewScreenM(viewModel: MainViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    var id by remember { mutableStateOf("bomi") } // 기본값 "bomi"
    var name by remember { mutableStateOf("success") } // 기본값 "success"

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        when (uiState) {
            is MainViewModel.UiState.Initial -> {
                Text(text = "Welcome", style = MaterialTheme.typography.headlineMedium)
            }

            is MainViewModel.UiState.Loading -> {
                CircularProgressIndicator()
            }

            is MainViewModel.UiState.Success -> {
                Text(text = (uiState as MainViewModel.UiState.Success).data)
            }

            is MainViewModel.UiState.Error -> {
                Text(
                    text = (uiState as MainViewModel.UiState.Error).message,
                    color = MaterialTheme.colorScheme.error
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // 사용자 입력 필드
        OutlinedTextField(
            value = id,
            onValueChange = { id = it },
            label = { Text("ID") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Name") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(16.dp))

        Button(onClick = { viewModel.fetchData() }) {
            Text(text = "Fetch Data")
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(onClick = {
            val uniqueId = (1..1000000).random() // 고유한 ID 생성
            val dataModel = DataModel(uniqueId, name)
            viewModel.addData(dataModel)
        }) {
            Text(text = "Add Data")
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(onClick = { viewModel.deleteAllData() }) {
            Text(text = "Delete All Data") }

    }
}