# Sera's Kitchen Frontend

A modern React TypeScript frontend for Sera's Kitchen food delivery application.

## 🚀 Features

- **Modern React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Responsive Design** for mobile and desktop
- **Admin Dashboard** for order management
- **Shopping Cart** with local storage
- **Real-time Order Tracking**
- **WhatsApp Integration**
- **Payment Processing** (M-Pesa integration)

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **State Management**: React Context

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Admin/          # Admin-specific components
│   ├── Layout/         # Layout components (Header, Footer)
│   ├── Products/       # Product-related components
│   └── UI/            # Generic UI components
├── pages/             # Page components
├── contexts/          # React contexts for state management
├── config/            # Configuration files
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=https://hamilton47.pythonanywhere.com
```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run dev:local` - Run with local backend
- `npm run dev:prod` - Run with production backend
- `npm run deploy:netlify` - Build for Netlify deployment
- `npm run clean` - Clean build files and node_modules

## 🌐 Deployment

### Netlify (Recommended)

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to Netlify:
   - Drag and drop the `dist` folder to Netlify
   - Or connect your Git repository for automatic deployments

3. Set environment variables in Netlify dashboard:
   - `VITE_API_URL`: Your backend API URL

### Manual Deployment

```bash
# Build for production
npm run build

# The dist/ folder contains all static files ready for deployment
```

## 🔧 Configuration

### Vite Configuration

The project uses Vite with optimizations for:
- Code splitting
- Asset optimization
- Development server configuration

### Tailwind CSS

Fully configured with:
- Custom color scheme
- Responsive design utilities
- Component classes

## 🔗 Backend Integration

This frontend connects to a Flask backend API. Ensure your backend:

1. **CORS Configuration**: Allows requests from your frontend domain
2. **API Endpoints**: Matches the expected routes
3. **Authentication**: Handles JWT tokens properly

## 📱 Features Overview

### Customer Features
- Browse products with filters and search
- Add items to cart
- Secure checkout process
- Order tracking
- WhatsApp chat integration

### Admin Features
- Product management (CRUD operations)
- Order management and status updates
- Payment verification
- Today's specials management
- WhatsApp dashboard

## 🎨 Styling

The application uses a modern design with:
- Clean, minimalist interface
- Smooth animations and transitions
- Mobile-first responsive design
- Consistent color scheme and typography

## 🔒 Security

- Content Security Policy headers
- XSS protection
- Secure environment variable handling
- JWT token management

## 📊 Performance

Optimized for performance with:
- Code splitting and lazy loading
- Image optimization
- Bundle size optimization
- Caching strategies

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Check Node.js version (18+ required)
2. **API Connection**: Verify VITE_API_URL environment variable
3. **CORS Errors**: Ensure backend allows your frontend domain

### Development

```bash
# Clear cache and reinstall
npm run fresh-install

# Test backend connection
npm run test-backend
```

## 📄 License

This project is part of Sera's Kitchen application.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

Built with ❤️ for Sera's Kitchen