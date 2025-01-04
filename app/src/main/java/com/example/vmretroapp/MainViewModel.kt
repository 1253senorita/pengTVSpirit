package com.example.vmretroapp

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.networklibrary.ApiService
import com.example.networklibrary.DataModel
import com.example.networklibrary.RetrofitClient
import com.example.networklibrary.AddDataResponse
import com.example.networklibrary.DataRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import retrofit2.HttpException

class MainViewModel : ViewModel() {
    private val apiService = RetrofitClient.instance.create(ApiService::class.java)
    private val repository = DataRepository()

    sealed interface UiState {
        object Initial : UiState
        object Loading : UiState
        data class Success(val data: String) : UiState
        data class Error(val message: String) : UiState
    }

    private val _uiState = MutableStateFlow<UiState>(UiState.Initial)
    val uiState: StateFlow<UiState> = _uiState

    fun addData(dataModel: DataModel) {
        _uiState.value = UiState.Loading
        viewModelScope.launch {
            try {
                val response = apiService.addData(dataModel)
                if (response.isSuccessful) {
                    _uiState.value = UiState.Success("Data added successfully")
                } else {
                    _uiState.value = UiState.Error("Failed to add data")
                }
            } catch (e: HttpException) {
                _uiState.value = UiState.Error(e.message())
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message ?: "Unknown error")
            }
        }
    }

    fun fetchData() {
        _uiState.value = UiState.Loading
        viewModelScope.launch {
            try {
                val response = apiService.getData()
                if (response.isSuccessful) {
                    val dataList = response.body()?.joinToString { it.name } ?: "No Data"
                    _uiState.value = UiState.Success(dataList)
                } else {
                    _uiState.value = UiState.Error("Failed to fetch data")
                }
            } catch (e: HttpException) {
                _uiState.value = UiState.Error(e.message())
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message ?: "Unknown error")
            }
        }
    }

    fun deleteAllData() {
        viewModelScope.launch {
            try {
                val response = repository.deleteAllData()
                if (response.isSuccessful) {
                    _uiState.value = UiState.Success(response.body()?.message ?: "All data deleted successfully")
                } else {
                    _uiState.value = UiState.Error("Failed to delete all data")
                }
            } catch (e: HttpException) {
                _uiState.value = UiState.Error(e.message())
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message ?: "Unknown error")
            }
        }
    }
}
