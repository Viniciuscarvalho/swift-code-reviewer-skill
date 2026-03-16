# SwiftUI Performance Review Guide

This guide covers common performance anti-patterns in SwiftUI, view update optimization, ForEach identity issues, layout performance, and resource management. Use this to identify and fix performance problems in SwiftUI code.

---

## 1. View Update Optimization

### 1.1 Unnecessary View Updates

**Check for:**
- [ ] Views re-rendering when data hasn't changed
- [ ] Excessive @State or @Observable properties
- [ ] Parent updates causing child re-renders unnecessarily

**Common Causes:**
- Non-Equatable view models
- Computed properties that always return new values
- Reference type mutations triggering updates
- Closures capturing mutable state

**Examples:**

❌ **Bad: Excessive updates**
```swift
@Observable
final class ViewModel {
    var timestamp: Date {  // ❌ New value every access
        Date()
    }
}

struct ContentView: View {
    let viewModel: ViewModel

    var body: some View {
        Text("Current time: \(viewModel.timestamp)")  // ❌ Updates constantly
    }
}
```

✅ **Good: Controlled updates**
```swift
@Observable
final class ViewModel {
    private(set) var timestamp: Date = Date()

    func updateTimestamp() {
        timestamp = Date()  // ✅ Explicit update only
    }
}
```

### 1.2 Heavy Computation in Body

**Check for:**
- [ ] Sorting, filtering, or mapping in body
- [ ] Network calls or database queries in body
- [ ] Complex calculations during render

**Examples:**

❌ **Bad: Computation in body**
```swift
struct ItemListView: View {
    let items: [Item]

    var body: some View {
        let filtered = items.filter { $0.isActive }  // ❌ Every render
        let sorted = filtered.sorted { $0.date > $1.date }  // ❌ Every render

        List(sorted) { item in
            ItemRow(item: item)
        }
    }
}
```

✅ **Good: Computed property**
```swift
struct ItemListView: View {
    let items: [Item]

    private var processedItems: [Item] {  // ✅ Computed property
        items
            .filter { $0.isActive }
            .sorted { $0.date > $1.date }
    }

    var body: some View {
        List(processedItems) { item in
            ItemRow(item: item)
        }
    }
}
```

✅ **Better: View model handles logic**
```swift
@Observable
final class ItemListViewModel {
    var items: [Item] = []
    var showActiveOnly: Bool = true

    var displayedItems: [Item] {  // ✅ Cached by view model
        let filtered = showActiveOnly ? items.filter { $0.isActive } : items
        return filtered.sorted { $0.date > $1.date }
    }
}

struct ItemListView: View {
    let viewModel: ItemListViewModel

    var body: some View {
        List(viewModel.displayedItems) { item in  // ✅ Already processed
            ItemRow(item: item)
        }
    }
}
```

### 1.3 Equatable Conformance

**Check for:**
- [ ] View models conform to Equatable
- [ ] Views use .equatable() modifier
- [ ] Proper equality implementation

**Examples:**

✅ **Good: Equatable view model**
```swift
@Observable
final class ItemViewModel: Equatable {
    let id: UUID
    var title: String
    var subtitle: String

    static func == (lhs: ItemViewModel, rhs: ItemViewModel) -> Bool {
        lhs.id == rhs.id &&
        lhs.title == rhs.title &&
        lhs.subtitle == rhs.subtitle
    }
}

struct ItemRow: View {
    let viewModel: ItemViewModel

    var body: some View {
        VStack(alignment: .leading) {
            Text(viewModel.title)
            Text(viewModel.subtitle)
        }
    }
    .equatable()  // ✅ Only updates when viewModel changes
}
```

### 1.4 Avoid Struct Copying

**Check for:**
- [ ] Large structs being copied frequently
- [ ] Reference semantics where appropriate
- [ ] Efficient data structures

**Examples:**

❌ **Bad: Large struct copying**
```swift
struct LargeData {
    let items: [Item]  // Large array
    let metadata: [String: Any]  // Large dictionary
    // ... more properties

    func withUpdatedItem(_ item: Item) -> LargeData {  // ❌ Copies entire struct
        var copy = self
        // Update logic
        return copy
    }
}
```

✅ **Good: Reference type for mutable state**
```swift
@Observable
final class LargeDataModel {  // ✅ Reference type
    var items: [Item] = []
    var metadata: [String: Any] = [:]

    func updateItem(_ item: Item) {  // ✅ No copying
        // Update in place
    }
}
```

---

## 2. ForEach Performance

### 2.1 Stable Identity

**Check for:**
- [ ] ForEach uses stable IDs (Identifiable or explicit id)
- [ ] No index-based iteration when data changes
- [ ] No array.indices or enumerated() in ForEach

**Examples:**

❌ **Bad: Index-based identity**
```swift
List {
    ForEach(items.indices, id: \.self) { index in  // ❌ Unstable identity
        ItemRow(item: items[index])
    }
}
```

❌ **Bad: Enumerated**
```swift
ForEach(Array(items.enumerated()), id: \.offset) { index, item in  // ❌ Unstable
    ItemRow(item: item)
}
```

✅ **Good: Identifiable**
```swift
struct Item: Identifiable {
    let id: UUID
    let title: String
}

List {
    ForEach(items) { item in  // ✅ Using Identifiable
        ItemRow(item: item)
    }
}
```

✅ **Good: Explicit stable ID**
```swift
struct Item {
    let id: UUID
    let title: String
}

List {
    ForEach(items, id: \.id) { item in  // ✅ Explicit stable ID
        ItemRow(item: item)
    }
}
```

### 2.2 ForEach Identity for Animations

**Check for:**
- [ ] Stable IDs for smooth animations
- [ ] ID includes all relevant data for transitions
- [ ] No changing IDs during animations

**Examples:**

❌ **Bad: Changing ID during animation**
```swift
ForEach(items, id: \.timestamp) { item in  // ❌ Timestamp changes
    ItemRow(item: item)
}
.animation(.default, value: items)
```

✅ **Good: Stable ID for animations**
```swift
ForEach(items, id: \.id) { item in  // ✅ ID never changes
    ItemRow(item: item)
}
.animation(.default, value: items)
```

### 2.3 Large List Performance

**Check for:**
- [ ] LazyVStack/LazyHStack for large lists
- [ ] Lazy loading for off-screen items
- [ ] Pagination for very large datasets

**Examples:**

❌ **Bad: Non-lazy stack for large list**
```swift
ScrollView {
    VStack {  // ❌ All views created immediately
        ForEach(1000..<10000) { index in
            HeavyView(index: index)
        }
    }
}
```

✅ **Good: Lazy stack**
```swift
ScrollView {
    LazyVStack {  // ✅ Views created on-demand
        ForEach(1000..<10000) { index in
            HeavyView(index: index)
        }
    }
}
```

✅ **Good: List (built-in lazy loading)**
```swift
List(items) { item in  // ✅ List is lazy by default
    ItemRow(item: item)
}
```

### 2.4 Cell Reuse Patterns

**Check for:**
- [ ] Minimal state in rows
- [ ] No heavy initialization in row views
- [ ] Efficient data passing

**Examples:**

❌ **Bad: Heavy initialization in row**
```swift
struct ItemRow: View {
    let item: Item

    var body: some View {
        let processedData = heavyProcessing(item)  // ❌ Every render

        VStack {
            Text(processedData.title)
            Text(processedData.subtitle)
        }
    }

    private func heavyProcessing(_ item: Item) -> ProcessedData {
        // Expensive operation
    }
}
```

✅ **Good: Pre-processed data**
```swift
struct ItemRow: View {
    let displayData: ItemDisplayData  // ✅ Already processed

    var body: some View {
        VStack {
            Text(displayData.title)
            Text(displayData.subtitle)
        }
    }
}

// Process data before passing to view
let displayData = items.map { heavyProcessing($0) }
List(displayData) { data in
    ItemRow(displayData: data)
}
```

---

## 3. Layout Performance

### 3.1 GeometryReader Overuse

**Check for:**
- [ ] Minimal GeometryReader usage
- [ ] No nested GeometryReaders
- [ ] Use .frame(maxWidth:) instead when possible

**Examples:**

❌ **Bad: Unnecessary GeometryReader**
```swift
GeometryReader { geometry in  // ❌ Not needed
    VStack {
        Text("Hello")
            .frame(width: geometry.size.width)
    }
}
```

✅ **Good: Simple frame modifier**
```swift
VStack {
    Text("Hello")
        .frame(maxWidth: .infinity)  // ✅ Much simpler
}
```

❌ **Bad: Nested GeometryReaders**
```swift
GeometryReader { outerGeometry in
    VStack {
        ForEach(items) { item in
            GeometryReader { innerGeometry in  // ❌ Nested, performance issue
                ItemView(item: item, width: innerGeometry.size.width)
            }
        }
    }
}
```

✅ **Good: Single GeometryReader or layout protocol**
```swift
// Option 1: Single GeometryReader
GeometryReader { geometry in
    VStack {
        ForEach(items) { item in
            ItemView(item: item, width: geometry.size.width)  // ✅ Reuse outer
        }
    }
}

// Option 2: Layout protocol (iOS 16+)
struct CustomLayout: Layout {
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        // Custom layout logic
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        // Placement logic
    }
}
```

### 3.2 Layout Thrash

**Check for:**
- [ ] No layout changes in onAppear/task
- [ ] Stable frame sizes
- [ ] No excessive frame recalculations

**Examples:**

❌ **Bad: Layout change in onAppear**
```swift
struct ContentView: View {
    @State private var width: CGFloat = 100

    var body: some View {
        Rectangle()
            .frame(width: width, height: 100)
            .onAppear {
                width = 200  // ❌ Layout thrash on appear
            }
    }
}
```

✅ **Good: Stable initial layout**
```swift
struct ContentView: View {
    @State private var width: CGFloat = 200  // ✅ Correct from start

    var body: some View {
        Rectangle()
            .frame(width: width, height: 100)
    }
}
```

### 3.3 Prefer .frame Over Custom Layouts

**Check for:**
- [ ] Use built-in layout modifiers when possible
- [ ] Custom layouts only when necessary
- [ ] Efficient layout calculations

**Examples:**

✅ **Good: Built-in layout modifiers**
```swift
// Use built-in modifiers first
HStack(spacing: 16) {
    Text("Title")
        .frame(maxWidth: .infinity, alignment: .leading)
    Text("Value")
}
.padding()
```

✅ **Good: Custom layout for complex needs**
```swift
// Only when built-in modifiers insufficient
struct WaterfallLayout: Layout {
    // Complex custom layout logic
}
```

### 3.5 Scroll Container Selection

**Check for:**
- [ ] Correct scroll container chosen for the use case
- [ ] No nested scroll views on the same axis
- [ ] `List` used for system-style rows with swipe actions; `LazyVStack` for custom layouts
- [ ] Plain `VStack` only for small, fixed-count content

**Decision Table:**

| Use Case | Container | Why |
|----------|-----------|-----|
| System-style rows, swipe actions, sections | `List` | Built-in lazy loading, cell reuse |
| Custom row layout, >20 items | `ScrollView + LazyVStack` | Lazy + full layout control |
| Grid of items | `LazyVGrid` | 2D lazy loading |
| Small static list (<10 items) | `VStack` | Simplest, no lazy overhead |
| Horizontal scrolling carousel | `ScrollView(.horizontal) + LazyHStack` | Horizontal lazy |

**Examples:**

❌ **Bad: VStack for large dynamic list**
```swift
ScrollView {
    VStack {  // ❌ All views created immediately — bad for 100+ items
        ForEach(posts) { post in
            PostRow(post: post)
        }
    }
}
```

❌ **Bad: Nested ScrollViews on same axis**
```swift
ScrollView(.vertical) {
    LazyVStack {
        ForEach(sections) { section in
            ScrollView(.vertical) {  // ❌ Nested vertical scroll — broken UX + perf
                ForEach(section.items) { item in
                    ItemRow(item: item)
                }
            }
        }
    }
}
```

✅ **Good: List for system-style content**
```swift
List(posts) { post in  // ✅ Lazy by default, swipe actions, separators
    PostRow(post: post)
        .swipeActions { Button("Delete", role: .destructive) { delete(post) } }
}
.listStyle(.plain)
```

✅ **Good: LazyVStack for custom layout feeds**
```swift
ScrollView {
    LazyVStack(spacing: 0, pinnedViews: .sectionHeaders) {  // ✅ Lazy + custom layout
        ForEach(posts) { post in
            PostCardView(post: post)
                .padding(.horizontal)
        }
    }
}
```

✅ **Good: LazyVGrid for photo grid**
```swift
let columns = [GridItem(.adaptive(minimum: 100))]

ScrollView {
    LazyVGrid(columns: columns, spacing: 2) {  // ✅ 2D lazy grid
        ForEach(photos) { photo in
            PhotoThumbnail(photo: photo)
        }
    }
}
```

---

## 4. Image Performance

### 4.1 AsyncImage for Remote Images

**Check for:**
- [ ] AsyncImage for remote images
- [ ] Proper placeholder and error states
- [ ] No synchronous image loading

**Examples:**

❌ **Bad: Synchronous image loading**
```swift
if let data = try? Data(contentsOf: imageURL),  // ❌ Blocks main thread
   let image = UIImage(data: data) {
    Image(uiImage: image)
}
```

✅ **Good: AsyncImage**
```swift
AsyncImage(url: imageURL) { phase in  // ✅ Async with caching
    switch phase {
    case .success(let image):
        image
            .resizable()
            .aspectRatio(contentMode: .fit)
    case .failure:
        Image(systemName: "photo")
            .foregroundColor(.gray)
    case .empty:
        ProgressView()
    @unknown default:
        EmptyView()
    }
}
```

### 4.2 Image Sizing and Scaling

**Check for:**
- [ ] Proper image sizing (not loading huge images for small views)
- [ ] .resizable() used appropriately
- [ ] Aspect ratio preserved

**Examples:**

❌ **Bad: Full-size image in thumbnail**
```swift
Image("large-photo")  // ❌ 4000x3000 image for 100x100 thumbnail
    .frame(width: 100, height: 100)
```

✅ **Good: Properly sized image**
```swift
// Provide appropriately sized asset
Image("photo-thumbnail")  // ✅ 100x100 or 200x200 for @2x
    .resizable()
    .frame(width: 100, height: 100)
```

✅ **Good: Dynamic resizing with AsyncImage**
```swift
AsyncImage(url: thumbnailURL) { image in  // ✅ Request thumbnail size
    image
        .resizable()
        .aspectRatio(contentMode: .fill)
        .frame(width: 100, height: 100)
        .clipped()
} placeholder: {
    ProgressView()
}
```

### 4.3 Image Caching

**Check for:**
- [ ] AsyncImage built-in caching leveraged
- [ ] Custom caching for specific needs
- [ ] Memory-efficient cache implementation

**Examples:**

✅ **Good: AsyncImage caching (built-in)**
```swift
AsyncImage(url: imageURL)  // ✅ Automatically cached
```

✅ **Good: Custom cache for specific needs**
```swift
actor ImageCache {
    private var cache: [URL: UIImage] = [:]

    func image(for url: URL) -> UIImage? {
        cache[url]
    }

    func cache(_ image: UIImage, for url: URL) {
        cache[url] = image
    }

    func clearCache() {
        cache.removeAll()
    }
}
```

---

## 5. Memory Management

### 5.1 Retain Cycles

**Check for:**
- [ ] No strong reference cycles with closures
- [ ] [weak self] in closures when necessary
- [ ] Proper capture lists

**Examples:**

❌ **Bad: Retain cycle**
```swift
@Observable
final class ViewModel {
    var onComplete: (() -> Void)?

    func setup() {
        onComplete = {
            self.finish()  // ❌ Retain cycle
        }
    }

    func finish() { }
}
```

✅ **Good: Weak self**
```swift
@Observable
final class ViewModel {
    var onComplete: (() -> Void)?

    func setup() {
        onComplete = { [weak self] in  // ✅ Weak capture
            self?.finish()
        }
    }

    func finish() { }
}
```

✅ **Good: Unowned for guaranteed lifetime**
```swift
@Observable
final class ViewModel {
    let dependency: Dependency

    func setup() {
        dependency.onEvent = { [unowned self] in  // ✅ Unowned when guaranteed
            self.handleEvent()
        }
    }
}
```

### 5.2 Large Data Structures

**Check for:**
- [ ] Lazy loading for large datasets
- [ ] Pagination for network data
- [ ] Data clearing when not needed

**Examples:**

❌ **Bad: Loading all data at once**
```swift
@Observable
final class DataViewModel {
    var allItems: [Item] = []  // ❌ Could be thousands

    func loadAllData() async {
        allItems = await fetchAllItems()  // ❌ Load everything
    }
}
```

✅ **Good: Pagination**
```swift
@Observable
final class DataViewModel {
    var items: [Item] = []
    private var currentPage = 0
    private let pageSize = 50

    func loadNextPage() async {
        let newItems = await fetchItems(page: currentPage, size: pageSize)
        items.append(contentsOf: newItems)
        currentPage += 1
    }
}
```

### 5.3 Resource Cleanup

**Check for:**
- [ ] Resources released when view disappears
- [ ] Cancellation for async tasks
- [ ] Proper cleanup in deinit

**Examples:**

✅ **Good: Task cancellation**
```swift
struct ContentView: View {
    @State private var data: [Item] = []

    var body: some View {
        List(data) { item in
            ItemRow(item: item)
        }
        .task {  // ✅ Automatically cancelled on disappear
            await loadData()
        }
    }

    private func loadData() async {
        // Task automatically cancelled when view disappears
    }
}
```

✅ **Good: Manual cleanup**
```swift
@Observable
final class ViewModel {
    private var timer: Timer?

    func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            // Timer logic
        }
    }

    deinit {
        timer?.invalidate()  // ✅ Cleanup
    }
}
```

---

## 6. Background Task Efficiency

### 6.1 Async/Await Patterns

**Check for:**
- [ ] Proper async/await usage
- [ ] No blocking main thread
- [ ] Efficient task management

**Examples:**

❌ **Bad: Blocking main thread**
```swift
Button("Load") {
    let data = loadData()  // ❌ Synchronous, blocks UI
    processData(data)
}

func loadData() -> Data {
    // Long-running operation
}
```

✅ **Good: Async operation**
```swift
Button("Load") {
    Task {  // ✅ Async task
        await loadData()
    }
}

func loadData() async {
    // Long-running operation on background
}
```

### 6.2 Concurrent Operations

**Check for:**
- [ ] TaskGroup for multiple concurrent operations
- [ ] Efficient concurrency patterns
- [ ] Proper error handling

**Examples:**

❌ **Bad: Sequential operations**
```swift
func loadAllData() async {
    let users = await fetchUsers()  // ❌ Wait
    let posts = await fetchPosts()  // ❌ Wait
    let comments = await fetchComments()  // ❌ Wait
}
```

✅ **Good: Concurrent operations**
```swift
func loadAllData() async {
    await withTaskGroup(of: Void.self) { group in
        group.addTask { await self.fetchUsers() }  // ✅ Parallel
        group.addTask { await self.fetchPosts() }  // ✅ Parallel
        group.addTask { await self.fetchComments() }  // ✅ Parallel
    }
}
```

---

## 7. Animation Performance

### 7.1 Efficient Animations

**Check for:**
- [ ] Animations on GPU-accelerated properties (opacity, transform)
- [ ] No animating layout changes excessively
- [ ] Proper animation curves

**Examples:**

✅ **Good: GPU-accelerated properties**
```swift
Rectangle()
    .opacity(isVisible ? 1.0 : 0.0)  // ✅ GPU-accelerated
    .scaleEffect(isExpanded ? 1.2 : 1.0)  // ✅ GPU-accelerated
    .animation(.easeInOut, value: isVisible)
```

❌ **Bad: Excessive layout animations**
```swift
VStack {
    if isExpanded {  // ❌ Layout changes on every animation frame
        ForEach(1...100) { index in
            Text("Item \(index)")
        }
    }
}
.animation(.default, value: isExpanded)
```

✅ **Good: Controlled layout animations**
```swift
VStack {
    if isExpanded {
        ForEach(1...10) { index in  // ✅ Limited items
            Text("Item \(index)")
        }
    }
}
.animation(.easeInOut(duration: 0.3), value: isExpanded)  // ✅ Fast animation
```

---

## 8. Narrow Observation Scope

### 8.1 Read Only What You Display

**Check for:**
- [ ] Views read only the properties they actually display (not entire `@Observable` objects passed unnecessarily)
- [ ] Subviews receive minimal data needed (IDs or value types when possible, not full observable models)
- [ ] `@Observable` objects not passed to descendants that don't observe them

**Examples:**

❌ **Bad: Passing entire observable to unrelated subview**
```swift
@Observable
final class FeedViewModel {
    var posts: [Post] = []
    var isLoading: Bool = false
    var currentUser: User = .placeholder
    var unreadCount: Int = 0
    // ... many more properties
}

struct FeedView: View {
    let viewModel: FeedViewModel

    var body: some View {
        List(viewModel.posts) { post in
            PostRow(viewModel: viewModel, post: post)  // ❌ Passes entire ViewModel
        }
    }
}

struct PostRow: View {
    let viewModel: FeedViewModel  // ❌ Observes ALL viewModel properties, re-renders on any change
    let post: Post

    var body: some View {
        Text(post.title)  // Only uses post, but re-renders on isLoading, unreadCount changes
    }
}
```

✅ **Good: Pass only what the subview needs**
```swift
struct FeedView: View {
    let viewModel: FeedViewModel

    var body: some View {
        List(viewModel.posts) { post in
            PostRow(post: post)  // ✅ Pass only the value, not the entire observable
        }
    }
}

struct PostRow: View {
    let post: Post  // ✅ Only observes/depends on this post

    var body: some View {
        Text(post.title)
    }
}
```

### 8.2 Lazy Containers for Feeds

**Check for:**
- [ ] Feeds with >20 items use lazy containers (`List`, `LazyVStack`, `LazyVGrid`)
- [ ] Row views are lightweight (no heavy init, no async work in init)
- [ ] `.task` or `.onAppear` on rows used for per-row async loading (e.g., avatar images)

**Examples:**

❌ **Bad: Eager loading all rows**
```swift
ScrollView {
    VStack {  // ❌ Instantiates all PostRow views immediately
        ForEach(viewModel.posts) { post in
            PostRow(post: post)
        }
    }
}
```

✅ **Good: Lazy container with lightweight rows**
```swift
List(viewModel.posts) { post in  // ✅ Lazy — only creates visible rows
    PostRow(post: post)
}

struct PostRow: View {
    let post: Post
    @State private var avatar: Image?

    var body: some View {
        HStack {
            (avatar ?? Image(systemName: "person.circle"))
                .resizable()
                .frame(width: 40, height: 40)
            Text(post.content)
        }
        .task {  // ✅ Load avatar lazily only when row appears
            avatar = await loadAvatar(url: post.avatarURL)
        }
    }
}
```

---

## Quick Performance Checklist

### Critical (Fix Immediately)
- [ ] No heavy computation in view body
- [ ] No synchronous I/O on main thread
- [ ] No blocking operations in view updates
- [ ] No retain cycles with closures

### High Priority
- [ ] ForEach uses stable IDs (Identifiable)
- [ ] Equatable conformance for view models
- [ ] AsyncImage for remote images
- [ ] LazyVStack/LazyHStack for large lists
- [ ] Minimal GeometryReader usage
- [ ] Correct scroll container selected (List vs LazyVStack vs LazyVGrid vs VStack)
- [ ] No nested scroll views on the same axis

### Medium Priority
- [ ] Computed properties for derived data
- [ ] Pagination for large datasets
- [ ] Proper task cancellation
- [ ] Efficient image sizing
- [ ] Resource cleanup in deinit
- [ ] Narrow observation scope (subviews receive only needed data, not full @Observable)
- [ ] @Observable not propagated to unrelated descendants

### Low Priority
- [ ] Animation performance optimization
- [ ] Layout protocol for custom layouts
- [ ] Image caching strategies
- [ ] TaskGroup for concurrent operations

---

## Performance Profiling Tips

When code review identifies potential performance issues, recommend using Instruments:

**Key Instruments:**
- **Time Profiler**: Identify CPU bottlenecks
- **Allocations**: Track memory usage
- **Leaks**: Find retain cycles
- **SwiftUI**: View body execution tracking
- **Animation Hitches**: Find janky animations

**Common Issues to Profile:**
- View body execution frequency
- Layout calculation time
- Image loading and decoding
- List scrolling performance
- Memory growth over time

---

## Version
**Last Updated**: 2026-02-10
**Version**: 1.0.0
