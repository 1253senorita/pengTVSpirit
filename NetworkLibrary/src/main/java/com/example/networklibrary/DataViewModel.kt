package com.example.networklibrary

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch

class DataViewModel : ViewModel() {
    private val repository = DataRepository()

    fun sendData() {
        viewModelScope.launch {
            val uniqueId = generateUniqueId()
            val dataModel = DataModel(id = uniqueId, name = "Some Name")
            val response = repository.addData(dataModel)
            println(response.body()?.message)
        }
    }
    fun addData(dataModel: DataModel) {
        viewModelScope.launch {
            val response = repository.addData(dataModel)
            println(response.body()?.message)
        }
    }

    fun fetchData() {
        viewModelScope.launch {
            val response = repository.getData()
            if (response.isSuccessful) {
                response.body()?.let { dataList ->
                    dataList.forEach { data ->
                        println("ID: ${data.id}, Name: ${data.name}")
                    }
                }
            } else {
                println("Error: ${response.errorBody()}")
            }
        }
    }
    fun deleteAllData() {
        viewModelScope.launch {
            val response = repository.deleteAllData()
            println(response.body()?.message)
        }
    }

    private fun generateUniqueId(): Int {
        return (1..1000000).random()
    }
}
