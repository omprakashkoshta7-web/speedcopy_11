# Backend Services Documentation

## Microservices URLs

### Auth Service
https://auth-202671058278.asia-south1.run.app/api-docs/

### Design Service
https://design-202671058278.asia-south1.run.app/

### Notification Service
https://notification-202671058278.asia-south1.run.app/

### Admin Service
https://admin-202671058278.asia-south1.run.app/

### Product Service
https://product-202671058278.asia-south1.run.app/

### Finance Service
https://finance-202671058278.asia-south1.run.app/

### Gateway (Main Entry Point)
https://gateway-202671058278.asia-south1.run.app/

## Configuration

Set `VITE_API_URL` to the Gateway URL in your environment:
```
VITE_API_URL=https://gateway-202671058278.asia-south1.run.app
```

The gateway routes all requests to appropriate microservices.
