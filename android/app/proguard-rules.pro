# ProGuard Rules for Industrial Metal Detector & Stud Finder

# Keep Jetpack Compose & Material 3
-keep class androidx.compose.** { *; }
-dontwarn androidx.compose.**

# Keep SensorEventListener and Android Hardware interfaces
-keepclassmembers class * implements android.hardware.SensorEventListener {
    public void onSensorChanged(android.hardware.SensorEvent);
    public void onAccuracyChanged(android.hardware.Sensor, int);
}

# Keep Kotlin Coroutines & ViewModel
-keepattributes *Annotation*,InnerClasses,EnclosingMethod
-keepclassmembers enum * { *; }
