# Smoocho Bill - Point of Sale System

A modern, feature-rich Point of Sale (POS) system built with Next.js, designed specifically for restaurants and food businesses.

## 🚀 Features

### Core Functionality
- **Point of Sale (POS)** - Complete billing system with cart management
- **Menu Editor** - Add, edit, delete menu items with image upload
- **Inventory Management** - Track stock levels and manage inventory
- **Settings Management** - Comprehensive store configuration
- **Reports & Analytics** - Sales reports and business insights
- **AI Assistant** - Intelligent business assistance

### Key Capabilities
- ✅ **Image Upload** - Upload product images in menu editor
- ✅ **Persistent Settings** - Settings saved with dual storage backup
- ✅ **Real-time Updates** - Live data synchronization
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Error Handling** - Graceful error handling throughout
- ✅ **Toast Notifications** - User-friendly feedback system

## 🛠️ Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: Dexie.js (IndexedDB wrapper)
- **UI Components**: Custom components with Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React hooks with live queries

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smoocho-bill
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
smoocho-bill/
├── app/                    # Next.js app directory
│   ├── ai/                # AI Assistant page
│   ├── inventory/         # Inventory management
│   ├── menu-editor/       # Menu editor with image upload
│   ├── pos/              # Point of Sale system
│   ├── reports/          # Reports and analytics
│   ├── settings/         # Settings management
│   └── layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── layout/           # Layout components
│   ├── ui/               # UI components
│   └── error-boundary.tsx # Error handling
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and database
└── public/               # Static assets
```

## 🎯 Usage

### Menu Editor
1. Navigate to **Menu Editor** from the sidebar
2. Click **"Add Item"** to create new menu items
3. Upload images by clicking the image upload area
4. Edit existing items using the edit button
5. Delete items with the delete button
6. Toggle active/inactive status for POS visibility

### Point of Sale
1. Go to **POS** from the sidebar
2. Browse products by category
3. Click products to add to cart
4. Apply discounts (percentage or flat)
5. Select payment method
6. Complete the order

### Settings
1. Access **Settings** from the sidebar
2. Configure store information
3. Set payment methods and tax rates
4. Customize display preferences
5. Click **"Save Settings"** to persist changes

## 🔧 Configuration

### Database
The app uses Dexie.js for local storage. Data is automatically initialized on first run with:
- Default menu items
- Sample inventory
- Default settings
- Admin and cashier users

### Settings Persistence
Settings are stored with dual backup:
- Primary: IndexedDB (Dexie.js)
- Backup: localStorage
- Automatic fallback if database fails

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the console for error messages
2. Use the debug tools in Settings
3. Create an issue in the repository

## 🔄 Recent Updates

### v1.0.0 - Complete System
- ✅ Fixed image upload in menu editor
- ✅ Implemented persistent settings with dual storage
- ✅ Added complete CRUD operations for menu items
- ✅ Enhanced POS with uploaded image support
- ✅ Added error boundary for better stability
- ✅ Improved user experience with toast notifications

---

**Built with ❤️ for food businesses**
