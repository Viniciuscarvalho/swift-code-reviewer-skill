# Security & Safety Checklist

This checklist covers security concerns for Swift and iOS/macOS development, including input validation, sensitive data handling, keychain usage, network security, and permission handling.

---

## 1. Force Unwrap Detection

### 1.1 Force Unwrap Operators

**Check for:**
- [ ] No `!` force unwrapping
- [ ] No `as!` forced casting
- [ ] No `try!` forced try
- [ ] Justified exceptions with comments

**Examples:**

❌ **Bad: Force unwrapping**
```swift
let user = userRepository.currentUser!  // ❌ Can crash
let name = user.name!  // ❌ Can crash
let data = try! loadData()  // ❌ Can crash
let view = subview as! CustomView  // ❌ Can crash
```

✅ **Good: Safe unwrapping**
```swift
guard let user = userRepository.currentUser else {
    logger.error("No current user found")
    return
}

let name = user.name ?? "Unknown"  // ✅ Safe with default

do {
    let data = try loadData()  // ✅ Proper error handling
} catch {
    logger.error("Failed to load data: \(error)")
}

guard let customView = subview as? CustomView else {  // ✅ Safe casting
    logger.warning("Subview is not CustomView")
    return
}
```

✅ **Acceptable: Force unwrap with justification**
```swift
// Static JSON bundled with app - guaranteed to exist
let defaultConfig = try! JSONDecoder().decode(
    Config.self,
    from: bundledJSONData
)  // Force unwrap justified: bundled resource validated at build time
```

### 1.2 Implicitly Unwrapped Optionals

**Check for:**
- [ ] Minimal use of `!` declarations
- [ ] Only use for IBOutlets or guaranteed initialization
- [ ] Comments explaining necessity

**Examples:**

❌ **Bad: Unnecessary IUO**
```swift
class ViewModel {
    var authService: AuthService!  // ❌ Why IUO?
    var database: Database!  // ❌ Why IUO?
}
```

✅ **Good: Proper initialization**
```swift
class ViewModel {
    let authService: AuthService  // ✅ Required in init
    let database: Database

    init(authService: AuthService, database: Database) {
        self.authService = authService
        self.database = database
    }
}
```

✅ **Acceptable: IBOutlet**
```swift
class LoginViewController: UIViewController {
    @IBOutlet weak var emailTextField: UITextField!  // ✅ Acceptable for Interface Builder
    @IBOutlet weak var passwordTextField: UITextField!
}
```

---

## 2. Input Validation

### 2.1 User Input Sanitization

**Check for:**
- [ ] All user input validated before use
- [ ] Email, phone number, URL validation
- [ ] Length limits enforced
- [ ] Character set validation

**Examples:**

❌ **Bad: No validation**
```swift
func login(email: String, password: String) async throws {
    // ❌ No validation - what if email is empty or invalid?
    let user = try await authService.login(email: email, password: password)
}
```

✅ **Good: Input validation**
```swift
func login(email: String, password: String) async throws {
    // Validate email format
    guard isValid(email: email) else {
        throw LoginError.invalidEmail
    }

    // Validate password length
    guard password.count >= 8 else {
        throw LoginError.passwordTooShort
    }

    let user = try await authService.login(email: email, password: password)
}

private func isValid(email: String) -> Bool {
    let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}"
    let predicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
    return predicate.evaluate(with: email)
}
```

### 2.2 Boundary Checking

**Check for:**
- [ ] Array bounds checking
- [ ] Range validation
- [ ] Numeric input limits

**Examples:**

❌ **Bad: No bounds checking**
```swift
func deleteItem(at index: Int) {
    items.remove(at: index)  // ❌ Can crash if index out of bounds
}
```

✅ **Good: Bounds checking**
```swift
func deleteItem(at index: Int) {
    guard items.indices.contains(index) else {
        logger.error("Invalid index: \(index)")
        return
    }
    items.remove(at: index)  // ✅ Safe
}
```

✅ **Good: Safe collection access**
```swift
extension Collection {
    subscript(safe index: Index) -> Element? {
        return indices.contains(index) ? self[index] : nil
    }
}

// Usage
if let item = items[safe: index] {
    // Use item safely
}
```

### 2.3 SQL Injection Prevention

**Check for:**
- [ ] Parameterized queries (no string interpolation)
- [ ] ORM or query builder usage
- [ ] No direct SQL with user input

**Examples:**

❌ **Bad: SQL injection vulnerability**
```swift
let query = "SELECT * FROM users WHERE email = '\(userEmail)'"  // ❌ SQL injection!
database.execute(query)
```

✅ **Good: Parameterized query**
```swift
let query = "SELECT * FROM users WHERE email = ?"
database.execute(query, parameters: [userEmail])  // ✅ Safe
```

✅ **Good: ORM usage**
```swift
let users = try await database.users
    .filter(\.email == userEmail)  // ✅ Type-safe, no injection
    .all()
```

### 2.4 XSS Prevention (WebView)

**Check for:**
- [ ] No user input directly in HTML/JavaScript
- [ ] Proper escaping for web content
- [ ] Content Security Policy

**Examples:**

❌ **Bad: XSS vulnerability**
```swift
let html = """
<html>
    <body>
        <p>Hello, \(userName)</p>  // ❌ XSS if userName contains script tags
    </body>
</html>
"""
webView.loadHTMLString(html, baseURL: nil)
```

✅ **Good: Escaped user input**
```swift
let escapedName = userName
    .replacingOccurrences(of: "<", with: "&lt;")
    .replacingOccurrences(of: ">", with: "&gt;")
    .replacingOccurrences(of: "&", with: "&amp;")

let html = """
<html>
    <body>
        <p>Hello, \(escapedName)</p>  // ✅ Escaped
    </body>
</html>
"""
webView.loadHTMLString(html, baseURL: nil)
```

---

## 3. Sensitive Data Handling

### 3.1 Keychain for Credentials

**Check for:**
- [ ] Passwords stored in Keychain, not UserDefaults
- [ ] API tokens stored in Keychain
- [ ] Biometric authentication for sensitive data
- [ ] Proper keychain access control

**Examples:**

❌ **Bad: Password in UserDefaults**
```swift
UserDefaults.standard.set(password, forKey: "user_password")  // ❌ Insecure!
```

❌ **Bad: Token in UserDefaults**
```swift
UserDefaults.standard.set(apiToken, forKey: "api_token")  // ❌ Insecure!
```

✅ **Good: Keychain storage**
```swift
import Security

final class KeychainService {
    static let shared = KeychainService()

    func save(_ data: Data, forKey key: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]

        SecItemDelete(query as CFDictionary)  // Delete existing

        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw KeychainError.saveFailed(status)
        }
    }

    func retrieve(forKey key: String) throws -> Data {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess, let data = result as? Data else {
            throw KeychainError.retrieveFailed(status)
        }

        return data
    }

    func delete(forKey key: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key
        ]

        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw KeychainError.deleteFailed(status)
        }
    }
}

// Usage
let passwordData = password.data(using: .utf8)!
try KeychainService.shared.save(passwordData, forKey: "user_password")  // ✅ Secure
```

### 3.2 Biometric Authentication

**Check for:**
- [ ] Face ID / Touch ID for sensitive operations
- [ ] Fallback to passcode
- [ ] Proper error handling

**Examples:**

✅ **Good: Biometric authentication**
```swift
import LocalAuthentication

func authenticateUser() async throws {
    let context = LAContext()
    var error: NSError?

    guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
        throw AuthError.biometricsNotAvailable
    }

    let reason = "Authenticate to access your account"

    do {
        let success = try await context.evaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            localizedReason: reason
        )

        if success {
            // Proceed with sensitive operation
        }
    } catch {
        throw AuthError.authenticationFailed(error)
    }
}
```

### 3.3 Logging Safety

**Check for:**
- [ ] No passwords in logs
- [ ] No API tokens in logs
- [ ] No personally identifiable information (PII) in logs
- [ ] Sanitized error messages

**Examples:**

❌ **Bad: Logging sensitive data**
```swift
logger.debug("User password: \(password)")  // ❌ Password in logs!
logger.info("API token: \(apiToken)")  // ❌ Token in logs!
logger.error("Failed to login user \(email)")  // ❌ PII in logs
```

✅ **Good: Safe logging**
```swift
logger.debug("User authentication attempt")  // ✅ No sensitive data
logger.info("API token validated successfully")  // ✅ No actual token
logger.error("Failed to login user ID: \(userID)")  // ✅ ID, not email
```

✅ **Good: Sanitized error logging**
```swift
do {
    try await loginUser(email: email, password: password)
} catch {
    // Log error type, not sensitive details
    logger.error("Login failed: \(type(of: error))")  // ✅ Safe
}
```

---

## 4. Network Security

### 4.1 HTTPS Only

**Check for:**
- [ ] All network requests use HTTPS
- [ ] No HTTP in production
- [ ] App Transport Security (ATS) enabled
- [ ] No ATS exceptions without justification

**Examples:**

❌ **Bad: HTTP in production**
```swift
let url = URL(string: "http://api.example.com/users")!  // ❌ Insecure HTTP
```

✅ **Good: HTTPS**
```swift
let url = URL(string: "https://api.example.com/users")!  // ✅ Secure HTTPS
```

**Info.plist Configuration:**
```xml
<!-- ❌ Bad: Disabling ATS globally -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>

<!-- ✅ Good: ATS enabled (default) -->
<!-- No NSAppTransportSecurity key or specific exceptions only -->

<!-- ✅ Acceptable: Specific exception with justification -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSExceptionDomains</key>
    <dict>
        <key>legacy-api.example.com</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
            <!-- Only for legacy API that cannot be upgraded -->
        </dict>
    </dict>
</dict>
```

### 4.2 Certificate Pinning

**Check for:**
- [ ] Certificate pinning for critical APIs
- [ ] Public key pinning as alternative
- [ ] Proper error handling for pinning failures

**Examples:**

✅ **Good: Certificate pinning with URLSession**
```swift
final class NetworkService: NSObject, URLSessionDelegate {
    private lazy var session: URLSession = {
        URLSession(configuration: .default, delegate: self, delegateQueue: nil)
    }()

    func urlSession(
        _ session: URLSession,
        didReceive challenge: URLAuthenticationChallenge,
        completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void
    ) {
        guard let serverTrust = challenge.protectionSpace.serverTrust else {
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }

        // Certificate pinning logic
        let pinnedCertificates = loadPinnedCertificates()

        if verifyCertificate(serverTrust, against: pinnedCertificates) {
            let credential = URLCredential(trust: serverTrust)
            completionHandler(.useCredential, credential)
        } else {
            completionHandler(.cancelAuthenticationChallenge, nil)
        }
    }

    private func loadPinnedCertificates() -> [SecCertificate] {
        // Load certificates from bundle
        []
    }

    private func verifyCertificate(_ trust: SecTrust, against pinnedCertificates: [SecCertificate]) -> Bool {
        // Certificate validation logic
        true
    }
}
```

### 4.3 API Key Protection

**Check for:**
- [ ] No hardcoded API keys in code
- [ ] API keys in environment variables or secure config
- [ ] Keys not committed to version control
- [ ] Different keys for dev/staging/production

**Examples:**

❌ **Bad: Hardcoded API key**
```swift
let apiKey = "sk_live_1234567890abcdef"  // ❌ Hardcoded, in version control
```

✅ **Good: Environment-based configuration**
```swift
// Config.swift (not in version control)
struct APIConfig {
    static let apiKey = ProcessInfo.processInfo.environment["API_KEY"] ?? ""
}

// Or load from plist not in version control
struct APIConfig {
    static let apiKey: String = {
        guard let path = Bundle.main.path(forResource: "Secrets", ofType: "plist"),
              let dict = NSDictionary(contentsOfFile: path),
              let key = dict["APIKey"] as? String else {
            fatalError("API key not configured")
        }
        return key
    }()
}

// .gitignore includes:
// Secrets.plist
// *.xcconfig (if using build configuration)
```

---

## 5. Permission Handling

### 5.1 Privacy Descriptions

**Check for:**
- [ ] All permission requests have usage descriptions in Info.plist
- [ ] Clear, user-friendly descriptions
- [ ] Descriptions explain why permission is needed

**Examples:**

✅ **Good: Info.plist privacy descriptions**
```xml
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to take profile photos</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs photo library access to select profile photos</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs your location to show nearby restaurants</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This app needs your location in the background to provide location-based reminders</string>

<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access to record voice notes</string>

<key>NSContactsUsageDescription</key>
<string>This app needs contacts access to help you find friends</string>
```

### 5.2 Permission Request Timing

**Check for:**
- [ ] Permissions requested when needed (not on app launch)
- [ ] Context provided before permission request
- [ ] Graceful handling of denied permissions

**Examples:**

❌ **Bad: Request on launch**
```swift
struct ContentView: View {
    var body: some View {
        Text("Hello")
            .onAppear {
                requestCameraPermission()  // ❌ No context, user confused
            }
    }
}
```

✅ **Good: Request when needed with context**
```swift
struct ProfileView: View {
    @State private var showingPermissionExplanation = false

    var body: some View {
        VStack {
            Button("Take Photo") {
                showingPermissionExplanation = true
            }
        }
        .alert("Camera Access Needed", isPresented: $showingPermissionExplanation) {
            Button("Grant Access") {
                requestCameraPermission()  // ✅ User understands why
            }
            Button("Cancel", role: .cancel) { }
        } message: {
            Text("We need camera access to take your profile photo")
        }
    }

    private func requestCameraPermission() {
        // Request permission
    }
}
```

### 5.3 Permission Status Checking

**Check for:**
- [ ] Check permission status before use
- [ ] Handle all permission states (authorized, denied, not determined)
- [ ] Provide alternative flows for denied permissions

**Examples:**

✅ **Good: Permission status checking**
```swift
import AVFoundation

func takePcture() async {
    let status = AVCaptureDevice.authorizationStatus(for: .video)

    switch status {
    case .authorized:
        // Proceed with camera
        openCamera()

    case .notDetermined:
        // Request permission
        let granted = await AVCaptureDevice.requestAccess(for: .video)
        if granted {
            openCamera()
        } else {
            showPermissionDeniedAlert()
        }

    case .denied, .restricted:
        // Show alert with instructions to enable in Settings
        showPermissionDeniedAlert()

    @unknown default:
        showPermissionDeniedAlert()
    }
}

private func showPermissionDeniedAlert() {
    // Show alert with link to Settings
}
```

---

## 6. Data Protection

### 6.1 File Encryption

**Check for:**
- [ ] Sensitive files encrypted at rest
- [ ] Proper file protection attributes
- [ ] No sensitive data in temporary directories

**Examples:**

✅ **Good: File protection**
```swift
func saveSensitiveData(_ data: Data, to url: URL) throws {
    try data.write(to: url, options: [.completeFileProtection])  // ✅ Encrypted

    // Or set protection attribute
    try FileManager.default.setAttributes(
        [.protectionKey: FileProtectionType.complete],
        ofItemAtPath: url.path
    )
}
```

❌ **Bad: Sensitive data in temporary directory**
```swift
let tempURL = FileManager.default.temporaryDirectory
    .appendingPathComponent("user_data.json")  // ❌ Temp directory not protected
try sensitiveData.write(to: tempURL)
```

✅ **Good: Sensitive data in protected directory**
```swift
let documentsURL = FileManager.default.urls(
    for: .documentDirectory,
    in: .userDomainMask
).first!
let secureURL = documentsURL.appendingPathComponent("user_data.json")

try sensitiveData.write(to: secureURL, options: [.completeFileProtection])  // ✅ Protected
```

### 6.2 Memory Zeroing

**Check for:**
- [ ] Sensitive data zeroed from memory when no longer needed
- [ ] Secure string handling for passwords

**Examples:**

✅ **Good: Memory zeroing**
```swift
func processPassword(_ password: String) {
    var passwordData = Data(password.utf8)
    defer {
        passwordData.resetBytes(in: 0..<passwordData.count)  // ✅ Zero memory
    }

    // Process password
}
```

---

## Quick Security Checklist

### Critical (Must Fix)
- [ ] No force unwraps that can crash with invalid data
- [ ] Passwords and tokens stored in Keychain only
- [ ] HTTPS for all network requests
- [ ] No sensitive data logged
- [ ] Input validation for all user input

### High Priority
- [ ] Permission descriptions in Info.plist
- [ ] Biometric authentication for sensitive operations
- [ ] Certificate pinning for critical APIs
- [ ] No API keys in code or version control
- [ ] SQL injection prevention

### Medium Priority
- [ ] Graceful permission handling
- [ ] File encryption for sensitive data
- [ ] XSS prevention in WebViews
- [ ] Bounds checking for array access
- [ ] Safe optional unwrapping

### Low Priority
- [ ] Memory zeroing for passwords
- [ ] Sanitized error messages
- [ ] Secure logging practices

---

## Common Security Vulnerabilities

### OWASP Mobile Top 10

1. **Improper Platform Usage**: Misuse of platform features or security controls
2. **Insecure Data Storage**: Sensitive data in UserDefaults, logs, or unencrypted files
3. **Insecure Communication**: HTTP instead of HTTPS, no certificate pinning
4. **Insecure Authentication**: Weak password policies, no biometric authentication
5. **Insufficient Cryptography**: Weak encryption algorithms, hardcoded keys
6. **Insecure Authorization**: Improper permission checks
7. **Client Code Quality**: Force unwraps, buffer overflows, memory corruption
8. **Code Tampering**: Lack of code obfuscation or jailbreak detection
9. **Reverse Engineering**: Lack of protection against reverse engineering
10. **Extraneous Functionality**: Debug code, backdoors in production

---

## Version
**Last Updated**: 2026-02-10
**Version**: 1.0.0
