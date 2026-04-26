# SpeedCopy Client

React + TypeScript + Vite client application for SpeedCopy platform.

## Quick Start

### Install Dependencies
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

## Environment Setup

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in your values:
```
VITE_API_URL=http://localhost:4000
VITE_RAZORPAY_KEY_ID=your_key_here
```

## Project Structure

```
src/
├── components/      # React components
├── pages/          # Page components
├── services/       # API services
├── config/         # Configuration
├── hooks/          # Custom hooks
├── utils/          # Utility functions
├── context/        # React context
└── assets/         # Images and assets
```

## Key Features

- Shopping cart with multiple product types
- Razorpay payment integration
- Wallet system
- Design editor
- Order management
- User authentication

## Recent Updates

- ✅ Added shopping.service.ts with 7 main APIs
- ✅ Added RazorpayTest component
- ✅ Added WalletAPIDemo component
- ✅ Fixed CartPage getShoppingProducts error

## Technologies

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router
- Fabric.js (design editor)

## API Integration

All API calls go through `src/services/api.service.ts` which uses Axios.

Services available:
- `productService` - Products and categories
- `orderService` - Orders and cart
- `paymentService` - Payments
- `walletService` - Wallet operations
- `authService` - Authentication
- `userService` - User profile

## Contributing

1. Create a feature branch
2. Make changes
3. Test locally
4. Push and create PR

## License

MIT
