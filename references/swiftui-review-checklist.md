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

## 8. Navigation Architecture

### 8.1 Route Enum Enforcement

**Check for:**
- [ ] Navigation destinations defined as typed `Hashable` enums (not String/Int/raw values)
- [ ] Route enum covers all destinations in the stack
- [ ] Associated values carry only the necessary data (IDs, not full models when possible)

**Examples:**

❌ **Bad: String-based navigation**
```swift
struct ContentView: View {
    @State private var path: [String] = []  // ❌ Stringly-typed route

    var body: some View {
        NavigationStack(path: $path) {
            List(items) { item in
                NavigationLink(value: "detail-\(item.id)") {  // ❌ Magic string
                    Text(item.name)
                }
            }
        }
    }
}
```

✅ **Good: Typed route enum**
```swift
enum AppRoute: Hashable {
    case userDetail(userID: UUID)
    case userEdit(userID: UUID)
    case settings
    case notifications
}

struct ContentView: View {
    @State private var router = RouterPath()

    var body: some View {
        NavigationStack(path: $router.path) {
            List(users) { user in
                NavigationLink(value: AppRoute.userDetail(userID: user.id)) {
                    Text(user.name)
                }
            }
            .navigationDestination(for: AppRoute.self) { route in
                routeDestination(route)
            }
        }
    }
}
```

**Reference**: `~/.claude/skills/swiftui-ui-patterns/references/navigation.md`

### 8.2 RouterPath Pattern

**Check for:**
- [ ] Navigation path owned by `RouterPath` `@Observable` class, not ad-hoc `@State var path`
- [ ] RouterPath exposed as `@Observable` so views can bind to it
- [ ] Path manipulation methods (`navigate(to:)`, `pop()`, `popToRoot()`) on RouterPath

**Examples:**

❌ **Bad: Ad-hoc @State path**
```swift
struct RootView: View {
    @State private var path = NavigationPath()  // ❌ Ad-hoc, not reusable
    @State private var showProfile = false

    var body: some View {
        NavigationStack(path: $path) {
            // ...
        }
    }
}
```

✅ **Good: RouterPath @Observable**
```swift
@Observable
final class RouterPath {
    var path: [AppRoute] = []

    func navigate(to route: AppRoute) {
        path.append(route)
    }

    func pop() {
        guard !path.isEmpty else { return }
        path.removeLast()
    }

    func popToRoot() {
        path.removeAll()
    }

    func navigate(to routes: [AppRoute]) {
        path.append(contentsOf: routes)
    }
}

struct RootView: View {
    @State private var router = RouterPath()

    var body: some View {
        NavigationStack(path: $router.path) {
            HomeView(router: router)
                .navigationDestination(for: AppRoute.self) { route in
                    destinationView(for: route, router: router)
                }
        }
    }
}
```

### 8.3 Centralized navigationDestination

**Check for:**
- [ ] Single `.navigationDestination(for: Route.self)` per NavigationStack (not scattered in child views)
- [ ] Destination mapping in root or coordinator view
- [ ] No `.navigationDestination` in deeply nested views for top-level routes

**Examples:**

❌ **Bad: Scattered navigationDestination**
```swift
struct HomeView: View {
    var body: some View {
        List(items) { item in
            NavigationLink(value: AppRoute.userDetail(userID: item.id)) {
                Text(item.name)
            }
        }
        .navigationDestination(for: AppRoute.self) { route in  // ❌ Defined in child
            // Only handles some routes
        }
    }
}
```

✅ **Good: Centralized in root**
```swift
struct RootView: View {
    @State private var router = RouterPath()

    var body: some View {
        NavigationStack(path: $router.path) {
            HomeView(router: router)
                .navigationDestination(for: AppRoute.self) { route in  // ✅ Single, centralized
                    switch route {
                    case .userDetail(let id): UserDetailView(userID: id, router: router)
                    case .userEdit(let id): UserEditView(userID: id, router: router)
                    case .settings: SettingsView(router: router)
                    case .notifications: NotificationsView(router: router)
                    }
                }
        }
        .environment(router)
    }
}
```

---

## 9. Sheet / Modal Routing

### 9.1 Item-Driven Sheet

**Check for:**
- [ ] `.sheet(item:)` preferred over `.sheet(isPresented:)` when a model is being selected/shown
- [ ] Sheet dismissed by setting item to `nil` (not manual boolean reset)
- [ ] No manual boolean reset after sheet dismiss

**Examples:**

❌ **Bad: Boolean-driven sheet with manual item**
```swift
struct UserListView: View {
    @State private var showDetail = false   // ❌ Manual boolean
    @State private var selectedUser: User?  // ❌ Two states to keep in sync

    var body: some View {
        List(users) { user in
            Button { selectedUser = user; showDetail = true } label: { Text(user.name) }
        }
        .sheet(isPresented: $showDetail) {
            if let user = selectedUser {  // ❌ Forced optional unwrap in sheet
                UserDetailSheet(user: user)
            }
        }
    }
}
```

✅ **Good: Item-driven sheet**
```swift
struct UserListView: View {
    @State private var selectedUser: User?  // ✅ Single source of truth

    var body: some View {
        List(users) { user in
            Button { selectedUser = user } label: { Text(user.name) }
        }
        .sheet(item: $selectedUser) { user in  // ✅ Item-driven, auto-dismisses on nil
            UserDetailSheet(user: user)
        }
    }
}
```

### 9.2 SheetDestination Enum

**Check for:**
- [ ] Multiple sheets represented as a single `Identifiable` enum, not multiple `@State` booleans
- [ ] `SheetDestination` enum covers all possible modals in the view
- [ ] Only one `.sheet(item:)` call per view

**Examples:**

❌ **Bad: Multiple boolean states for sheets**
```swift
struct HomeView: View {
    @State private var showCompose = false    // ❌ Multiple booleans
    @State private var showProfile = false    // ❌ Multiple booleans
    @State private var showSettings = false   // ❌ Multiple booleans

    var body: some View {
        // ...
        .sheet(isPresented: $showCompose) { ComposeView() }
        .sheet(isPresented: $showProfile) { ProfileView() }  // ❌ Multiple .sheet on same view
        .sheet(isPresented: $showSettings) { SettingsView() }
    }
}
```

✅ **Good: SheetDestination enum**
```swift
enum SheetDestination: Identifiable {
    case compose
    case profile(userID: UUID)
    case settings

    var id: String {
        switch self {
        case .compose: return "compose"
        case .profile(let id): return "profile-\(id)"
        case .settings: return "settings"
        }
    }
}

struct HomeView: View {
    @State private var sheetDestination: SheetDestination?  // ✅ Single state

    var body: some View {
        // ...
        .sheet(item: $sheetDestination) { destination in  // ✅ Single .sheet
            switch destination {
            case .compose: ComposeView()
            case .profile(let id): ProfileView(userID: id)
            case .settings: SettingsView()
            }
        }
    }
}
```

---

## 10. Deep Link Handling

### 10.1 Centralized Deep Link Routing

**Check for:**
- [ ] `.onOpenURL` applied at the app root (not in feature views)
- [ ] URL parsing and validation happens in a dedicated router/coordinator
- [ ] Feature views do not contain URL parsing logic

**Examples:**

❌ **Bad: onOpenURL scattered in feature views**
```swift
struct HomeView: View {
    var body: some View {
        // ...
        .onOpenURL { url in  // ❌ URL handling in feature view
            if url.pathComponents.contains("profile") {
                // Handle profile deep link
            }
        }
    }
}

struct SettingsView: View {
    var body: some View {
        // ...
        .onOpenURL { url in  // ❌ Another scattered handler
            if url.pathComponents.contains("settings") {
                // Handle settings deep link
            }
        }
    }
}
```

✅ **Good: Centralized at root, router handles routing**
```swift
@Observable
final class RouterPath {
    var path: [AppRoute] = []

    func handle(url: URL) -> Bool {
        guard let route = AppRoute(url: url) else { return false }  // ✅ URL → Route
        navigate(to: route)
        return true
    }
}

// In App root
struct RootView: View {
    @State private var router = RouterPath()

    var body: some View {
        NavigationStack(path: $router.path) {
            HomeView()
                .navigationDestination(for: AppRoute.self) { route in
                    destinationView(for: route)
                }
        }
        .onOpenURL { url in  // ✅ Single handler at root
            _ = router.handle(url: url)
        }
    }
}
```

---

## 11. TabView Architecture

### 11.1 Independent Navigation History Per Tab

**Check for:**
- [ ] Each tab has its own `RouterPath` (not a shared global path)
- [ ] Switching tabs preserves the navigation stack for each tab
- [ ] Tab routers are independent `@Observable` instances

**Examples:**

❌ **Bad: Shared navigation path across tabs**
```swift
struct MainTabView: View {
    @State private var path = NavigationPath()  // ❌ Shared across all tabs

    var body: some View {
        TabView {
            NavigationStack(path: $path) { HomeView() }.tabItem { Label("Home", systemImage: "house") }
            NavigationStack(path: $path) { SearchView() }.tabItem { Label("Search", systemImage: "magnifyingglass") }
        }
    }
}
```

✅ **Good: Independent RouterPath per tab**
```swift
enum AppTab: Int, CaseIterable {
    case home, search, notifications, profile
}

@Observable
final class AppTabRouter {
    var selectedTab: AppTab = .home

    // Independent path per tab
    var homeRouter = RouterPath()
    var searchRouter = RouterPath()
    var notificationsRouter = RouterPath()
    var profileRouter = RouterPath()

    func router(for tab: AppTab) -> RouterPath {
        switch tab {
        case .home: return homeRouter
        case .search: return searchRouter
        case .notifications: return notificationsRouter
        case .profile: return profileRouter
        }
    }
}

struct MainTabView: View {
    @State private var tabRouter = AppTabRouter()

    var body: some View {
        TabView(selection: $tabRouter.selectedTab) {
            Tab("Home", systemImage: "house", value: .home) {
                NavigationStack(path: $tabRouter.homeRouter.path) {  // ✅ Per-tab router
                    HomeView(router: tabRouter.homeRouter)
                }
            }
            Tab("Search", systemImage: "magnifyingglass", value: .search) {
                NavigationStack(path: $tabRouter.searchRouter.path) {  // ✅ Per-tab router
                    SearchView(router: tabRouter.searchRouter)
                }
            }
        }
    }
}
```

### 11.2 Custom Tab Binding with Side Effects

**Check for:**
- [ ] Action tabs (e.g., compose, post) handled as side effects, not actual tab destinations
- [ ] `AppTab` enum distinguishes navigable tabs from action tabs
- [ ] Tab selection goes through `updateTab(_:)` or equivalent to handle action tabs

**Examples:**

❌ **Bad: Action tab treated as normal tab**
```swift
struct MainTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView().tabItem { Label("Home", systemImage: "house") }.tag(0)
            EmptyView().tabItem { Label("Compose", systemImage: "plus") }.tag(1)  // ❌ No action
            ProfileView().tabItem { Label("Profile", systemImage: "person") }.tag(2)
        }
    }
}
```

✅ **Good: Action tabs trigger side effects**
```swift
enum AppTab: Int {
    case home, compose, profile

    var isAction: Bool { self == .compose }
}

@Observable
final class AppTabRouter {
    var selectedTab: AppTab = .home
    var showCompose = false

    func updateTab(_ tab: AppTab) {
        if tab.isAction {
            showCompose = true  // ✅ Action tab triggers modal, not navigation
        } else {
            selectedTab = tab
        }
    }
}

struct MainTabView: View {
    @State private var tabRouter = AppTabRouter()

    var body: some View {
        TabView(selection: Binding(
            get: { tabRouter.selectedTab },
            set: { tabRouter.updateTab($0) }  // ✅ Route through updateTab
        )) {
            HomeView().tabItem { Label("Home", systemImage: "house") }.tag(AppTab.home)
            Color.clear.tabItem { Label("Compose", systemImage: "plus") }.tag(AppTab.compose)
            ProfileView().tabItem { Label("Profile", systemImage: "person") }.tag(AppTab.profile)
        }
        .sheet(isPresented: $tabRouter.showCompose) {
            ComposeView()
        }
    }
}
```

---

## 12. Theming Enforcement

### 12.1 Semantic Colors via Theme Object

**Check for:**
- [ ] No raw color values (`Color.blue`, `Color.white`, `Color(hex:)`) when a `Theme` object exists
- [ ] Colors accessed via `@Environment(Theme.self)` or equivalent design token
- [ ] Theme propagated at app root via `.environment(theme)`

**Examples:**

❌ **Bad: Raw color values**
```swift
struct PostRowView: View {
    let post: Post

    var body: some View {
        HStack {
            Text(post.author)
                .foregroundStyle(Color.gray)       // ❌ Raw color
            Text(post.content)
                .foregroundStyle(Color.black)      // ❌ Raw color
            Spacer()
            Image(systemName: "heart")
                .foregroundStyle(Color.red)        // ❌ Raw color
        }
        .background(Color.white)                   // ❌ Raw color
    }
}
```

✅ **Good: Semantic colors via Theme**
```swift
struct PostRowView: View {
    let post: Post
    @Environment(Theme.self) private var theme  // ✅ Theme from environment

    var body: some View {
        HStack {
            Text(post.author)
                .foregroundStyle(theme.labelSecondary)  // ✅ Semantic color
            Text(post.content)
                .foregroundStyle(theme.labelPrimary)    // ✅ Semantic color
            Spacer()
            Image(systemName: "heart")
                .foregroundStyle(theme.tintColor)       // ✅ Semantic color
        }
        .background(theme.primaryBackground)            // ✅ Semantic color
    }
}

// Provide at app root
@main
struct MyApp: App {
    @State private var theme = Theme.default

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(theme)  // ✅ Theme propagated to all views
        }
    }
}
```

---

## 13. Async State Patterns

### 13.1 .task(id:) for Input-Driven Work

**Check for:**
- [ ] `.task(id: someValue)` used instead of `.onChange + Task { }` for input-driven async work
- [ ] `CancellationError` silenced (not re-thrown or shown as error to user)
- [ ] Debounce implemented inside `.task(id:)` using `Task.sleep` before the actual work

**Examples:**

❌ **Bad: .onChange + manual Task**
```swift
struct SearchView: View {
    @State private var query = ""
    @State private var results: [Result] = []

    var body: some View {
        TextField("Search", text: $query)
        List(results) { result in ResultRow(result: result) }
        .onChange(of: query) { _, newValue in
            Task {  // ❌ Manual Task, previous not cancelled properly
                results = await search(query: newValue)
            }
        }
    }
}
```

✅ **Good: .task(id:) with built-in cancellation and debounce**
```swift
struct SearchView: View {
    @State private var query = ""
    @State private var results: [SearchResult] = []

    var body: some View {
        TextField("Search", text: $query)
        List(results) { result in ResultRow(result: result) }
        .task(id: query) {  // ✅ Auto-cancels previous task when query changes
            do {
                try await Task.sleep(for: .milliseconds(300))  // ✅ Debounce inside task
                results = try await search(query: query)
            } catch is CancellationError {
                // ✅ Silenced — expected when task is superseded
            } catch {
                // Handle real errors
            }
        }
    }
}
```

### 13.2 Explicit Loading/Error States

**Check for:**
- [ ] `LoadState<T>` enum (or equivalent) used instead of multiple booleans (`isLoading`, `hasError`, `isEmpty`)
- [ ] All states represented: `.idle`, `.loading`, `.loaded(T)`, `.error(Error)`
- [ ] View switches on `LoadState` to render appropriate UI

**Examples:**

❌ **Bad: Multiple boolean flags**
```swift
@Observable
final class UserListViewModel {
    var users: [User] = []
    var isLoading: Bool = false   // ❌ Multiple flags
    var hasError: Bool = false    // ❌ Multiple flags
    var errorMessage: String = "" // ❌ Multiple flags
    var isEmpty: Bool = false     // ❌ Derived, should be computed
}
```

✅ **Good: LoadState enum**
```swift
enum LoadState<T> {
    case idle
    case loading
    case loaded(T)
    case error(Error)
}

@Observable
final class UserListViewModel {
    var loadState: LoadState<[User]> = .idle  // ✅ Single source of truth

    func loadUsers() async {
        loadState = .loading
        do {
            let users = try await userRepository.fetchUsers()
            loadState = .loaded(users)
        } catch {
            loadState = .error(error)
        }
    }
}

struct UserListView: View {
    let viewModel: UserListViewModel

    var body: some View {
        Group {
            switch viewModel.loadState {
            case .idle: EmptyView()
            case .loading: ProgressView()
            case .loaded(let users): UserListContent(users: users)
            case .error(let error): ErrorView(error: error, retry: { Task { await viewModel.loadUsers() } })
            }
        }
        .task { await viewModel.loadUsers() }
    }
}
```

---

## 14. Focus and Input Patterns

### 14.1 Focus State Chaining

**Check for:**
- [ ] `FocusField` enum used with `@FocusState` instead of multiple boolean focus states
- [ ] `.onSubmit` advances focus to the next field in the sequence
- [ ] Last field in chain submits the form or triggers the primary action

**Examples:**

❌ **Bad: Multiple boolean focus states**
```swift
struct LoginFormView: View {
    @State private var email = ""
    @State private var password = ""
    @FocusState private var emailFocused: Bool    // ❌ Separate boolean per field
    @FocusState private var passwordFocused: Bool  // ❌ Separate boolean per field

    var body: some View {
        TextField("Email", text: $email).focused($emailFocused)
        SecureField("Password", text: $password).focused($passwordFocused)
    }
}
```

✅ **Good: FocusField enum with chaining**
```swift
struct LoginFormView: View {
    @State private var email = ""
    @State private var password = ""
    @FocusState private var focusedField: FocusField?  // ✅ Single enum for all fields

    enum FocusField {
        case email, password
    }

    var body: some View {
        VStack(spacing: 16) {
            TextField("Email", text: $email)
                .focused($focusedField, equals: .email)
                .textContentType(.emailAddress)
                .keyboardType(.emailAddress)
                .submitLabel(.next)
                .onSubmit { focusedField = .password }  // ✅ Chain to next field

            SecureField("Password", text: $password)
                .focused($focusedField, equals: .password)
                .textContentType(.password)
                .submitLabel(.done)
                .onSubmit { login() }  // ✅ Last field submits form

            Button("Log In", action: login)
        }
        .onAppear { focusedField = .email }  // ✅ Auto-focus first field
    }

    private func login() {
        focusedField = nil  // ✅ Dismiss keyboard on submit
        Task { await viewModel.login() }
    }
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
- [ ] Route destinations as typed Hashable enum (not String/Int raw values)
- [ ] RouterPath @Observable owns navigation path (not ad-hoc @State)
- [ ] `.sheet(item:)` preferred when model is selected
- [ ] Multiple sheets use SheetDestination enum (not multiple booleans)
- [ ] Independent RouterPath per tab (not shared path)
- [ ] `.task(id:)` for input-driven async work with CancellationError silenced

### Medium Priority
- [ ] Modern .onChange syntax (iOS 17+)
- [ ] Accessibility labels and hints
- [ ] Dynamic Type support
- [ ] Equatable conformance for view models
- [ ] #Preview macro (iOS 17+)
- [ ] Semantic colors via Theme @Environment (no raw Color.blue/Color.white)
- [ ] FocusField enum with @FocusState for multi-field forms
- [ ] `.onOpenURL` at app root (not in feature views)
- [ ] LoadState<T> enum instead of multiple isLoading/hasError booleans

### Low Priority
- [ ] View body < 50 lines
- [ ] MARK comments for subviews
- [ ] Preview configurations for testing

---

## Version
**Last Updated**: 2026-02-10
**Version**: 1.0.0
**iOS Version**: iOS 17+, macOS 14+, watchOS 10+, tvOS 17+, visionOS 1+
