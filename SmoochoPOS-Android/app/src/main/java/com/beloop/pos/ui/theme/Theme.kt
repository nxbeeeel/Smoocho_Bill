package com.beloop.pos.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = BeloopDarkPrimary,
    secondary = BeloopDarkSecondary,
    tertiary = BeloopSuccess,
    background = BeloopDarkBackground,
    surface = BeloopDarkSurface,
    onPrimary = BeloopDarkOnSurface,
    onSecondary = BeloopDarkOnSurface,
    onTertiary = BeloopDarkOnSurface,
    onBackground = BeloopDarkOnSurface,
    onSurface = BeloopDarkOnSurface,
    error = BeloopError
)

private val LightColorScheme = lightColorScheme(
    primary = BeloopPrimary,
    secondary = BeloopSecondary,
    tertiary = BeloopSuccess,
    background = BeloopBackground,
    surface = BeloopSurface,
    surfaceVariant = BeloopSurfaceVariant,
    onPrimary = BeloopBackground,
    onSecondary = BeloopBackground,
    onTertiary = BeloopBackground,
    onBackground = BeloopOnSurface,
    onSurface = BeloopOnSurface,
    onSurfaceVariant = BeloopOnSurfaceVariant,
    error = BeloopError,
    errorContainer = BeloopError.copy(alpha = 0.1f)
)

@Composable
fun BeloopPOSTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false, // Disabled to maintain brand colors
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }
    
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = BeloopTypography,
        content = content
    )
}
