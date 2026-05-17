# Implementation Plan - Academix Teacher Mobile App (React Native / Expo)

Build a dedicated, standalone React Native mobile application (`teacher_app_rn`) for teachers to streamline daily classroom attendance via Smart QR Code scanning and manual roster management.

## User Review Required

> [!IMPORTANT]
> **Fully Automated Credentials & Class Assignment:** When an Admin adds a teacher in the web dashboard, the system will **automatically generate** both the `Staff ID` (e.g., TCH-8291) and the `4-Digit Key` (e.g., 4821). The Admin will also assign specific classes (e.g., Class 10A, Class 10B) to the teacher.

> [!NOTE]
> Upon login via `POST /api/school/staff-login`, the mobile app receives the teacher's profile along with their assigned classes. The mobile dashboard and attendance screens will feature a **Class Selector dropdown**, allowing teachers to seamlessly filter students and take classwise attendance.

---

## Proposed Architecture & Directory Structure

### 1. Backend Additions (`backend/`)
- **Supabase Table `staff`**:
  - Columns: `id` (UUID), `school_id` (UUID), `staff_id` (TEXT, auto-generated), `name` (TEXT), `role` (TEXT), `contact` (TEXT), `assigned_classes` (TEXT, comma-separated e.g. "10A,10B,9A"), `staff_key` (TEXT, auto-generated 4-digit PIN), `status` (TEXT).
- **New Staff Endpoints (`routes/school.js` & `controllers/schoolController.js`)**:
  - `POST /api/school/staff`: Admin adds staff. Accepts `name`, `contact`, `assignedClasses`. Auto-generates `staffId` (e.g., `TCH-` + 4 random digits) and `staffKey` (4 random digits).
  - `GET /api/school/staff`: Lists all staff/teachers for the school.
  - `PUT /api/school/staff/:id`: Updates staff details (e.g., modifying assigned classes or resetting the 4-digit key).
  - `DELETE /api/school/staff/:id`: Removes a staff member.
  - `POST /api/school/staff-login`: Public endpoint for mobile app login. Validates `staff_id` and `staff_key`, returning a signed JWT token and staff profile including `assigned_classes`.

### 2. Frontend Additions (`frontend/`)
- **Staff Management UI (`src/pages/Staff.jsx`)**:
  - A new page in the Admin Web Dashboard where administrators view all teachers.
  - Clicking "Add Teacher" opens a modal asking for Name, Contact, and Assigned Classes (multi-select or comma-separated).
  - Displays the auto-generated Staff ID and 4-Digit Key in a beautiful card format so the Admin can easily share them with teachers.

### 3. Mobile App (`teacher_app_rn/`)
```text
teacher_app_rn/
├── App.js                      # Main application entry point & Navigation Stack
├── app.json                    # Expo configuration
├── package.json                # Dependencies & scripts
└── src/
    ├── context/
    │   └── AuthContext.js      # Authentication, session persistence & class state
    ├── screens/
    │   ├── LoginScreen.js      # Staff ID & 4-Digit Key login interface
    │   ├── DashboardScreen.js  # Main dashboard showing daily stats & Class Selector dropdown
    │   ├── ScannerScreen.js    # Live camera QR code scanner filtering by selected class
    │   └── ManualRosterScreen.js # Manual attendance list filtered by selected class
    ├── services/
    │   └── api.js              # Axios API client configured with JWT interceptors
    └── theme/
        └── colors.js           # Premium curated color palette & styling tokens
```

---

## Key Features & Screen Flows

### 1. Authentication Flow (`LoginScreen.js`)
- **Automated PIN Login**: Teachers log in using their auto-generated **Staff ID** (e.g., TCH-8291) and **4-Digit Key** (e.g., 4821).
- **Session Persistence**: JWT tokens and teacher profile data (including `assigned_classes`) are securely persisted using `@react-native-async-storage/async-storage`.
- **Premium UI**: Features a beautiful, modern login screen with sleek PIN inputs, smooth micro-animations, and support for Academix branding.

### 2. Teacher Dashboard (`DashboardScreen.js`)
- **Header & Class Selector**: Displays the logged-in teacher's name, school name/logo, and a prominent **Class Selector Picker** populated with their assigned classes.
- **Classwise Daily Metrics**: Shows live attendance statistics specifically for the currently selected class.
- **Action Grid**:
  - **📷 Smart QR Scanner**: Opens the live camera scanner kiosk for the selected class.
  - **📝 Manual Roster**: Opens the student list for the selected class.
  - **🔄 Reset Daily Attendance**: Allows resetting today's markings for the selected class with a confirmation prompt.

### 3. Smart QR Scanner (`ScannerScreen.js`)
- **Live Camera Integration**: Utilizes `expo-camera` to scan student QR ID cards in real-time.
- **Classwise Validation**: Validates that the scanned student belongs to the currently selected class before marking them Present.
- **Visual & Haptic Feedback**: Displays a gorgeous success overlay/popup with the scanned student's name, roll number, and timestamp, allowing continuous rapid scanning.

### 4. Manual Attendance Roster (`ManualRosterScreen.js`)
- **Classwise Roster**: Fetches the daily student roster filtered by the currently selected class.
- **Interactive Toggles**: Provides easy one-touch buttons (Present, Absent, Late) for each student.
- **Parent Notification Trigger**: Includes a quick action button to instantly notify parents if a student is marked Absent or Late.

---

## Execution Phases

### Phase 1: Backend Staff Management & Login API
1. Update `schoolController.js` and `routes/school.js` to add `POST /api/school/staff`, `GET /api/school/staff`, `PUT /api/school/staff/:id`, `DELETE /api/school/staff/:id`, and `POST /api/school/staff-login`.
2. Implement fully automated generation of `staff_id` and `staff_key`, along with graceful Supabase table creation/error handling for `staff`.

### Phase 2: Frontend Staff UI
1. Create `Staff.jsx` in the React frontend.
2. Add "Staff / Teachers" navigation item to `Sidebar.jsx` for Admin users.
3. Implement modal form for adding teachers with Assigned Classes and displaying their auto-generated credentials.

### Phase 3: Mobile App Initialization & Navigation Setup
1. Create the `teacher_app_rn` directory and initialize a clean Expo project (`package.json`, `app.json`).
2. Install core dependencies: `expo`, `react-native`, `@react-navigation/native`, `@react-navigation/native-stack`, `axios`, `@react-native-async-storage/async-storage`, `expo-camera`, `lucide-react-native`, `expo-linear-gradient`, `expo-status-bar`, `react-native-safe-area-context`, `react-native-screens`, `@react-native-picker/picker`.
3. Set up `App.js` with React Navigation and `AuthContext`.

### Phase 4: Mobile API Integration & PIN Authentication
1. Implement `src/services/api.js` with Axios instance and token injection.
2. Build `AuthContext.js` to manage Staff ID + 4-digit key login state, assigned classes, and token storage.
3. Create `LoginScreen.js` with Staff ID and 4-digit PIN input.

### Phase 5: Dashboard & Classwise Attendance
1. Implement `DashboardScreen.js` with the Class Selector dropdown and classwise metrics.
2. Build `ManualRosterScreen.js` with searchable student list filtered by selected class.
3. Implement `ScannerScreen.js` using `expo-camera` with classwise validation and rapid scan success overlay.

---

## Verification Plan

### Automated & API Verification
- Verify Admin ability to create staff with auto-generated Staff ID, 4-digit key, and assigned classes via `POST /api/school/staff`.
- Verify teacher login via `POST /api/school/staff-login` returning correct `assigned_classes`.

### Manual Verification
- **Admin UI**: Ensure Admin can assign classes, view auto-generated credentials, and manage staff from the web dashboard.
- **Classwise Filtering**: Ensure selecting a class in the mobile app correctly updates the student roster and metrics.
- **QR Scanning**: Simulate QR code scans to confirm attendance is marked correctly for the selected class.
