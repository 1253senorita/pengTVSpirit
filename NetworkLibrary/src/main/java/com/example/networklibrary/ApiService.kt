package com.example.networklibrary

import retrofit2.Response
import retrofit2.http.DELETE
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface ApiService {
    @POST("addData")
    suspend fun addData(@Body dataModel: DataModel): Response<AddDataResponse>

    @GET("getData")
    suspend fun getData(): Response<List<DataModel>>

    @DELETE("deleteAllData")
    suspend fun deleteAllData(): Response<DeleteAllDataResponse>
}
