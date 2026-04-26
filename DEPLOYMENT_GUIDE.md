# SpeedCopy Client - Deployment Guide

## Backend Services (All Deployed ✅)

### Microservices URLs
- **Auth Service**: https://auth-202671058278.asia-south1.run.app/api-docs/
- **Design Service**: https://design-202671058278.asia-south1.run.app/
- **Notification Service**: https://notification-202671058278.asia-south1.run.app/
- **Admin Service**: https://admin-202671058278.asia-south1.run.app/
- **Product Service**: https://product-202671058278.asia-south1.run.app/
- **Finance Service**: https://finance-202671058278.asia-south1.run.app/
- **Gateway (Main Entry)**: https://gateway-202671058278.asia-south1.run.app/

## Vercel Environment Variables

Set these in Vercel Project Settings → Environment Variables:

```
VITE_API_URL=https://product-202671058278.asia-south1.run.app
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
VITE_TWILIO_VERIFY_SERVICE_SID=VAb0924bd6b4422558eff214e98882820
```

## Features Working ✅

- ✅ Gifting page with categories
- ✅ Shopping page with categories
- ✅ Design editor with frame loading
- ✅ Product listing
- ✅ Authentication
- ✅ Wallet integration
- ✅ Payment integration (Razorpay)
- ✅ Twilio SMS verification

## Deployment Steps

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Vercel Auto-Deploy**
   - Vercel automatically deploys on GitHub push
   - Check deployment status in Vercel dashboard

3. **Manual Redeploy** (if needed)
   - Go to Vercel dashboard
   - Click "Redeploy" button

## Testing

- Visit deployed URL
- Login with test credentials
- Navigate to Gifting/Shopping pages
- Try design editor
- Test payment flow

## Troubleshooting

### 404 on Routes
- Vercel.json configured for SPA routing ✅
- All routes redirect to index.html

### API Errors
- Check environment variables in Vercel
- Verify backend services are running
- Check browser console for detailed errors

### Frame Not Loading
- Design service has fallback to default frames
- Check authentication token in localStorage

## Notes

- All backend services are deployed on Google Cloud Run
- Client uses product service as primary API endpoint
- Error handling with graceful fallbacks implemented
- SPA routing configured for Vercel
