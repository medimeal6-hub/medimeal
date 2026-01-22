# MediMeal - Enhanced Intelligent Nutrition & Medication Management System

## 🚀 Overview

MediMeal is a comprehensive healthcare platform that intelligently manages nutrition and medication interactions, providing personalized meal recommendations based on user medications and health conditions. The enhanced version includes real-time analytics, doctor-patient assignments, and automated reminder systems.

## ✨ Key Features

### 🔐 Multi-Role Authentication
- **Admin**: System management, user assignments, analytics
- **Doctor**: Patient management, food/exercise plans, analytics
- **User**: Medication tracking, meal planning, conflict detection

### 🍽️ Intelligent Food Management
- **Indian Food Dataset**: 9+ authentic Indian dishes with nutritional data
- **Real Images**: High-quality food images from Wikimedia Commons
- **Nutritional Analysis**: Complete macro and micronutrient breakdown
- **Dietary Compatibility**: Vegetarian, vegan, gluten-free, diabetic-friendly tags

### 💊 Advanced Medication Management
- **Real Medicine Database**: 5+ common medications with detailed information
- **Food-Drug Conflict Detection**: 5+ critical interaction patterns
- **Automated Reminders**: Gmail SMTP integration with cron scheduling
- **Adherence Tracking**: Real-time medication compliance monitoring

### 👥 Doctor-Patient Workflow
- **Patient Assignment**: Admin assigns patients to doctors
- **Food Plans**: Doctors create personalized meal plans
- **Exercise Plans**: Structured workout recommendations
- **Real-time Updates**: Instant synchronization across dashboards

### 📊 Live Analytics Dashboard
- **System Metrics**: User counts, growth rates, system health
- **User Analytics**: Medication adherence, safe meal percentages
- **Doctor Analytics**: Patient statistics, average adherence rates
- **Real-time Data**: Live updates from MongoDB Atlas

## 🛠️ Technology Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB Atlas** - Cloud database with live connection
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Google OAuth** - Social authentication
- **Node-cron** - Scheduled tasks
- **Nodemailer** - Gmail SMTP integration

### Frontend
- **React** + **Vite** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **Axios** - HTTP client

### External Services
- **MongoDB Atlas** - Live database cluster
- **Gmail SMTP** - Email delivery service
- **Google OAuth** - Authentication provider

## 🔧 Environment Configuration

### Live Database Connection
```env
MONGODB_URI=mongodb+srv://medi:Siya123@cluster0.iiclpkk.mongodb.net/medimeal?
```

### JWT Configuration
```env
JWT_SECRET=sia2003
JWT_EXPIRE=7d
```

### Google OAuth
```env
GOOGLE_CLIENT_ID=502401311418-uke1kd2e1ig3kcf3krns9b70iabf80dk.apps.googleusercontent.com
```

### Gmail SMTP (Live)
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=medimeal6@gmail.com
EMAIL_PASS=dnqn nkxy rqrm hrhc
EMAIL_FROM=MediMeal <noreply@medimeal.com>
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd medi/medimeal-backend
npm install
```

### 2. Start the Server
```bash
npm run dev
```

### 3. Seed the Database
```bash
# Seed with demo data
curl -X POST http://localhost:5000/api/seed
```

### 4. Test the System
```bash
# Run comprehensive workflow test
node test-complete-workflow.js
```

## 📊 Demo Data

### Seeded Users
- **Admin**: `admin@medimeal.com` / `Admin@123`
- **Doctor**: `drraj@medimeal.com` / `Doctor@123`
- **User**: `riya@medimeal.com` / `User@123`

### Indian Food Dataset
- **Idli** - 65 calories, 2g protein, 12g carbs
- **Dosa** - 120 calories, 3g protein, 16g carbs
- **Chapati** - 70 calories, 3g protein, 15g carbs
- **Rice with Dal** - 320 calories, 9g protein, 50g carbs
- **Grilled Paneer** - 180 calories, 15g protein, 6g carbs
- And 4 more authentic Indian dishes...

### Medicine Database
- **Aspirin** - Pain relief, conflicts with spicy food
- **Metformin** - Diabetes medication, avoid sugary foods
- **Atorvastatin** - Cholesterol, avoid grapefruit
- **Amoxicillin** - Antibiotic, avoid dairy products
- **Levothyroxine** - Thyroid, avoid soy and caffeine

### Food-Drug Conflicts
- **Aspirin** + **Spicy Food** = High bleeding risk
- **Metformin** + **Sugary Foods** = Blood sugar spikes
- **Atorvastatin** + **Grapefruit** = Increased side effects
- **Amoxicillin** + **Dairy** = Reduced absorption
- **Levothyroxine** + **Soy** = Poor thyroid control

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/firebase` - Firebase OAuth

### Analytics
- `GET /api/analytics/system` - System analytics (Admin)
- `GET /api/analytics/user` - User analytics
- `GET /api/analytics/doctor` - Doctor analytics

### Food & Medicine Management
- `GET /api/foods` - Get all foods
- `GET /api/medicines` - Get all medicines
- `POST /api/conflicts/check` - Check food-drug conflicts
- `POST /api/conflicts/safe-foods` - Get safe foods for medications

### Plans & Assignments
- `POST /api/plans/food` - Create food plan (Doctor)
- `POST /api/plans/exercise` - Create exercise plan (Doctor)
- `POST /api/admin/assign-patient` - Assign patient to doctor (Admin)

### Data Seeding
- `POST /api/seed` - Seed database with demo data
- `GET /api/seed/status` - Check seeding status

## 📈 Real-time Features

### Automated Reminders
- **Cron Schedule**: Runs every minute
- **Gmail Integration**: Sends medication reminders
- **Logging**: Tracks all reminder attempts
- **User Response**: Records medication adherence

### Live Dashboard Updates
- **User Counts**: Real-time user statistics
- **Adherence Rates**: Live medication compliance
- **Conflict Alerts**: Instant food-drug interaction warnings
- **Plan Updates**: Real-time doctor plan synchronization

## 🧪 Testing

### Comprehensive Workflow Test
```bash
node test-complete-workflow.js
```

### Manual Testing Steps
1. **Seed Database**: `POST /api/seed`
2. **Login as Admin**: Test system analytics
3. **Login as Doctor**: Test patient management
4. **Login as User**: Test medication tracking
5. **Check Conflicts**: Test food-drug interactions
6. **Create Plans**: Test doctor-patient workflow

## 📱 Frontend Integration

### Dashboard Components
- **AdminDashboard**: System overview, user management
- **DoctorDashboard**: Patient list, plan creation
- **UserDashboard**: Medications, safe foods, progress

### Real-time Updates
- **WebSocket Integration**: Live data synchronization
- **Toast Notifications**: Success/error feedback
- **Progress Tracking**: Visual adherence indicators

## 🔒 Security Features

### Authentication
- **JWT Tokens**: Secure session management
- **Role-based Access**: Admin/Doctor/User permissions
- **OAuth Integration**: Google and Firebase support

### Data Protection
- **Input Validation**: Comprehensive data sanitization
- **Rate Limiting**: API request throttling
- **CORS Configuration**: Cross-origin security

## 📊 Analytics & Reporting

### System Metrics
- **User Growth**: Registration trends
- **Adherence Rates**: Medication compliance
- **Conflict Detection**: Food-drug interaction alerts
- **Plan Effectiveness**: Doctor recommendation success

### Real-time Monitoring
- **Database Health**: Connection status
- **Email Delivery**: Reminder success rates
- **API Performance**: Response time tracking

## 🚀 Deployment

### Backend Deployment
- **Platform**: Render, AWS EC2, or similar
- **Database**: MongoDB Atlas (already configured)
- **Environment**: Production-ready with live credentials

### Frontend Deployment
- **Platform**: Vercel, Netlify, or similar
- **Build**: `npm run build`
- **Environment**: Production build with API integration

## 📞 Support & Maintenance

### Monitoring
- **Health Checks**: `/api/health` endpoint
- **Error Logging**: Comprehensive error tracking
- **Performance Metrics**: Real-time system monitoring

### Updates
- **Database Seeding**: Easy data refresh
- **Feature Additions**: Modular architecture
- **Security Updates**: Regular dependency updates

## 🎯 Success Metrics

### Technical Achievements
- ✅ **Live Database**: MongoDB Atlas integration
- ✅ **Real Email**: Gmail SMTP working
- ✅ **Indian Foods**: Authentic dataset with images
- ✅ **Medicine Conflicts**: Real interaction patterns
- ✅ **Doctor Workflow**: Complete assignment system
- ✅ **Analytics**: Live dashboard metrics
- ✅ **Reminders**: Automated cron system

### Business Value
- **User Experience**: Seamless multi-role workflow
- **Data Accuracy**: Real nutritional and medical data
- **Automation**: Reduced manual intervention
- **Scalability**: Cloud-ready architecture
- **Integration**: Ready for production deployment

---

## 🎉 Ready for Production!

The enhanced MediMeal platform is now a fully connected, real-data ecosystem with:
- **Live MongoDB Atlas database**
- **Working Gmail SMTP integration**
- **Real Indian food dataset with images**
- **Authentic medicine conflict patterns**
- **Complete doctor-patient workflow**
- **Live analytics and monitoring**
- **Automated reminder system**

**Start the system and test with the provided demo credentials!**


