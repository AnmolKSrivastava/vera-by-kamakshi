# Quick Start Guide - Checkout & Payment System

## 🚀 Get Started in 3 Steps

### Step 1: Configure Razorpay (5 minutes)

1. **Sign up for Razorpay** (if you haven't already)
   - Visit: https://dashboard.razorpay.com/signup
   - Use your business email

2. **Get your API keys**
   - Go to: Settings → API Keys
   - Click "Generate Test Key" (for testing)
   - Copy both **Key ID** and **Key Secret**

3. **Add keys to your project**
   ```bash
   # Create .env file in project root
   cp .env.example .env
   ```
   
   Edit `.env` and add:
   ```
   REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   ```

### Step 2: Test the Checkout Flow (2 minutes)

1. **Add products to cart**
   - Browse `/collections`
   - Click "Add to Cart" on any product

2. **Go to checkout**
   - Click cart icon in navbar
   - Click "Proceed to Checkout"

3. **Fill address form**
   - Enter your details
   - Click "Continue to Payment"

4. **Test COD (easiest)**
   - Select "Cash on Delivery"
   - Click "Place Order"
   - See order confirmation!

5. **Test Online Payment** (optional - in test mode)
   - Select "UPI" or "Card"
   - Use test card: **4111 1111 1111 1111**
   - Any CVV, any future expiry
   - Complete payment

### Step 3: View Your Order (1 minute)

1. Click "View Order Details" on confirmation page
2. Or go to navbar → "My Orders"
3. See your order with tracking timeline!

## 🎮 Test Payment Methods

### Cash on Delivery
- **How**: Select COD → Place Order
- **Result**: Order created immediately ✅

### Test Cards (Razorpay Test Mode)
- **Success Card**: 4111 1111 1111 1111
- **CVV**: Any (e.g., 123)
- **Expiry**: Any future date

### Test UPI
- **VPA**: success@razorpay
- **Result**: Instant success

## 📱 Features to Try

### Guest Checkout
1. Open incognito/private window
2. Add items to cart
3. Go to checkout (no login required!)
4. Enter email for order tracking
5. Complete order as guest

### Logged-in Checkout
1. Login to your account
2. Name and phone pre-filled automatically
3. Faster checkout experience

### Order Tracking
1. Place an order
2. Go to "My Orders" in navbar
3. Click any order to see details
4. View order timeline and status

## 🎨 What You Get

### Checkout Page (`/checkout`)
- Beautiful 2-step wizard
- Address form with validation
- Payment method selection
- Live order summary
- Fully responsive

### Order Confirmation (`/order-confirmation/:orderId`)
- Success animation
- Order number and details
- Shipping address
- Payment info
- What's next timeline
- Quick actions

### My Orders Page (`/orders`)
- All orders in one place
- Filter by status
- Order search
- Order cards with images
- Quick actions (view, cancel, download)

### Order Details Page (`/orders/:orderId`)
- Complete order information
- Order tracking timeline
- Shipping address
- Payment details
- All items with images
- Price breakdown

## 🛠 For Production

When you're ready to go live:

1. **Switch to Live Mode**
   - Get live Razorpay keys from dashboard
   - Update `.env` with live keys

2. **Set Up Backend** (Important!)
   - Implement payment verification
   - Set up webhooks
   - See `CHECKOUT_PAYMENT_COMPLETE.md` for details

3. **Enable Email Notifications** (Optional)
   - Configure SendGrid or Firebase Email Extension
   - Send order confirmations
   - Send shipping updates

4. **Test Everything**
   - Test all payment methods
   - Test guest checkout
   - Test order tracking
   - Test on mobile devices

## 🎉 You're All Set!

The checkout and payment system is fully functional and ready to process orders!

**Need help?**
- Read `CHECKOUT_PAYMENT_COMPLETE.md` for detailed documentation
- Check Razorpay docs: https://razorpay.com/docs/
- Test Mode is safe - no real money charged

**Happy Selling! 🚀**
