# MediMeal Backend

A Node.js backend API for the MediMeal application with user authentication and MongoDB integration.

## Features

- ✅ User Registration & Login
- ✅ JWT Authentication
- ✅ Password Hashing with bcrypt
- ✅ MongoDB Integration
- ✅ Input Validation
- ✅ Error Handling
- ✅ CORS Support
- ✅ Environment Configuration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medimeal-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/medimeal
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   PORT=5000
   ```

4. **Start MongoDB**
   - Local: Make sure MongoDB is running on your machine
   - Cloud: Use MongoDB Atlas or any cloud MongoDB service

5. **Run the server**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Routes

#### Register User
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "_id": "user_id",
        "fullName": "John Doe",
        "email": "john@example.com",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      },
      "token": "jwt_token_here"
    }
  }
  ```

#### Login User
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "_id": "user_id",
        "fullName": "John Doe",
        "email": "john@example.com",
        "lastLogin": "2023-01-01T00:00:00.000Z"
      },
      "token": "jwt_token_here"
    }
  }
  ```

#### Get Current User Profile
- **GET** `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "_id": "user_id",
        "fullName": "John Doe",
        "email": "john@example.com",
        "profilePicture": "",
        "dateOfBirth": null,
        "gender": "prefer-not-to-say",
        "height": null,
        "weight": null,
        "medicalConditions": [],
        "allergies": [],
        "medications": [],
        "dietaryPreferences": ["none"],
        "isActive": true,
        "lastLogin": "2023-01-01T00:00:00.000Z",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    }
  }
  ```

#### Logout User
- **POST** `/api/auth/logout`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Logout successful"
  }
  ```

### Health Check
- **GET** `/api/health`
- **Response:**
  ```json
  {
    "message": "MediMeal Backend is running!",
    "timestamp": "2023-01-01T00:00:00.000Z"
  }
  ```

## User Model Schema

The User model includes comprehensive health and dietary information:

```javascript
{
  fullName: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  profilePicture: String,
  dateOfBirth: Date,
  gender: String (enum: ['male', 'female', 'other', 'prefer-not-to-say']),
  height: Number (cm),
  weight: Number (kg),
  medicalConditions: [String],
  allergies: [String],
  medications: [{
    name: String,
    dosage: String,
    frequency: String
  }],
  dietaryPreferences: [String] (enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'mediterranean', 'none']),
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"] // Optional
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials/token)
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- **Password Hashing**: Using bcrypt with salt rounds of 12
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Comprehensive validation for all inputs
- **CORS**: Cross-origin resource sharing enabled
- **Environment Variables**: Sensitive data stored in .env file

## Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

### File Structure
```
medimeal-backend/
├── models/
│   └── User.js
├── routes/
│   └── auth.js
├── middleware/
│   └── auth.js
├── server.js
├── package.json
├── .env
└── README.md
```

## Connecting to Frontend

To connect your React frontend to this backend:

1. **Update API base URL** in your frontend:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```

2. **Make API calls** from your frontend:
   ```javascript
   // Register
   const response = await fetch(`${API_BASE_URL}/auth/register`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       fullName: 'John Doe',
       email: 'john@example.com',
       password: 'password123'
     })
   });

   // Login
   const response = await fetch(`${API_BASE_URL}/auth/login`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       email: 'john@example.com',
       password: 'password123'
     })
   });

   // Protected route
   const response = await fetch(`${API_BASE_URL}/auth/me`, {
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json',
     }
   });
   ```

## Production Deployment

1. **Environment Variables**: Update `.env` with production values
2. **MongoDB**: Use MongoDB Atlas or production MongoDB instance
3. **JWT Secret**: Use a strong, unique secret key
4. **CORS**: Configure CORS for your production domain
5. **HTTPS**: Use HTTPS in production
6. **PM2**: Use PM2 for process management

## License

This project is licensed under the ISC License.


