package com.beloop.pos.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.beloop.pos.ui.screens.*

@Composable
fun BeloopNavigation(
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController()
) {
    NavHost(
        navController = navController,
        startDestination = "login",
        modifier = modifier
    ) {
        // Authentication
        composable("login") {
            LoginScreen(navController = navController)
        }
        
        // Main Dashboard
        composable("dashboard") {
            PremiumDashboardScreen(navController = navController)
        }
        
        // Core POS Features
        composable("pos") {
            AdvancedPOSScreen(navController = navController)
        }
        composable("menu-editor") {
            PremiumMenuEditorScreen(navController = navController)
        }
        composable("inventory") {
            PremiumInventoryScreen(navController = navController)
        }
        composable("order-history") {
            OrderHistoryScreen(navController = navController)
        }
        
        // Analytics & Reports
        composable("reports") {
            ReportsScreen(navController = navController)
        }
        
        // AI Assistant
        composable("ai") {
            AIAssistantScreen(navController = navController)
        }
        
        // Settings & Configuration
        composable("settings") {
            SettingsScreen(navController = navController)
        }
        composable("account") {
            AccountScreen(navController = navController)
        }
        composable("printer") {
            PrinterSettingsScreen(navController = navController)
        }
    }
}
