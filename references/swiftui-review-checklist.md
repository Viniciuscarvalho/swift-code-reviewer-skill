# SwiftUI Review Checklist

This checklist covers SwiftUI-specific patterns including state management, property wrappers, modern API usage, view composition, and accessibility. Use this to ensure SwiftUI code follows best practices and leverages modern APIs effectively.

---

## 1. State Management

### 1.1 @Observable (iOS 17+, macOS 14+)

**Check for:**
- [ ] @Observable used for view models and observable objects
- [ ] No mixing @Observable with @StateObject/@ObservedObject
- [ ] Proper state isolation

**Examples:**

❌ **Bad: Using old ObservableObject pattern**
```swift
class LoginViewModel: ObservableObject {  // ❌ Old pattern (iOS 17+)
    @Published var email: String = ""
    @Published var isLoading: Bool = false
}

struct LoginView: View {
    @StateObject private var viewModel = LoginViewModel()  // ❌ Old pattern
}
```

✅ **Good: Modern @Observable pattern**
```swift
@Observable
final class LoginViewModel {  // ✅ Modern pattern (iOS 17+)
    var email: String = ""
    var isLoading: Bool = false

    func login() async {
        isLoading = true
        // Login logic
        isLoading = false
    }
}

struct LoginView: View {
    let viewModel: LoginViewModel  // ✅ No property wrapper needed

    var body: some View {
        // Automatically observes viewModel changes
    }
}
```

✅ **Good: @Observable with MainActor**
```swift
@MainActor
@Observable
final class UserListViewModel {  // ✅ MainActor + Observable
    var users: [User] = []
    var isLoading: Bool = false

    func fetchUsers() async {
        // Always runs on main actor
    }
}
```

### 1.2 @State for View-Local State

**Check for:**
- [ ] @State used only for view-owned state
- [ ] Private @State properties
- [ ] No @State for passed data

**Examples:**

❌ **Bad: @State for passed data**
```swift
struct UserDetailView: View {
    @State var user: User  // ❌ User should be passed as let

    var body: some View {
        // ...
    }
}
```

✅ **Good: @State for view-local state**
```swift
struct UserDetailView: View {
    let user: User  // ✅ Passed data as let

    @State private var isExpanded: Bool = false  // ✅ View-local state
    @State private var selectedTab: Tab = .profile

    var body: some View {
        VStack {
            Button(isExpanded ? "Collapse" : "Expand") {
                isExpanded.toggle()  // ✅ Modifying view-local state
            }
        }
    }
}
```

### 1.3 @Binding for Two-Way Communication

**Check for:**
- [ ] @Binding used for child-to-parent communication
- [ ] Parent owns the state, child has @Binding
- [ ] No @Binding for read-only data

**Examples:**

❌ **Bad: Passing @State directly**
```swift
struct ParentView: View {
    @State private var text: String = ""

    var body: some View {
        ChildView(text: text)  // ❌ Child can't modify
    }
}

struct ChildView: View {
    let text: String
}
```

✅ **Good: Using @Binding for two-way communication**
```swift
struct ParentView: View {
    @State private var text: String = ""  // ✅ Parent owns state

    var body: some View {
        ChildView(text: $text)  // ✅ Pass binding with $
    }
}

struct ChildView: View {
    @Binding var text: String  // ✅ Child can read and write

    var body: some View {
        TextField("Enter text", text: $text)
    }
}
```

✅ **Good: Read-only without @Binding**
```swift
struct DisplayView: View {
    let text: String  // ✅ Read-only, no @Binding

    var body: some View {
        Text(text)
    }
}
```

### 1.4 @Environment for Dependency Injection

**Check for:**
- [ ] @Environment for cross-cutting concerns
- [ ] Custom environment values for dependencies
- [ ] No direct service access in views

**Examples:**

✅ **Good: Custom environment value**
```swift
// Define environment key
private struct AuthServiceKey: EnvironmentKey {
    static let defaultValue: AuthService = DefaultAuthService()
}

extension EnvironmentValues {
    var authService: AuthService {
        get { self[AuthServiceKey.self] }
        set { self[AuthServiceKey.self] = newValue }
    }
}

// Usage in view
struct LoginView: View {
    @Environment(\.authService) private var authService  // ✅ Injected dependency

    var body: some View {
        Button("Login") {
            Task {
                await authService.login(email: email, password: password)
            }
        }
    }
}

// Provide in app
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.authService, productionAuthService)  // ✅ Provide
        }
    }
}
```

✅ **Good: Built-in environment values**
```swift
struct ContentView: View {
    @Environment(\.dismiss) private var dismiss  // ✅ Dismissal
    @Environment(\.colorScheme) private var colorScheme  // ✅ Color scheme
    @Environment(\.horizontalSizeClass) private var sizeClass  // ✅ Size class

    var body: some View {
        Button("Close") {
            dismiss()  // ✅ Use environment value
        }
    }
}
```

### 1.5 State Ownership Rules

**Check for:**
- [ ] Single source of truth
- [ ] Clear state ownership
- [ ] No duplicate state
- [ ] Derived state computed, not stored

**Examples:**

❌ **Bad: Duplicate state**
```swift
@Observable
final class UserViewModel {
    var users: [User] = []
    var userCount: Int = 0  // ❌ Duplicate - derived from users

    func addUser(_ user: User) {
        users.append(user)
        userCount = users.count  // ❌ Manual sync
    }
}
```

✅ **Good: Computed property**
```swift
@Observable
final class UserViewModel {
    var users: [User] = []

    var userCount: Int {  // ✅ Computed from users
        users.count
    }

    func addUser(_ user: User) {
        users.append(user)  // ✅ Single source of truth
    }
}
```

---

## 2. Property Wrapper Selection

### 2.1 Property Wrapper Decision Tree

**Use this decision tree:**

```
Is this UI-related mutable state?
├─ Yes → Is it owned by this view?
│  ├─ Yes → Use @State
│  └─ No → Is it a two-way binding from parent?
│     ├─ Yes → Use @Binding
│     └─ No → Is it an observable object?
│        ├─ Yes (iOS 17+) → Use @Observable class (no wrapper in view)
│        └─ Yes (iOS 16-) → Use @StateObject or @ObservedObject
├─ No → Is it environment data?
   ├─ Yes → Use @Environment
   └─ No → Use let (immutable property)
```

### 2.2 Property Wrapper Reference Table

| Wrapper | iOS Version | Use Case | Example |
|---------|-------------|----------|---------|
| `@State` | iOS 13+ | View-local mutable state | `@State private var isExpanded = false` |
| `@Binding` | iOS 13+ | Two-way binding from parent | `@Binding var text: String` |
| `@Observable` | iOS 17+ | Observable view model (class) | `@Observable final class ViewModel { }` |
| `@StateObject` | iOS 14+ | View owns observable object (legacy) | `@StateObject private var vm = VM()` |
| `@ObservedObject` | iOS 13+ | Parent owns observable object (legacy) | `@ObservedObject var vm: VM` |
| `@Environment` | iOS 13+ | Environment dependency injection | `@Environment(\.dismiss) var dismiss` |
| `@EnvironmentObject` | iOS 13+ | Shared observable across views | `@EnvironmentObject var settings: Settings` |
| `@AppStorage` | iOS 14+ | UserDefaults-backed property | `@AppStorage("theme") var theme = "light"` |
| `@SceneStorage` | iOS 14+ | Scene-specific state restoration | `@SceneStorage("selectedTab") var tab = 0` |
| `@FocusState` | iOS 15+ | Focus state for text fields | `@FocusState private var isFocused: Bool` |

### 2.3 Common Mistakes

**Check for:**
- [ ] No @StateObject with @Observable classes
- [ ] No @Published with @Observable classes
- [ ] No @State for objects (use @Observable instead)
- [ ] No @Binding for read-only data

**Examples:**

❌ **Bad: @StateObject with @Observable**
```swift
@Observable
final class ViewModel { }

struct MyView: View {
    @StateObject private var viewModel = ViewModel()  // ❌ Don't mix
}
```

✅ **Good: No wrapper with @Observable**
```swift
@Observable
final class ViewModel { }

struct MyView: View {
    let viewModel = ViewModel()  // ✅ No wrapper needed (iOS 17+)
}
```

❌ **Bad: @Published with @Observable**
```swift
@Observable
final class ViewModel {
    @Published var text: String = ""  // ❌ Don't mix
}
```

✅ **Good: Regular property with @Observable**
```swift
@Observable
final class ViewModel {
    var text: String = ""  // ✅ Automatically observable
}
```

---

## 3. Modern API Usage

### 3.1 NavigationStack vs NavigationView

**Check for:**
- [ ] NavigationStack used instead of NavigationView (iOS 16+)
- [ ] Proper navigation path management
- [ ] Type-safe navigation destinations

**Examples:**

❌ **Bad: Deprecated NavigationView**
```swift
NavigationView {  // ❌ Deprecated in iOS 16
    List(items) { item in
        NavigationLink(destination: DetailView(item: item)) {
            Text(item.name)
        }
    }
}
```

✅ **Good: NavigationStack**
```swift
NavigationStack {  // ✅ Modern (iOS 16+)
    List(items) { item in
        NavigationLink(value: item) {  // ✅ Value-based
            Text(item.name)
        }
    }
    .navigationDestination(for: Item.self) { item in
        DetailView(item: item)
    }
}
```

✅ **Good: NavigationStack with path**
```swift
@Observable
final class NavigationModel {
    var path = NavigationPath()

    func navigateToDetail(_ item: Item) {
        path.append(item)
    }
}

struct ContentView: View {
    @State private var navModel = NavigationModel()

    var body: some View {
        NavigationStack(path: $navModel.path) {  // ✅ Programmatic navigation
            // Content
        }
    }
}
```

### 3.2 .task vs .onAppear for Async Work

**Check for:**
- [ ] .task modifier for async work instead of .onAppear
- [ ] Automatic cancellation handling with .task
- [ ] No manual Task creation in .onAppear

**Examples:**

❌ **Bad: .onAppear with manual Task**
```swift
.onAppear {
    Task {  // ❌ Manual task, no automatic cancellation
        await viewModel.load()
    }
}
```

✅ **Good: .task modifier**
```swift
.task {  // ✅ Automatically cancelled when view disappears
    await viewModel.load()
}
```

✅ **Good: .task with id for refresh**
```swift
.task(id: selectedCategory) {  // ✅ Runs again when id changes
    await viewModel.load(category: selectedCategory)
}
```

### 3.3 .onChange with Modern Syntax (iOS 17+)

**Check for:**
- [ ] Modern .onChange syntax (iOS 17+)
- [ ] Access to both old and new values
- [ ] No deprecated .onChange(of:perform:)

**Examples:**

❌ **Bad: Old .onChange syntax**
```swift
.onChange(of: searchText) { newValue in  // ❌ Old syntax
    performSearch(newValue)
}
```

✅ **Good: Modern .onChange syntax**
```swift
.onChange(of: searchText) { oldValue, newValue in  // ✅ New syntax (iOS 17+)
    performSearch(newValue)
}
```

✅ **Good: Modern .onChange with initial value**
```swift
.onChange(of: searchText, initial: true) { oldValue, newValue in  // ✅ Runs on appear
    performSearch(newValue)
}
```

### 3.4 Deprecated APIs to Replace

**Check for and replace:**

| Deprecated API | Modern Replacement | iOS Version |
|----------------|-------------------|-------------|
| `NavigationView` | `NavigationStack` | iOS 16+ |
| `.onAppear { Task { } }` | `.task { }` | iOS 15+ |
| `.onChange(of:perform:)` | `.onChange(of:) { old, new in }` | iOS 17+ |
| `@StateObject` with `ObservableObject` | `@Observable` class | iOS 17+ |
| `@Published` | Regular property with `@Observable` | iOS 17+ |
| `GeometryReader` (simple cases) | `.frame(maxWidth: .infinity)` | iOS 13+ |
| `List { ... }` with explicit ForEach | `List(items) { }` | iOS 13+ |

---

## 4. View Composition

### 4.1 View Extraction Guidelines

**Check for:**
- [ ] View body < 50 lines (guideline)
- [ ] Logical subviews extracted
- [ ] Reusable components identified
- [ ] Proper view hierarchy depth (< 5 levels)

**Examples:**

❌ **Bad: Monolithic view**
```swift
struct LoginView: View {
    var body: some View {
        VStack(spacing: 20) {
            Image("logo")
                .resizable()
                .frame(width: 100, height: 100)
            Text("Welcome")
                .font(.title)
            TextField("Email", text: $email)
                .textFieldStyle(.roundedBorder)
            SecureField("Password", text: $password)
                .textFieldStyle(.roundedBorder)
            Button("Login") {
                login()
            }
            .buttonStyle(.borderedProminent)
            // ... 50 more lines
        }  // ❌ Too long, no extraction
    }
}
```

✅ **Good: Extracted subviews**
```swift
struct LoginView: View {
    var body: some View {
        VStack(spacing: 20) {
            LoginHeaderView()  // ✅ Extracted
            LoginFormView(
                email: $email,
                password: $password
            )  // ✅ Extracted
            LoginActionsView(
                onLogin: login
            )  // ✅ Extracted
        }
    }
}

// MARK: - Subviews
private struct LoginHeaderView: View {
    var body: some View {
        VStack {
            Image("logo")
                .resizable()
                .frame(width: 100, height: 100)
            Text("Welcome")
                .font(.title)
        }
    }
}

private struct LoginFormView: View {
    @Binding var email: String
    @Binding var password: String

    var body: some View {
        VStack(spacing: 12) {
            TextField("Email", text: $email)
                .textFieldStyle(.roundedBorder)
            SecureField("Password", text: $password)
                .textFieldStyle(.roundedBorder)
        }
    }
}
```

### 4.2 When to Extract

**Extract when:**
- View body > 50 lines
- Logic is reused in multiple places
- Clear semantic boundary (header, form, footer)
- Testing would benefit from isolation
- View hierarchy becomes too deep

**Don't extract when:**
- View is small and simple (< 20 lines)
- Only used once and tightly coupled
- Extraction adds unnecessary complexity

### 4.3 ViewBuilder Patterns

**Check for:**
- [ ] @ViewBuilder for conditional view logic
- [ ] @ViewBuilder for custom container views
- [ ] Proper use of view builder syntax

**Examples:**

✅ **Good: @ViewBuilder for conditional content**
```swift
struct ConditionalView<Content: View>: View {
    let showHeader: Bool
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack {
            if showHeader {
                HeaderView()
            }
            content()
        }
    }
}

// Usage
ConditionalView(showHeader: true) {
    Text("Content")
    Button("Action") { }
}
```

✅ **Good: @ViewBuilder for custom container**
```swift
struct Card<Content: View>: View {
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            content()
        }
        .padding()
        .background(Color.white)
        .cornerRadius(8)
        .shadow(radius: 2)
    }
}

// Usage
Card {
    Text("Title")
    Text("Subtitle")
    Button("Action") { }
}
```

---

## 5. Accessibility

### 5.1 Accessibility Labels

**Check for:**
- [ ] Accessibility labels for non-text elements
- [ ] Descriptive labels (not just button text)
- [ ] Labels for images and icons

**Examples:**

❌ **Bad: No accessibility labels**
```swift
Image(systemName: "trash")  // ❌ No label
    .onTapGesture {
        deleteItem()
    }
```

✅ **Good: Accessibility labels**
```swift
Image(systemName: "trash")
    .onTapGesture {
        deleteItem()
    }
    .accessibilityLabel("Delete item")  // ✅ Clear label
```

✅ **Good: Accessibility for complex views**
```swift
HStack {
    Image(systemName: "star.fill")
    Text("\(rating)")
}
.accessibilityElement(children: .combine)  // ✅ Combine children
.accessibilityLabel("Rating: \(rating) stars")  // ✅ Clear description
```

### 5.2 Accessibility Hints

**Check for:**
- [ ] Hints for non-obvious interactions
- [ ] Clear, concise hints
- [ ] No redundant hints

**Examples:**

✅ **Good: Accessibility hints**
```swift
Button("Share") {
    shareContent()
}
.accessibilityLabel("Share")
.accessibilityHint("Opens the share sheet")  // ✅ Describes action
```

### 5.3 Accessibility Traits

**Check for:**
- [ ] Appropriate traits for elements
- [ ] Button trait for tappable elements
- [ ] Header trait for section headers

**Examples:**

✅ **Good: Accessibility traits**
```swift
Text("Settings")
    .font(.title)
    .accessibilityAddTraits(.isHeader)  // ✅ Mark as header

Image(systemName: "gear")
    .onTapGesture {
        openSettings()
    }
    .accessibilityAddTraits(.isButton)  // ✅ Mark as button
    .accessibilityLabel("Settings")
```

### 5.4 Dynamic Type Support

**Check for:**
- [ ] System fonts used (automatically scale)
- [ ] Custom fonts with .dynamicTypeSize
- [ ] Layout adapts to large text sizes

**Examples:**

✅ **Good: System fonts (automatic scaling)**
```swift
Text("Title")
    .font(.title)  // ✅ Automatically scales

Text("Body")
    .font(.body)  // ✅ Automatically scales
```

✅ **Good: Custom font with scaling**
```swift
Text("Custom")
    .font(.custom("CustomFont", size: 16, relativeTo: .body))  // ✅ Scales
```

✅ **Good: Layout adaptation**
```swift
@Environment(\.dynamicTypeSize) private var dynamicTypeSize

var body: some View {
    if dynamicTypeSize.isAccessibilitySize {
        VStack {  // ✅ Vertical for large text
            labelView
            valueView
        }
    } else {
        HStack {  // ✅ Horizontal for normal text
            labelView
            valueView
        }
    }
}
```

---

## 6. Performance Patterns

### 6.1 Equatable Conformance

**Check for:**
- [ ] View models conform to Equatable
- [ ] Proper equality implementation
- [ ] Reduced view updates

**Examples:**

✅ **Good: Equatable view model**
```swift
@Observable
final class UserViewModel: Equatable {  // ✅ Equatable
    let id: UUID
    var name: String
    var email: String

    static func == (lhs: UserViewModel, rhs: UserViewModel) -> Bool {
        lhs.id == rhs.id &&
        lhs.name == rhs.name &&
        lhs.email == rhs.email
    }
}

struct UserRow: View {
    let viewModel: UserViewModel

    var body: some View {
        HStack {
            Text(viewModel.name)
            Text(viewModel.email)
        }
    }
    .equatable()  // ✅ Only updates when viewModel changes
}
```

### 6.2 Avoid Heavy Work in Body

**Check for:**
- [ ] No computation in body property
- [ ] Computed properties for derived values
- [ ] View model handles complex logic

**Examples:**

❌ **Bad: Computation in body**
```swift
var body: some View {
    let sortedItems = items.sorted { $0.date > $1.date }  // ❌ Every render
    List(sortedItems) { item in
        ItemRow(item: item)
    }
}
```

✅ **Good: Computed property or view model**
```swift
@Observable
final class ItemListViewModel {
    var items: [Item] = []

    var sortedItems: [Item] {  // ✅ Computed property
        items.sorted { $0.date > $1.date }
    }
}

var body: some View {
    List(viewModel.sortedItems) { item in  // ✅ Uses cached result
        ItemRow(item: item)
    }
}
```

---

## 7. Preview Configurations

### 7.1 Preview Macros (iOS 17+)

**Check for:**
- [ ] #Preview macro used instead of PreviewProvider
- [ ] Multiple preview configurations
- [ ] Sample data for previews

**Examples:**

❌ **Bad: Old PreviewProvider**
```swift
struct LoginView_Previews: PreviewProvider {  // ❌ Old pattern
    static var previews: some View {
        LoginView()
    }
}
```

✅ **Good: Modern #Preview macro**
```swift
#Preview {  // ✅ Modern preview (iOS 17+)
    LoginView()
}

#Preview("Dark Mode") {  // ✅ Named preview
    LoginView()
        .preferredColorScheme(.dark)
}

#Preview("Large Text") {  // ✅ Accessibility preview
    LoginView()
        .environment(\.dynamicTypeSize, .xxxLarge)
}
```

---

## Quick Reference Checklist

### Critical Issues
- [ ] No @StateObject with @Observable classes (iOS 17+)
- [ ] No @Published with @Observable classes
- [ ] No heavy computation in view body
- [ ] Proper state ownership (single source of truth)

### High Priority
- [ ] @Observable used for view models (iOS 17+)
- [ ] NavigationStack instead of NavigationView (iOS 16+)
- [ ] .task instead of .onAppear for async work (iOS 15+)
- [ ] Proper property wrapper selection
- [ ] View extraction for complex views

### Medium Priority
- [ ] Modern .onChange syntax (iOS 17+)
- [ ] Accessibility labels and hints
- [ ] Dynamic Type support
- [ ] Equatable conformance for view models
- [ ] #Preview macro (iOS 17+)

### Low Priority
- [ ] View body < 50 lines
- [ ] MARK comments for subviews
- [ ] Preview configurations for testing

---

## Version
**Last Updated**: 2026-02-10
**Version**: 1.0.0
**iOS Version**: iOS 17+, macOS 14+, watchOS 10+, tvOS 17+, visionOS 1+
