# DON BOSCO ACADEMY — Single-School Management System & Web Portal

Official Single-School Management System, ERP, and Public Web Portal for **DON BOSCO ACADEMY**, Raipur Bazar, Nanpur, Sitamarhi (Bihar) - 843326.

Built with **React**, **TypeScript**, **Tailwind CSS**, **Vite**, and **Supabase (PostgreSQL & Storage)**.

---

## 🏛️ School Identity

- **School Name**: DON BOSCO ACADEMY
- **Campus Location**: Raipur Bazar, Nanpur, Sitamarhi, Bihar, India (843326)
- **Official Email**: `donboscoacademy002@gmail.com`
- **Helpline Phone**: `+91 91024 35126`
- **School Type**: Residential Cum Day School
- **Established**: 1997
- **Academic Pattern**: CBSE Pattern
- **Classes**: Play Group to Class 10th (Play, Nursery, LKG, UKG, Class 1–10)
- **Motto / Tagline**: **KNOWLEDGE IS POWER**
- **Facebook**: [https://www.facebook.com/donboscoacademy002](https://www.facebook.com/donboscoacademy002)

---

## 🌟 Key Features

1. **🌐 16-Section Public School Website**:
   - Header with contact & social links
   - Official School Logo & Badges (ESTD 1997, CBSE)
   - Navigation Menu
   - Main Hero Banner & Highlights
   - School Introduction & Heritage
   - About Don Bosco Academy (Vision, Mission, Values)
   - Principal's Desk & Leadership Address
   - CBSE Academic Curriculum Information
   - Comprehensive Class Structure (Play to 10th)
   - Campus Facilities (Smart Classrooms, Labs, Hostel, Transport, Sports)
   - Admissions 2026-27 with interactive **Online Application Form**
   - Co-Curricular Activities & Events
   - Live Notice Board & Circulars
   - Campus Contact Section with Email, Call & Facebook buttons
   - Interactive Google Maps location card
   - Institutional Footer with Accreditation details

2. **🎨 Admin School Branding Manager (`/school/branding` & `/admin/branding`)**:
   - Manage and upload School Logo, Main Banner, Admission Banner, Announcement Banner, Header Banner, Principal Photo, Principal Signature, Official School Stamp, Certificate Background, and Marksheet Background.
   - Live brand sandbox for real-time visual previews of Website Header, Academic Certificate, and Marksheet.
   - Synchronized with Supabase Storage bucket (`school-branding`).

3. **📊 Academic & Operations ERP**:
   - Classes, Sections & Subjects Management
   - Student Directory & Bulk Excel / CSV Onboarding
   - Faculty & Staff Directory
   - Daily Roll Call & Attendance Tracking
   - Fee Structures, Collection & Printable Receipts
   - Examination Scheduling & Marks Entry (Theory + Practical)
   - Automated Results Engine (GPA, Percentages, Grades, Topper Rankings)

4. **📜 Cryptographic Document Studio & QR Verification**:
   - Automated CBSE Marksheets & Report Cards
   - Academic Excellence, Character & Transfer Certificates
   - Examination Admit Cards / Hall Tickets
   - Student & Staff Identity Cards (CR-80 Portrait)
   - Public Verification Portal (`/verify` & `/verify/:code`) with official seal verification.

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/mdshami5036/DON-BOSCO-ACADEMY.git
cd DON-BOSCO-ACADEMY
npm install
```

### 2. Environment Setup
Configure your Supabase credentials in `.env`:
```env
VITE_SUPABASE_URL=https://dmwxhbdibiepcyqizhpr.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_USP426i3EVcoQz0tw4vD7Q_lkDchsUo
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 🔒 License & Copyright
© 1997 - 2026 **DON BOSCO ACADEMY**. All Rights Reserved.
