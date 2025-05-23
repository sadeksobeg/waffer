# Coupon Platform Admin Dashboard

A comprehensive admin dashboard for managing a coupon platform, built with Next.js, Firebase, and Material-UI.

## Features

- 🔐 Secure authentication with Firebase Auth
- 🌐 Multi-language support (English & Arabic)
- 📊 Real-time analytics and statistics
- 👥 User management
- 🏪 Store management
- 🎟️ Coupon management
- 📱 Push notifications
- 📈 Data visualization
- 📱 Responsive design with RTL support

## Tech Stack

### Frontend (Admin Dashboard)
- Next.js
- TypeScript
- Material-UI
- Recharts
- next-i18next
- Firebase SDK

### Backend (Firebase)
- Firebase Authentication
- Cloud Firestore
- Cloud Functions
- Cloud Storage
- Firebase Cloud Messaging
- Firebase Hosting

## Project Structure

```
root/
│
├── functions/              # Firebase Cloud Functions
│   ├── src/               # TypeScript source files
│   └── package.json       # Functions dependencies
│
├── admin-app/             # Next.js Admin Dashboard
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Next.js pages
│   │   └── config/        # Configuration files
│   ├── public/
│   │   └── locales/       # Translation files
│   └── package.json       # Dashboard dependencies
│
└── shared/                # Shared code
    └── types/             # TypeScript interfaces
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- Firebase CLI
- Firebase project

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd coupon-platform
   ```

2. Install dependencies:
   ```bash
   # Install Functions dependencies
   cd functions
   npm install

   # Install Admin Dashboard dependencies
   cd ../admin-app
   npm install
   ```

3. Set up Firebase:
   ```bash
   # Login to Firebase
   firebase login

   # Initialize Firebase project
   firebase init
   ```

4. Configure environment variables:
   Create `.env.local` in the admin-app directory:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

### Development

1. Start the Firebase emulator:
   ```bash
   cd functions
   npm run serve
   ```

2. Start the admin dashboard:
   ```bash
   cd admin-app
   npm run dev
   ```

3. Access the dashboard at `http://localhost:3000`

### Deployment

1. Deploy Firebase Functions:
   ```bash
   cd functions
   npm run deploy
   ```

2. Deploy Admin Dashboard:
   ```bash
   cd admin-app
   npm run build
   firebase deploy --only hosting
   ```

## Security Rules

The project includes Firebase Security Rules to ensure proper access control:

- Admins have full access to all collections
- Merchants can only access their own stores and coupons
- Customers can only view public coupons and their own data

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. #   w a f f e r  
 