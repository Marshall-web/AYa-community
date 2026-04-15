# Paystack Payment Integration Setup

This application uses Paystack for payment processing. Follow these steps to configure it:

## 1. Get Your Paystack API Keys

1. Sign up or log in to your Paystack account at https://dashboard.paystack.com
2. Navigate to **Settings** → **API Keys & Webhooks**
3. Copy your **Public Key** (starts with `pk_test_` for test mode or `pk_live_` for live mode)

## 2. Configure the Public Key

### Option 1: Environment Variable (Recommended)

1. Create a `.env` file in the root of your project (if it doesn't exist)
2. Add your Paystack public key:

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_YOUR_PUBLIC_KEY_HERE
```

3. Replace `pk_test_YOUR_PUBLIC_KEY_HERE` with your actual Paystack public key

### Option 2: Direct Configuration

1. Open `src/config/paystack.ts`
2. Replace `pk_test_YOUR_PUBLIC_KEY_HERE` with your actual Paystack public key:

```typescript
export const PAYSTACK_PUBLIC_KEY = "pk_test_YOUR_ACTUAL_KEY_HERE";
```

## 3. Test Mode vs Live Mode

- **Test Mode**: Use keys starting with `pk_test_` for development and testing
- **Live Mode**: Use keys starting with `pk_live_` for production

⚠️ **Important**: Never commit your live secret keys to version control!

## 4. How It Works

1. When a user makes a booking (Pool, Events, Sports, or Restaurant), they are redirected to the payment page
2. The payment page collects the user's email address
3. When the user clicks "Pay with Paystack", they are redirected to Paystack's secure payment page
4. After successful payment, the booking is automatically created in the system
5. The user is redirected back to the appropriate page

## 5. Supported Payment Methods

Paystack supports:
- Credit/Debit Cards (Visa, Mastercard, Verve)
- Mobile Money (MTN, Vodafone, AirtelTigo)
- Bank Transfer
- USSD

## 6. Testing

For test mode, you can use Paystack's test cards:
- **Card Number**: 4084084084084081
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **PIN**: Any 4 digits (for mobile money)

## 7. Webhook Setup (Optional but Recommended)

To receive real-time payment notifications:

1. Go to Paystack Dashboard → Settings → API Keys & Webhooks
2. Add a webhook URL: `https://yourdomain.com/api/paystack/webhook`
3. Select events: `charge.success`, `charge.failed`
4. Update your backend to handle webhook events

## Troubleshooting

- **"Invalid public key"**: Make sure you've set the correct public key
- **Payment not processing**: Check that you're using the correct key for your environment (test vs live)
- **Email required error**: Ensure the user enters a valid email address

For more information, visit: https://paystack.com/docs

