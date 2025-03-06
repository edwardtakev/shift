# Employee Shift Calendar

A comprehensive web application for managing employee shifts, holiday requests, and work schedules.

## Features

- **User Authentication**: Registration, login, and role-based access control
- **Shift Management**: Create, view, and manage shift schedules
- **Holiday Requests**: Submit and approve time-off requests
- **Reporting**: Generate weekly and monthly reports for working hours
- **Admin Dashboard**: User management, shift approval, and system configuration

## Technology Stack

- **Frontend**: React.js with TypeScript, Material UI
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
shift/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components for routing
│   │   ├── contexts/     # React context providers
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API service functions
│   │   ├── utils/        # Utility functions
│   │   └── assets/       # Static assets (images, fonts, etc.)
│   ├── public/           # Public static files
│   └── package.json      # Frontend dependencies
│
├── server/               # Backend Node.js application
│   ├── controllers/      # Request handlers
│   ├── models/           # Database models
│   ├── routes/           # API route definitions
│   ├── middleware/       # Custom middleware
│   ├── config/           # Configuration files
│   ├── utils/            # Utility functions
│   └── server.js         # Entry point
│
└── README.md             # Project documentation
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB

### Installation
1. Clone the repository
2. Install frontend dependencies:
   ```
   cd client
   npm install
   ```
3. Install backend dependencies:
   ```
   cd server
   npm install
   ```

### Running the Application
1. Start the backend server:
   ```
   cd server
   npm run dev
   ```
2. Start the frontend development server:
   ```
   cd client
   npm start
   ```

## Shift Types
- **"M" (Morning shift)**: 06:48 AM to 03:00 PM
- **"A" (Afternoon shift)**: 02:48 PM to 11:00 PM
- **"N" (Night shift)**: 10:48 PM to 07:00 AM
- **"D" (Day shift)**: 09:00 AM to 06:00 PM
- **"PL" (Paid leave)**: Employee is on paid leave
- **"SL" (Sick Leave)**: Employee is on sick leave
- **"C" (Compensation)**: Employee is taking compensation
- **"NH" (National holiday)**: Employee is off for a national holiday 