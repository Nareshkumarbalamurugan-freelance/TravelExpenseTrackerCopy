# 🚀 Render Deployment Guide - Noveltech Travel Expense Tracker

## **Quick Deployment Steps**

### **1. Login to Render**
- Go to [render.com](https://render.com)
- Sign in with your GitHub account

### **2. Create New Web Service**
- Click **"New +"** → **"Web Service"**
- Connect your GitHub repository: `Nareshkumarbalamurugan/TravelExpenseTracker`
- Select the `main` branch

### **3. Configure Build Settings**

#### **Basic Settings:**
```
Name: noveltech-travel-expense-tracker
Region: Oregon (US West) or Singapore (Asia)
Branch: main
```

#### **Build & Deploy Settings:**
```
Runtime: Node
Build Command: npm install --include=dev && npm run build
Start Command: npm run serve
```

#### **Alternative Start Commands:**
```
Option 1: npm run serve (direct vite preview)
Option 2: npm run serve-alt (uses render-start.js)
Option 3: npx vite preview --host 0.0.0.0 --port $PORT
```

#### **Alternative Build Commands:**
```
Option 1: npm install && npm run build
Option 2: npm ci && npm run build
Option 3: npm install --include=dev && npx vite build
```

#### **Advanced Settings:**
```
Node Version: 20.17.0 (specified in .node-version file)
Auto-Deploy: Yes
```

### **4. Environment Variables**
Add these in the **Environment** tab:

```
NODE_ENV=production
PORT=10000
```

#### **Firebase Configuration (Required):**
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### **5. Deploy**
- Click **"Create Web Service"**
- Wait for deployment (usually 5-10 minutes)
- Your app will be available at: `https://noveltech-travel-expense-tracker.onrender.com`

---

## **Alternative: One-Click Deploy**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Nareshkumarbalamurugan/TravelExpenseTracker)

---

## **Production URLs**

### **Main Application:**
- Employee Dashboard: `https://your-app.onrender.com/`
- Admin Dashboard: `https://your-app.onrender.com/admin`
- Manager Dashboard: `https://your-app.onrender.com/manager`

### **Health Check:**
- Health Endpoint: `https://your-app.onrender.com/healthz`

---

## **Firebase Setup Required**

### **1. Firebase Console Setup**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `expensetracker-c25fd`
3. Go to **Project Settings** → **General**
4. Copy the Firebase config

### **2. Update Environment Variables**
Add your Firebase config to Render environment variables (see Step 4 above)

### **3. Configure Firestore Rules**
Make sure your `firestore.rules` are deployed:
```bash
firebase deploy --only firestore:rules
```

---

## **Post-Deployment Checklist**

### ✅ **Verify Deployment**
- [ ] App loads successfully
- [ ] Admin login works (`admin@noveltech`)
- [ ] Employee registration works
- [ ] Firebase connection established
- [ ] Claims submission works
- [ ] Manager assignment works
- [ ] Mobile responsiveness confirmed

### ✅ **Security Checklist**
- [ ] Firebase rules properly configured
- [ ] Authentication working
- [ ] Admin access restricted
- [ ] HTTPS enabled (automatic on Render)

### ✅ **Performance Optimization**
- [ ] Build size acceptable (<50MB)
- [ ] Load time under 3 seconds
- [ ] Mobile performance optimized

---

## **Troubleshooting**

### **Common Issues:**

#### **1. Build Fails - "vite: not found" or "Cannot find package 'vite'"**
**Root Cause**: Vite is in devDependencies but npm install skips dev dependencies in production

**Solutions**:
1. **Use --include=dev flag** (recommended):
   ```
   Build Command: npm install --include=dev && npm run build
   ```

2. **Move vite to dependencies** (already done):
   - Vite and @vitejs/plugin-react-swc moved to regular dependencies

3. **Use Node 20.17.0** (already set):
   ```
   20.17.0
   ```

4. **Alternative build commands**:
   ```
   npm install && npm run build
   npm ci && npm run build  
   npm install --include=dev && npx vite build
   ```

#### **2. Start Command Fails - "require is not defined in ES module scope"**
**Root Cause**: render-start.js uses CommonJS syntax but package.json has "type": "module"

**Solutions**:
1. **Use direct vite preview** (recommended):
   ```
   Start Command: npm run serve
   ```
   This runs: `vite preview --host 0.0.0.0 --port $PORT`

2. **Alternative start commands**:
   ```
   npx vite preview --host 0.0.0.0 --port $PORT
   npm run serve-alt (uses updated render-start.js)
   ```

3. **Fixed render-start.js** (already updated):
   - Now uses ES module syntax (import instead of require)

#### **3. Host Not Allowed Error**
**Error**: `Blocked request. This host is not allowed.`

**Solution**: Update `vite.config.ts` to allow Render hosts (already fixed):
```typescript
preview: {
  host: "0.0.0.0",
  port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
  allowedHosts: [
    "noveltech-expense-tracker.onrender.com",
    "localhost",
    "127.0.0.1"
  ]
}
```

#### **4. Build Fails - General Issues**
- Check Node version (should be 18)
- Verify all dependencies in package.json
- Check build logs in Render dashboard

#### **2. Firebase Connection Issues**
- Verify environment variables are set correctly
- Check Firebase project settings
- Ensure Firestore rules allow read/write

#### **3. Routing Issues**
- Verify `_redirects` file in public folder
- Check React Router configuration

#### **4. Performance Issues**
- Enable gzip compression
- Check bundle size with `npm run build`
- Optimize images and assets

---

## **Custom Domain Setup**

### **1. Add Custom Domain**
- Go to Render dashboard → Settings → Custom Domains
- Add your domain: `travel.noveltech.com`

### **2. Configure DNS**
Point your domain to Render:
```
Type: CNAME
Name: travel (or @)
Value: your-app.onrender.com
```

### **3. SSL Certificate**
Render automatically provisions SSL certificates for custom domains.

---

## **Monitoring & Maintenance**

### **Logs**
- View deployment logs in Render dashboard
- Monitor application logs for errors
- Set up error alerts

### **Updates**
- Push to `main` branch for auto-deployment
- Monitor build status
- Test thoroughly before production deployments

---

**🎉 Your Noveltech Travel Expense Tracker is now ready for production deployment!**
