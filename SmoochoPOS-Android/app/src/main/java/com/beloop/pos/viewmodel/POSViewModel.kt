package com.beloop.pos.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.beloop.pos.data.model.Order
import com.beloop.pos.data.model.OrderItem
import com.beloop.pos.data.model.Product
import com.beloop.pos.data.IndianMenuData
import com.beloop.pos.repository.ProductRepository
import com.beloop.pos.repository.OrderRepository
import com.beloop.pos.printer.PrinterService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class POSViewModel @Inject constructor(
    private val productRepository: ProductRepository,
    private val orderRepository: OrderRepository,
    private val printerService: PrinterService
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(POSUiState())
    val uiState: StateFlow<POSUiState> = _uiState.asStateFlow()
    
    init {
        loadProducts()
        loadCategories()
    }
    
    private fun loadProducts() {
        viewModelScope.launch {
            // Load Smoocho menu data directly
            val smoochoProducts = IndianMenuData.getAllProducts()
            _uiState.value = _uiState.value.copy(products = smoochoProducts)
        }
    }
    
    private fun loadCategories() {
        viewModelScope.launch {
            // Load Smoocho categories directly
            val smoochoCategories = IndianMenuData.getCategories()
            _uiState.value = _uiState.value.copy(categories = smoochoCategories)
        }
    }
    
    fun selectCategory(category: String) {
        _uiState.value = _uiState.value.copy(selectedCategory = category)
        
        viewModelScope.launch {
            val allProducts = IndianMenuData.getAllProducts()
            val filteredProducts = if (category == "All") {
                allProducts
            } else {
                allProducts.filter { it.category == category }
            }
            _uiState.value = _uiState.value.copy(products = filteredProducts)
        }
    }
    
    fun searchProducts(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        
        viewModelScope.launch {
            val allProducts = IndianMenuData.getAllProducts()
            val filteredProducts = if (query.isBlank()) {
                if (_uiState.value.selectedCategory == "All" || _uiState.value.selectedCategory == null) {
                    allProducts
                } else {
                    allProducts.filter { it.category == _uiState.value.selectedCategory }
                }
            } else {
                allProducts.filter { 
                    it.name.contains(query, ignoreCase = true) || 
                    (it.description?.contains(query, ignoreCase = true) ?: false) ||
                    it.category.contains(query, ignoreCase = true)
                }
            }
            _uiState.value = _uiState.value.copy(products = filteredProducts)
        }
    }
    
    fun addToCart(product: Product) {
        val currentCart = _uiState.value.cartItems.toMutableList()
        val existingItem = currentCart.find { it.productId == product.id }
        
        if (existingItem != null) {
            val updatedItem = existingItem.copy(
                quantity = existingItem.quantity + 1,
                totalPrice = (existingItem.quantity + 1) * existingItem.unitPrice
            )
            val index = currentCart.indexOf(existingItem)
            currentCart[index] = updatedItem
        } else {
            val newItem = OrderItem(
                productId = product.id,
                productName = product.name,
                quantity = 1,
                unitPrice = product.price,
                totalPrice = product.price
            )
            currentCart.add(newItem)
        }
        
        updateCart(currentCart)
    }
    
    fun updateCartItemQuantity(item: OrderItem, newQuantity: Int) {
        if (newQuantity <= 0) {
            removeFromCart(item)
            return
        }
        
        val currentCart = _uiState.value.cartItems.toMutableList()
        val updatedItem = item.copy(
            quantity = newQuantity,
            totalPrice = newQuantity * item.unitPrice
        )
        val index = currentCart.indexOf(item)
        currentCart[index] = updatedItem
        
        updateCart(currentCart)
    }
    
    fun removeFromCart(item: OrderItem) {
        val currentCart = _uiState.value.cartItems.toMutableList()
        currentCart.remove(item)
        updateCart(currentCart)
    }
    
    private fun updateCart(cartItems: List<OrderItem>) {
        val subtotal = cartItems.sumOf { it.totalPrice }
        val tax = subtotal * 0.1 // 10% tax
        val total = subtotal + tax
        
        _uiState.value = _uiState.value.copy(
            cartItems = cartItems,
            subtotal = subtotal,
            tax = tax,
            total = total
        )
    }
    
    fun processOrder() {
        viewModelScope.launch {
            val cartItems = _uiState.value.cartItems
            if (cartItems.isEmpty()) return@launch
            
            val order = Order(
                orderNumber = generateOrderNumber(),
                items = cartItems,
                subtotal = _uiState.value.subtotal,
                tax = _uiState.value.tax,
                total = _uiState.value.total,
                paymentMethod = com.beloop.pos.data.model.PaymentMethod.CASH,
                paymentStatus = com.beloop.pos.data.model.PaymentStatus.COMPLETED,
                orderStatus = com.beloop.pos.data.model.OrderStatus.COMPLETED,
                cashierId = 1 // TODO: Get from current user
            )
            
            try {
                // Save order to database
                orderRepository.insertOrder(order)
                
                // Print receipt
                val template = com.beloop.pos.data.model.ReceiptTemplate(
                    header = "BELOOP POS",
                    subHeader = "Premium Restaurant",
                    address = "123 Main Street",
                    phone = "555-0123",
                    footer = "Thank you for your business!"
                )
                
                printerService.printReceipt(order, template)
                
                // Clear cart
                _uiState.value = _uiState.value.copy(
                    cartItems = emptyList(),
                    subtotal = 0.0,
                    tax = 0.0,
                    total = 0.0
                )
                
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
    
    private fun generateOrderNumber(): String {
        return "ORD-${System.currentTimeMillis()}"
    }
}

data class POSUiState(
    val products: List<Product> = emptyList(),
    val categories: List<String> = emptyList(),
    val selectedCategory: String? = null,
    val searchQuery: String = "",
    val cartItems: List<OrderItem> = emptyList(),
    val subtotal: Double = 0.0,
    val tax: Double = 0.0,
    val total: Double = 0.0
)
