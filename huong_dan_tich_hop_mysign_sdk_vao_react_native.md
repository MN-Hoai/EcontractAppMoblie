# 📘 Hướng dẫn tích hợp Mysign SDK (APK/AAR) vào React Native

## 1. Tổng quan
Mysign SDK là SDK native (Android/iOS), **không thể dùng trực tiếp trong React Native**.

➡️ Cách làm đúng:
- Tích hợp SDK vào **Android native**
- Tạo **Native Module** để bridge sang React Native

---

## 2. Yêu cầu

- React Native CLI (không dùng Expo Managed)
- Android Studio
- File SDK (.aar hoặc .jar) từ Viettel

---

## 3. Thêm SDK vào Android

### 3.1 Copy SDK

Copy file `.aar` vào:

```
android/app/libs/
```

---

### 3.2 Cấu hình build.gradle

File: `android/app/build.gradle`

```gradle
dependencies {
    implementation fileTree(dir: "libs", include: ["*.jar", "*.aar"])
}
```

---

## 4. Khởi tạo SDK

### 4.1 Sửa MainApplication.java

File:
```
android/app/src/main/java/.../MainApplication.java
```

```java
import vn.viettel.mysign.sdk.CloudCASDK;

@Override
public void onCreate() {
    super.onCreate();

    CloudCASDK.init(this);
}
```

---

## 5. Cấp quyền Android

File: `AndroidManifest.xml`

```xml
<uses-permission android:name="android.permission.INTERNET"/>
```

Nếu dùng sinh trắc học:

```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC"/>
```

---

## 6. Tạo Native Module

### 6.1 Tạo file MySignModule.java

```java
package com.yourapp;

import com.facebook.react.bridge.*;
import vn.viettel.mysign.sdk.CloudCASDK;

public class MySignModule extends ReactContextBaseJavaModule {

    public MySignModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "MySignModule";
    }

    @ReactMethod
    public void registerDevice(String token, Promise promise) {
        try {
            CloudCASDK.registerDevice(token, new Callback() {
                @Override
                public void onSuccess() {
                    promise.resolve("SUCCESS");
                }

                @Override
                public void onError(String error) {
                    promise.reject("ERROR", error);
                }
            });
        } catch (Exception e) {
            promise.reject("EXCEPTION", e);
        }
    }
}
```

---

### 6.2 Tạo Package

```java
package com.yourapp;

import com.facebook.react.*;
import com.facebook.react.bridge.*;
import java.util.*;

public class MySignPackage implements ReactPackage {

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        return Arrays.<NativeModule>asList(new MySignModule(reactContext));
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
```

---

### 6.3 Đăng ký Module

Trong `MainApplication.java`

```java
@Override
protected List<ReactPackage> getPackages() {
    List<ReactPackage> packages = new PackageList(this).getPackages();
    packages.add(new MySignPackage());
    return packages;
}
```

---

## 7. Gọi từ React Native

```javascript
import { NativeModules } from 'react-native';

const { MySignModule } = NativeModules;

export const registerDevice = async (token) => {
  try {
    const res = await MySignModule.registerDevice(token);
    console.log('SUCCESS:', res);
  } catch (err) {
    console.log('ERROR:', err);
  }
};
```

---

## 8. Flow tích hợp đầy đủ

### Backend:
1. Login → lấy access_token
2. CertificateInfo → lấy credential_id
3. SignHash → gửi yêu cầu ký

### Mobile (React Native + SDK):
1. registerDevice
2. nhận yêu cầu ký
3. user xác thực (OTP / biometrics)

### Backend:
4. nhận signature

---

## 9. Lưu ý quan trọng

### ❌ Không dùng Expo Managed
➡️ Phải dùng:
- React Native CLI
- hoặc Expo Bare

---

### ❌ Không gọi SDK trực tiếp từ JS
➡️ Phải dùng Native Module

---

### ❌ Lỗi thường gặp

| Lỗi | Nguyên nhân |
|-----|------------|
| SDK không load | chưa add .aar |
| Không gọi được | chưa bridge |
| SSL error | cert server |
| Device expired | phải register lại |

---

## 10. Kiến trúc tổng thể

```
React Native
   ↓
Native Module
   ↓
Mysign SDK
   ↓
Mysign Server
   ↑
Backend
```

---

## 11. Kết luận

Để tích hợp Mysign SDK vào React Native:

1. Thêm SDK vào Android
2. Init SDK
3. Tạo Native Module
4. Bridge sang JS
5. Gọi từ React Native

---

## 12. Nâng cao (khuyến nghị)

- Viết wrapper TypeScript
- Xử lý deeplink callback
- Quản lý token lifecycle
- Logging SDK

---

📌 Nếu cần, có thể mở rộng thêm:
- Full module hoàn chỉnh
- Demo app
- Tích hợp iOS

