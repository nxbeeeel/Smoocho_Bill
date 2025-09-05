# Smoocho POS - Flutter Edition

A premium Point of Sale (POS) system built with Flutter, featuring real-time synchronization, offline capabilities, and a beautiful, modern UI that replicates your existing Next.js design.

## 🚀 Features

### Core Functionality
- **Complete POS System** - Product management, cart, checkout, and order processing
- **Real-time Sync** - Firebase-powered synchronization across multiple devices
- **Offline Support** - Full functionality even without internet connection
- **Premium UI** - Modern, responsive design matching your existing aesthetic
- **Multi-platform** - Android app and web support

### Business Features
- **Product Management** - Complete Smoocho menu with categories
- **Order Processing** - Multiple payment methods (Cash, Card, UPI)
- **Inventory Tracking** - Stock management with low-stock alerts
- **Sales Analytics** - Reports and dashboard with key metrics
- **Receipt Generation** - Professional receipt printing
- **User Management** - Role-based access (Admin/Cashier)

### Technical Features
- **Local Database** - SQLite + Hive for offline storage
- **Real-time Sync** - Firebase Firestore for cloud synchronization
- **Offline Queue** - Automatic sync when connection is restored
- **State Management** - Provider pattern for reactive UI
- **Responsive Design** - Works on tablets, phones, and web
- **Production Ready** - Error handling, logging, and performance optimization

## 📱 Screenshots

The app maintains your existing premium design with:
- Clean, modern interface
- Intuitive product grid
- Smooth cart management
- Professional checkout flow
- Real-time sync indicators

## 🛠️ Setup Instructions

### Prerequisites
- Flutter SDK (3.10.0 or higher)
- Android Studio / VS Code
- Firebase project
- Git

### 1. Clone and Setup
```bash
git clone <your-repo>
cd smoocho-pos
flutter pub get
```

### 2. Firebase Configuration
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication, Firestore, and Storage
3. Download configuration files:
   - `google-services.json` for Android (place in `android/app/`)
   - `GoogleService-Info.plist` for iOS (place in `ios/Runner/`)
4. Update `lib/firebase_options.dart` with your project details

### 3. Build and Run
```bash
# For Android
flutter run

# For Web
flutter run -d chrome

# Build APK
flutter build apk --release
```

## 🏗️ Project Structure

```
lib/
├── models/           # Data models with Hive adapters
├── providers/        # State management (Cart, Products)
├── services/         # Database, Sync, Offline services
├── screens/          # UI screens (POS, Checkout, etc.)
├── widgets/          # Reusable UI components
├── theme/            # App theme and styling
├── utils/            # Utility functions
└── main.dart         # App entry point
```

## 🔧 Configuration

### Database
- **Local**: SQLite + Hive for offline storage
- **Cloud**: Firebase Firestore for real-time sync
- **Auto-sync**: Every 5 minutes when online

### Offline Support
- Operations queued when offline
- Automatic sync when connection restored
- Conflict resolution for concurrent edits
- Retry mechanism for failed operations

### Customization
- **Store Settings**: Name, address, tax rates, etc.
- **Payment Methods**: Cash, Card, UPI configuration
- **Receipt Templates**: Customizable receipt format
- **Theme**: Light/dark mode support

## 📊 Data Models

### Product
- Name, price, category, description
- Image support with fallbacks
- Active/inactive status
- Sync status tracking

### Order
- Order items with quantities
- Payment method and status
- Customer information
- Tax and discount calculations
- Delivery options

### Inventory
- Stock quantities and thresholds
- Cost tracking
- Supplier information
- Expiry date management

## 🔄 Sync Architecture

### Real-time Sync
1. **Local Changes**: Stored in Hive database
2. **Queue System**: Offline operations queued
3. **Cloud Sync**: Firebase Firestore for cloud storage
4. **Conflict Resolution**: Last-write-wins with timestamps
5. **Status Tracking**: Sync status for each record

### Offline Queue
- Operations stored locally when offline
- Automatic retry with exponential backoff
- Failed operations marked for manual review
- Queue size limits to prevent memory issues

## 🎨 UI Components

### Custom Components
- **CustomButton**: Multiple variants and sizes
- **CustomCard**: Premium card designs
- **ProductCard**: Product display with cart integration
- **CartItemCard**: Cart item management
- **StatsCard**: Dashboard metrics display

### Theme System
- **Colors**: Matching your existing palette
- **Typography**: Inter font family
- **Spacing**: Consistent spacing system
- **Shadows**: Premium shadow effects
- **Gradients**: Beautiful gradient buttons

## 🚀 Production Deployment

### Android
```bash
# Build release APK
flutter build apk --release

# Build App Bundle (recommended)
flutter build appbundle --release
```

### Web
```bash
# Build for web
flutter build web --release

# Deploy to Firebase Hosting
firebase deploy
```

### Performance Optimization
- **Image Caching**: Cached network images
- **Lazy Loading**: Products loaded on demand
- **Memory Management**: Efficient state management
- **Database Indexing**: Optimized queries

## 🔒 Security Features

- **Authentication**: Firebase Auth integration
- **Role-based Access**: Admin/Cashier permissions
- **Data Validation**: Input validation and sanitization
- **Secure Storage**: Encrypted local storage
- **API Security**: Firebase security rules

## 📈 Analytics & Monitoring

- **Crash Reporting**: Firebase Crashlytics
- **Performance Monitoring**: Firebase Performance
- **Analytics**: Firebase Analytics
- **Custom Events**: Order tracking and metrics

## 🐛 Error Handling

- **Graceful Degradation**: App works offline
- **User Feedback**: Toast messages and loading states
- **Error Logging**: Comprehensive error tracking
- **Recovery Mechanisms**: Automatic retry and fallbacks

## 🔧 Troubleshooting

### Common Issues
1. **Firebase Setup**: Ensure configuration files are correct
2. **Build Errors**: Run `flutter clean && flutter pub get`
3. **Sync Issues**: Check Firebase security rules
4. **Performance**: Monitor memory usage and optimize queries

### Debug Mode
```bash
# Enable debug logging
flutter run --debug

# Check database
# Use Hive Inspector for local database debugging
```

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Firebase console for sync issues
3. Check device logs for error details
4. Ensure all dependencies are up to date

## 🎯 Future Enhancements

- **Multi-language Support**: Internationalization
- **Advanced Analytics**: Detailed sales reports
- **Inventory Alerts**: Push notifications
- **Barcode Scanning**: Product lookup
- **Customer Management**: Customer database
- **Loyalty Programs**: Points and rewards

## 📄 License

This project is proprietary software for Smoocho Bill. All rights reserved.

---

**Built with ❤️ for Smoocho Bill - Premium POS System**