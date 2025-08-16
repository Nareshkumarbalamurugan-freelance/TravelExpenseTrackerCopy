# 🚀 Travel Expense Tracker - Complete Noveltech Implementation

> **Status: PRODUCTION READY** ✅  
> A comprehensive employee travel expense tracking application with complete **Noveltech** workflow implementation.

## 🎯 **PERFECT MATCH FOR NOVELTECH REQUIREMENTS**

This application **100% implements** all the features needed for **Noveltech's** travel expense management:

### ✅ **Authentication & Employee Master**
- Employee ID and Email login ✅
- HR-only account creation (no self-registration) ✅
- Auto-load employee details (ID, Name, Grade, Designation, Entitlements) ✅
- Forgot password with OTP (phone & email ready) ✅

### ✅ **Complete Claim Categories** 
Your exact 7 categories implemented:
1. Daily Allowance
2. Toll Fee  
3. Taxi / Auto / Bus / Train / Fuel Bills
4. Lodging
5. Boarding
6. Tips Paid
7. Miscellaneous

### ✅ **Grade-Based Entitlements** (Noveltech Policy 2022-2024)
- **Complete grade hierarchy**: C Class → B Class → A Class → L5 → L4 → L3 → L2 → L1 → GM → Sr. GM → DGM → Director ✅
- **DA rates by location**: Food, Town, Capital, Metro ✅
- **Vehicle entitlements**: 2-wheeler (Below L4) → Car (L4+) ✅
- **Monthly travel limits**: Grade-based spending limits ✅

### ✅ **Fuel Rules & Entitlements**
- **L4 & Above (Sales)** → Car → 1 Litre per 7 km ✅
- **Below L4** → 2-wheeler → 1 Litre per 25 km ✅
- **Auto-calculation**: 1000 km ÷ 25 km/L = 40 litres claim ✅

### ✅ **Document Upload Rules**
- **Mandatory for ALL claims** except KM-based fuel ✅
- **Receipt validation** and file upload ✅
- **Joint working claims** with mandatory remarks ✅

### ✅ **3-Level Approval Workflow**
```
L1 (Reporting Manager) → L2 (HR) → L3 (Next Manager)
```
- **Auto-escalation** if manager resigned ✅
- **Rejection with mandatory remarks** ✅
- **Email notification ready** ✅

### 🆕 **NEW: COMPLETE ADMIN MANAGEMENT SUITE**

#### 👥 **Manager Assignment Interface**
- Assign L1/L2/L3 approval managers to employees ✅
- Real-time approval chain management ✅
- Bulk manager assignment capabilities ✅

#### 📊 **Monthly Travel Limit Dashboard**
- Monitor monthly travel expenses per employee ✅
- Grade-based spending limit enforcement ✅
- Real-time compliance checking ✅
- Over-limit alerts and warnings ✅

#### 🔧 **Policy Compliance Checker**
- Real-time validation against Noveltech policy ✅
- Fuel entitlement calculator ✅
- DA rate checker by location type ✅
- Monthly limit validator ✅

#### � **Mobile-Responsive Admin**
- Touch-friendly admin dashboard ✅
- Mobile-optimized employee management ✅
- Responsive tables and forms ✅

---

## �🚀 **QUICK START**

### 1. **Start the Application**
```bash
npm install
npm run dev
```
Access at: `http://localhost:10001`

### 2. **Admin Access**
```
URL: http://localhost:10001/admin
Login: admin / admin@noveltech
```

### 3. **Test Employee**
```
Email: employee@noveltech.com
(Register via Firebase Auth or admin creates account)
```

---

## 🏢 **NOVELTECH POLICY CONFIGURATION**

### **Employee Grades & Monthly Limits**
```javascript
Monthly Travel Limits:
├── C Class: ₹5,000/month
├── B Class: ₹7,500/month  
├── A Class: ₹10,000/month
├── L5: ₹12,000/month
├── L4: ₹15,000/month
├── L3: ₹20,000/month
├── L2: ₹25,000/month
├── L1: ₹30,000/month
├── GM: ₹35,000/month
├── Sr. GM: ₹40,000/month
├── DGM: ₹45,000/month
└── Director: ₹50,000/month
```

### **Vehicle & Fuel Entitlements**
```javascript
L4 & Above (Sales):
├── Vehicle: Car
├── Fuel: 1L per 7km  
├── Daily: ₹1,000
└── Accommodation: ₹2,000

Below L4:
├── Vehicle: 2-wheeler
├── Fuel: 1L per 25km
├── Daily: ₹500  
└── Accommodation: ₹1,000

HR Manager:
├── Vehicle: Car
├── Fuel: 1L per 7km
├── Daily: ₹1,500
└── Accommodation: ₹3,000
```

### **DA Rates by Location**
```javascript
Location-Based DA:
├── Food Only: Basic rates per grade
├── Town: Enhanced rates
├── Capital: Higher rates
└── Metro: Maximum rates
```

**Ready for immediate deployment and real-world use!** 🚀

---

*Built with ❤️ for **Noveltech** - Making travel expense management simple, accurate, and transparent.*
npm run dev
```
Access at: `http://localhost:10001`

### 2. **Admin Access**
```
URL: http://localhost:10001/admin
Login: admin / admin@poultrymitra
```

### 3. **Test Employee**
```
Email: employee@noveltech.com
(Register via Firebase Auth or admin creates account)
```

---

## 🏢 **HR SYSTEM CONFIGURATION**

### **Employee Grades & Entitlements**
```javascript
L4 & Above (Sales):
├── Vehicle: Car
├── Fuel: 1L per 7km  
├── Daily: ₹1,000
└── Accommodation: ₹2,000

Below L4:
├── Vehicle: 2-wheeler
├── Fuel: 1L per 25km
├── Daily: ₹500  
└── Accommodation: ₹1,000

HR Manager:
├── Vehicle: Car
├── Fuel: 1L per 7km
├── Daily: ₹1,500
└── Accommodation: ₹3,000
```

**Ready for immediate deployment and real-world use!** 🚀

---

*Built with ❤️ for Noveltech Feeds - Making travel expense management simple, accurate, and transparent.*

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/663f5989-a820-4dc2-a03e-facd01145edb) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
