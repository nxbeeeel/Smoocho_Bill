package com.beloop.pos.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.beloop.pos.data.model.Product
import com.beloop.pos.repository.ProductRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MenuEditorViewModel @Inject constructor(
    private val productRepository: ProductRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(MenuEditorUiState())
    val uiState: StateFlow<MenuEditorUiState> = _uiState.asStateFlow()
    
    init {
        loadProducts()
        loadCategories()
    }
    
    private fun loadProducts() {
        viewModelScope.launch {
            productRepository.getAllActiveProducts().collect { products ->
                _uiState.value = _uiState.value.copy(products = products)
            }
        }
    }
    
    private fun loadCategories() {
        viewModelScope.launch {
            productRepository.getAllCategories().collect { categories ->
                val allCategories = listOf("All") + categories
                _uiState.value = _uiState.value.copy(categories = allCategories)
            }
        }
    }
    
    fun selectCategory(category: String) {
        _uiState.value = _uiState.value.copy(selectedCategory = category)
        
        viewModelScope.launch {
            if (category == "All") {
                productRepository.getAllActiveProducts().collect { products ->
                    _uiState.value = _uiState.value.copy(products = products)
                }
            } else {
                productRepository.getProductsByCategory(category).collect { products ->
                    _uiState.value = _uiState.value.copy(products = products)
                }
            }
        }
    }
    
    fun toggleProductActive(product: Product) {
        viewModelScope.launch {
            val updatedProduct = product.copy(isActive = !product.isActive)
            productRepository.updateProduct(updatedProduct)
        }
    }
    
    fun deleteProduct(product: Product) {
        viewModelScope.launch {
            productRepository.deleteProduct(product)
        }
    }
    
    fun addProduct(product: Product) {
        viewModelScope.launch {
            productRepository.insertProduct(product)
        }
    }
    
    fun updateProduct(product: Product) {
        viewModelScope.launch {
            productRepository.updateProduct(product)
        }
    }
}

data class MenuEditorUiState(
    val products: List<Product> = emptyList(),
    val categories: List<String> = emptyList(),
    val selectedCategory: String? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)
