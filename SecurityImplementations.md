# Pre-Launch Security Implementation Guide for VERA by Kamakshi

This document outlines the security measures needed before launching the e-commerce website, prioritized for a small-scale business.

---

## 🚨 CRITICAL - Launch Blockers (Do These First)

### 1. **Complete Payment Security** ⚠️ HIGH PRIORITY
- **Implement Razorpay signature verification** in `paymentService.js` (currently marked TODO)
- **Secure webhook endpoints** from Razorpay to prevent payment tampering
- **Why critical:** Without this, fake payment confirmations could lead to fraud and financial losses

**Files to modify:**
- `src/services/paymentService.js` - Implement `verifyPaymentSignature()` function
- Backend webhook endpoint (if using Cloud Functions)

### 2. **Fix Secrets Management** 🔐
- Move Firebase config from `src/config/firebase.js` to environment variables
- Never commit API keys to GitHub (yours are currently in the repo)
- Use `.env` files locally and Firebase environment config for production
- **Why critical:** Exposed keys can lead to unauthorized access, data breaches, and billing fraud

**Action items:**
- Create `.env` file with Firebase config variables
- Update `firebase.js` to read from `process.env`
- Add `.env` to `.gitignore`
- Rotate exposed keys if already committed

### 3. **Verify HTTPS is Active** ✅
- Confirm Firebase Hosting has SSL enabled (likely already done)
- Test that all pages load with `https://`
- **Why critical:** Required for payment processing, customer trust, and data security

### 4. **Add Basic Security Headers** 🛡️
Add to `firebase.json` hosting section:
```json
"headers": [
  {
    "source": "**",
    "headers": [
      {
        "key": "X-Frame-Options",
        "value": "DENY"
      },
      {
        "key": "X-Content-Type-Options",
        "value": "nosniff"
      },
      {
        "key": "Referrer-Policy",
        "value": "strict-origin-when-cross-origin"
      },
      {
        "key": "Permissions-Policy",
        "value": "geolocation=(), microphone=(), camera=()"
      }
    ]
  }
]
```
**Why critical:** Prevents clickjacking, MIME-type sniffing, and common browser-based attacks

---

## ⚡ HIGH PRIORITY - Launch Week

### 5. **Basic Rate Limiting** (Firebase-level)
- Enable Firebase App Check to prevent API abuse
- Add basic rate limits in Firestore security rules for writes
- **Why important:** Prevents spam orders, fake accounts, and resource abuse

**Implementation:**
- Set up Firebase App Check in Firebase Console
- Add write throttling to Firestore rules

### 6. **File Upload Security**
- Add file size limits (currently missing)
- Validate file types server-side via Storage rules
- **Why important:** Prevents storage abuse, malicious file uploads, and unexpected costs

**Files to modify:**
- `storage.rules` - Add size limits and file type validation

### 7. **Legal Compliance** ✅ (Already Done)
- ✅ Privacy Policy page exists
- Ensure it mentions data collection, Razorpay usage, cookies
- Add Cookie consent banner if collecting analytics
- **Why important:** Legal requirement in most jurisdictions; builds customer trust

---

## 📊 POST-LAUNCH - Can Be Done After Going Live

### Within First Month:
- **Admin MFA** (protect admin panel from unauthorized access)
- **Centralized logging/monitoring setup** (track suspicious activity)
- **Automated daily backups** (protect against data loss)
- **Vulnerability scanning** of npm dependencies (`npm audit`)

### Within 3-6 Months:
- **Penetration testing** (identify security vulnerabilities)
- **Security audit** (third-party review)
- **CSRF protection** (prevent cross-site request forgery)
- **Advanced CSP headers** (Content Security Policy)
- **Incident response plan** (procedure for handling breaches)

---

## ✅ Quick Launch Checklist

Before you deploy to production, verify:

- [ ] **Payment signature verification implemented**
- [ ] **Webhook security added**
- [ ] **Firebase config moved to environment variables**
- [ ] **Security headers added to firebase.json**
- [ ] **HTTPS confirmed active on custom domain**
- [ ] **File upload size limits added to storage.rules**
- [ ] **Privacy policy reviewed and accurate**
- [ ] **Test a full purchase flow end-to-end**
- [ ] **Verify Firestore rules are deployed (`firebase deploy --only firestore:rules`)**
- [ ] **Check that admin access works only for admin role**
- [ ] **Test Google Sign-In and Phone OTP authentication**
- [ ] **Verify all product images load properly**
- [ ] **Check mobile responsiveness**
- [ ] **Review Firebase billing limits (set budget alerts)**

---

## 💡 Small Business Reality Check

For a small-scale launch, items marked `🔎 External/Unverified` in [securitiesSuggestions.md](securitiesSuggestions.md) (like enterprise DDoS protection, WAF, advanced monitoring) are **nice-to-haves** but not blockers.

### What Firebase Hosting Already Provides:
- ✅ HTTPS/SSL certificates (automatic)
- ✅ CDN with basic DDoS protection
- ✅ Managed infrastructure
- ✅ Automatic scaling
- ✅ 99.95% uptime SLA

### What You DON'T Need Immediately:
- ❌ Enterprise WAF (Cloudflare Pro)
- ❌ Advanced monitoring tools (Datadog/Splunk) - start with Firebase Console
- ❌ Dedicated security team
- ❌ Bug bounty program
- ❌ Penetration testing (do this after first month of operation)

---

## 📝 Implementation Priority Timeline

### **Week -1 (Before Launch)**
1. Fix payment signature verification
2. Move secrets to environment variables
3. Add security headers to firebase.json
4. Deploy and test

### **Launch Day**
1. Verify HTTPS is active
2. Run through launch checklist
3. Monitor Firebase Console for errors

### **Week +1**
1. Enable Firebase App Check
2. Add file upload size limits
3. Set up basic monitoring alerts

### **Month +1**
1. Implement admin MFA
2. Set up automated backups
3. Run npm audit and fix critical vulnerabilities

### **Month +3**
1. Consider penetration testing
2. Review and improve security posture
3. Plan for advanced security features

---

## 🔗 Related Documentation

- [securitiesSuggestions.md](securitiesSuggestions.md) - Comprehensive security assessment
- [progressReport.md](progressReport.md) - Feature implementation status
- [FIRESTORE_RULES_FIX.md](FIRESTORE_RULES_FIX.md) - Firestore security rules documentation

---

**Last Updated:** May 5, 2026
