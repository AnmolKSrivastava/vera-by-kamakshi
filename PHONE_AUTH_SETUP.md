# Phone Authentication Setup Guide

To enable OTP login with phone numbers, follow these steps to configure Firebase:

## Step 1: Enable Phone Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **vera_by_kamakshi**
3. Navigate to **Authentication** in the left sidebar
4. Click on the **Sign-in method** tab
5. Click on **Phone** in the providers list
6. Toggle **Enable** to ON
7. Click **Save**

## Step 2: Add Testing Phone Numbers (Optional - for development)

During development, you can add test phone numbers to avoid sending real SMS:

1. In **Sign-in method** tab, scroll down to **Phone numbers for testing**
2. Click **Add phone number**
3. Enter a test phone number (e.g., `+911234567890`)
4. Enter a test verification code (e.g., `123456`)
5. Click **Add**

Now you can use this test number without receiving actual SMS during development.

## Step 3: Enable reCAPTCHA (Already implemented in code)

The code already includes reCAPTCHA verification using Firebase's built-in `RecaptchaVerifier`. No additional setup needed - Firebase handles this automatically.

## Step 4: Domain Authorization

Firebase will automatically authorize:
- `localhost` for development
- Your production domain (add it in Authentication > Settings > Authorized domains when deploying)

## Step 5: SMS Quota and Billing

**Important:**
- Firebase provides a free tier for phone authentication
- Free tier includes: **10,000 verifications/month**
- Beyond that, you need to enable billing in Google Cloud
- To enable billing:
  1. Go to Firebase Console
  2. Click on **⚙️ Settings** (gear icon) → **Usage and billing**
  3. Click **Modify plan** and set up billing if needed

## Step 6: India-specific Configuration

For sending SMS to Indian phone numbers:
- Phone numbers must be in format: `+91XXXXXXXXXX` (10 digits after +91)
- Firebase uses reliable SMS providers
- No additional configuration needed

## Testing the Implementation

1. Click the **Login** button in your navbar
2. Select the **📱 Phone** tab
3. Enter a test phone number: `+911234567890` (if you added it in Step 2)
4. Click **Send OTP**
5. Enter the test OTP: `123456`
6. Click **Verify OTP**

For real phone numbers:
1. Enter your actual phone number with `+91` prefix
2. You'll receive a real SMS with OTP
3. Enter the OTP to login

## Verification

After completing these steps, your phone authentication will be fully functional!

## Troubleshooting

**Issue: reCAPTCHA not showing**
- Clear browser cache
- Check if your domain is authorized
- Check browser console for errors

**Issue: SMS not received**
- Verify phone number format (+91XXXXXXXXXX)
- Check Firebase quotas
- Try with a test number first

**Issue: "quota-exceeded" error**
- You've exceeded free tier limits
- Enable billing in Firebase Console

---

## Summary Checklist

- [ ] Enable Phone authentication in Firebase Console
- [ ] (Optional) Add test phone numbers for development
- [ ] Test OTP login with test number
- [ ] Test OTP login with real number
- [ ] Set up billing if expecting high usage

Your modern OTP + Google OAuth login system is ready! 🚀
