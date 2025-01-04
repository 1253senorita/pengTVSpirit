package com.example.networklibrary

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.Response

class DataRepository {
    private val apiService = RetrofitClient.apiService

    suspend fun addData(dataModel: DataModel): Response<AddDataResponse> {
        return withContext(Dispatchers.IO) {
            apiService.addData(dataModel)
        }
    }

    suspend fun getData(): Response<List<DataModel>> {
        return withContext(Dispatchers.IO) {
            apiService.getData()
        }
    }

    suspend fun deleteAllData(): Response<DeleteAllDataResponse> {
        return withContext(Dispatchers.IO) {
            apiService.deleteAllData()
        }
    }
}
