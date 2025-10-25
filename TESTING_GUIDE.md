# 🏥 Doctor Dashboard System - Testing Guide

This guide will help you test the complete doctor dashboard system that matches the provided image exactly.

## 🚀 Quick Start

### 1. Start the Backend Server
```bash
cd medi/medimeal-backend
npm install
npm start
```
Server will start on `http://localhost:5000`

### 2. Start the Frontend Server
```bash
cd medi/medimeal-frontend
npm install
npm start
```
Frontend will start on `http://localhost:3000`

### 3. Seed Test Data (Optional)
```bash
cd medi/medimeal-backend
node scripts/seed-test-data.js
```

## 🔑 Test Credentials

### Admin User
- **Email:** `admin@test.com`
- **Password:** `Admin123!`
- **Role:** admin

### Doctor Users
- **Email:** `doctor@test.com`
- **Password:** `Doctor123!`
- **Role:** doctor (Cardiology)

- **Email:** `doctor2@test.com`
- **Password:** `Doctor123!`
- **Role:** doctor (Neurology)

### Patient Users
- **Email:** `patient@test.com`
- **Password:** `Patient123!`
- **Role:** user

- **Email:** `patient2@test.com`
- **Password:** `Patient123!`
- **Role:** user

## 🧪 Testing Scenarios

### Scenario 1: Admin Creates Doctor Account
1. Go to `http://localhost:3000/login`
2. Login with admin credentials
3. Click "Add Doctor" button
4. Fill in doctor details and submit
5. Verify doctor is created successfully

### Scenario 2: Admin Assigns Patient to Doctor
1. In admin dashboard, click "Assign Patient"
2. Select a patient and doctor
3. Enter ward number (e.g., #999999)
4. Set priority level
5. Add diagnosis and treatment plan
6. Submit assignment

### Scenario 3: Doctor Login and Dashboard
1. Go to `http://localhost:3000/login`
2. Login with doctor credentials
3. Should redirect to doctor dashboard
4. Verify all dashboard elements are present:
   - ✅ Left sidebar with Mediczen™ logo
   - ✅ Navigation menu
   - ✅ Header with greeting and patient count
   - ✅ Stats cards (Beds: 86, Doctors: 126, Ambulances: 32)
   - ✅ Patient list with ward numbers and priorities
   - ✅ Calendar with June 2023
   - ✅ Schedule section with time slots

### Scenario 4: Doctor Patient Management
1. View assigned patients in dashboard
2. Check patient details (name, age, ward number, priority)
3. Verify priority colors (red=high, blue=medium, green=low)
4. Click on patient to view/update details

### Scenario 5: Schedule Management
1. Check calendar section
2. Verify time slots and activities
3. Check activity colors (blue=surgery, green=checkup, red=lunch)
4. Update schedule status and add notes

## 🔧 API Testing

### Automated Tests
```bash
cd medi/medimeal-backend
node scripts/test-doctor-system.js
```

### Quick Test
```bash
cd medi/medimeal-backend
node scripts/quick-test.js
```

### Manual API Testing
Use Postman or curl to test endpoints:

```bash
# Test doctor dashboard
curl -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
     http://localhost:5000/api/doctor/dashboard

# Test patient assignments
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     http://localhost:5000/api/admin/patient-assignments
```

## 📊 Expected Dashboard Elements

The doctor dashboard should match the provided image exactly:

### Left Sidebar
- Mediczen™ logo with arrow
- Search bar
- Navigation menu (Dashboard, Schedules, Patients, Appointments, Billing)
- Data Visualization section (Echarts, Morris Charts)
- Support section (Help Center, Settings)
- Working Track widget with current date/time

### Main Content
- Header with greeting and patient count
- Three stats cards with mini charts:
  - Beds: 86 available
  - Doctors: 126 available
  - Ambulances: 32 available
- Patient list table with:
  - Patient names and ages
  - Ward numbers
  - Priority levels with color coding
  - Start/end dates
- Calendar section:
  - June 2023 header
  - Event legend (blue=surgery, red=poynton, green=evaluation)
  - Calendar grid with highlighted dates
- Schedule section:
  - Time-based grid (09:00-16:00)
  - Daily activities (checkup, lunch, surgery, evaluation)
  - Color-coded activities

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file

2. **Port Conflicts**
   - Check if ports 3000 and 5000 are available
   - Kill existing processes if needed

3. **Authentication Issues**
   - Verify JWT_SECRET is set in .env
   - Check token expiration

4. **CORS Issues**
   - Verify CORS configuration in server.js
   - Check allowed origins

5. **Frontend Not Loading**
   - Check if backend is running
   - Verify API endpoints are accessible
   - Check browser console for errors

### Debug Steps

1. **Check Server Logs**
   ```bash
   # Backend logs
   cd medi/medimeal-backend
   npm start

   # Frontend logs
   cd medi/medimeal-frontend
   npm start
   ```

2. **Verify Environment Variables**
   ```bash
   # Check .env file exists and has required variables
   cat medi/medimeal-backend/.env
   ```

3. **Test API Endpoints**
   ```bash
   # Health check
   curl http://localhost:5000/api/health
   ```

## ✅ Success Criteria

The system is working correctly if:

- ✅ Admin can create doctor accounts
- ✅ Admin can assign patients to doctors
- ✅ Doctors can log in and see their dashboard
- ✅ Dashboard displays all required elements from the image
- ✅ Patient list shows assigned patients with correct details
- ✅ Calendar and schedule sections are functional
- ✅ All API endpoints return correct data
- ✅ Role-based access control works properly
- ✅ Priority colors and status indicators work
- ✅ Time tracking and schedule management work

## 📞 Support

If you encounter issues:

1. Check browser console for JavaScript errors
2. Check backend server logs for API errors
3. Verify all environment variables are set
4. Ensure all dependencies are installed
5. Check MongoDB connection and data

## 🎯 Key Features to Test

### Admin Features
- Create doctor accounts with credentials
- Assign patients to doctors
- Set ward numbers and priorities
- View all assignments and statistics

### Doctor Features
- Login with admin-generated credentials
- View assigned patients
- See hospital statistics
- Manage schedule and time slots
- Update patient information
- View calendar with events

### System Features
- Role-based authentication
- Automatic redirects based on user role
- Real-time dashboard updates
- Responsive design
- Priority color coding
- Schedule management

## 📱 Mobile Testing

The dashboard is responsive and should work on:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Tablet devices
- Mobile phones

Test the responsive design by resizing the browser window or using device emulation in browser dev tools.

---

**Happy Testing! 🎉**

The doctor dashboard system is now fully functional and ready for use. All features from the provided image have been implemented and tested.












