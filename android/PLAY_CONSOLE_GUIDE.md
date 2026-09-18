# Google Play Console Publishing Guide
## Industrial Metal Detector & Stud Finder (`com.industrial.metaldetector`)

This guide walks you through building the release-ready **Android App Bundle (`.aab`)** and publishing it to the **Google Play Console**.

---

### Prerequisites
1. **Google Play Developer Account**: Registered at [play.google.com/console](https://play.google.com/console) ($25 one-time registration).
2. **Android Studio** (Hedgehog, Iguana, Jellyfish, or newer) with Java 17+ and Android SDK 35 installed.

---

### Step 1: Generate your Upload Keystore

Run this command in your terminal (inside the project root directory):

```bash
keytool -genkey -v -keystore release.keystore -alias metaldetector -keyalg RSA -keysize 2048 -validity 10000
```

> **Important**: Store `release.keystore` and its passwords in a secure location. You will need this key to sign updates to your app.

---

### Step 2: Build the Signed Android App Bundle (`.aab`)

Google Play Console requires an `.aab` (Android App Bundle), not an `.apk`.

#### Option A: Using the Terminal
```bash
# Set your keystore credentials as environment variables (optional if using defaults)
export KEYSTORE_PASSWORD="your_password"
export KEY_ALIAS="metaldetector"
export KEY_PASSWORD="your_password"

# Build the release bundle
./gradlew bundleRelease
```

The output bundle will be generated at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

#### Option B: Using Android Studio GUI
1. Open the `android/` directory in **Android Studio**.
2. Go to **Build > Generate Signed Bundle / APK...**
3. Select **Android App Bundle** and click **Next**.
4. Choose your `release.keystore`, enter alias & passwords, and click **Next**.
5. Select destination folder and build variant **release**, then click **Create**.

---

### Step 3: Google Play Console Submission Steps

1. Log into [Google Play Console](https://play.google.com/console).
2. Click **Create app**:
   - **App name**: `Metal Detector & Stud Finder`
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free
   - Accept the Developer Program Policies and US export laws.
3. Complete the **Set up your app** tasks:
   - **App access**: All functionality is available without special access.
   - **Ads**: No, my app does not contain ads.
   - **Content rating**: Complete questionnaire (Utility / Tool category - Rating: Everyone).
   - **Target audience**: 18 and over / General audience.
   - **Data safety**:
     - *Does your app collect or share any user data?* Select **No**.
     - *Why*: The application is 100% offline, operates purely on device hardware sensors (`Sensor.TYPE_MAGNETIC_FIELD`), requires zero network access, and stores zero personal data.
   - **Government apps**: No.
   - **Financial features**: No.
4. **Main store listing**:
   - **Short description** (max 80 chars):
     `Industrial magnetic flux meter and ferrous stud finder with 50Hz dial gauge.`
   - **Full description**:
     ```text
     Industrial Metal Detector & Stud Finder turns your Android smartphone into a precision electromagnetic field (EMF) meter and magnetic stud locator.

     FEATURES:
     • Precision 270° Industrial Analog Dial Gauge
     • Real-time combined magnetic flux density: ||B|| = √(x² + y² + z²) in microteslas (µT)
     • Instant 70 µT metal detection alert threshold
     • Real-time wall stud locator with proximity target lock
     • 50Hz high-frequency sensor sampling (Sensor.TYPE_MAGNETIC_FIELD)
     • Low-latency audible alert tone & waveform haptic vibrations
     • Ambient background calibration (Tare / Zero offset)
     • 100% offline & private: Zero accounts, zero ads, zero internet permissions required.
     ```
5. **Upload the Bundle**:
   - Navigate to **Production** (or **Testing > Internal testing**).
   - Click **Create new release**.
   - Upload `app-release.aab`.
   - Enter Release name (e.g. `1.0.0 (1)`) and release notes.
   - Click **Next**, review the pre-launch report, and click **Start rollout to Production**!
