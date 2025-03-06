# Employee Shift Calendar Application

A React-based employee shift management application that allows employees to manage their schedules and administrators to oversee shift assignments and approvals.

## Features

- **Authentication**: Login, registration, and password reset
- **Shift Calendar**: View and manage shifts with month, week, and day views
- **Shift Management**: Create, edit, and request shifts
- **Role-Based Access**: Different features for employees and admins
- **Reports**: Visualize shift data with charts and reports
- **User Management**: Admin tools for managing users

## Technical Stack

- **Frontend**: React 18+ with TypeScript
- **Routing**: React Router v6
- **State Management**: Redux Toolkit with RTK Query for API calls
- **UI Components**: Material UI
- **Forms**: React Hook Form with Yup validation
- **Calendar**: FullCalendar
- **Data Visualization**: Recharts for reports
- **Styling**: Styled-components

## Getting Started

### Prerequisites

- Node.js (v14.x or later)
- npm or yarn

### Installation

1. Clone the repository:
```
git clone https://github.com/your-username/shift-calendar.git
cd shift-calendar
```

2. Install dependencies:
```
npm install
# or
yarn install
```

3. Start the development server:
```
npm start
# or
yarn start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── assets/                 # Static assets and images
├── components/             # Reusable UI components
│   ├── common/             # Generic components (Button, Card, etc.)
│   ├── calendar/           # Calendar-related components
│   ├── forms/              # Form components
│   ├── layout/             # Layout components
│   └── reports/            # Report visualization components
├── features/               # Feature-based modules
│   ├── auth/               # Authentication related components
│   ├── shifts/             # Shift management components
│   ├── users/              # User management components
│   └── reports/            # Reporting components
├── hooks/                  # Custom React hooks
├── store/                  # Redux store configuration
│   ├── slices/             # Redux slices
│   └── api/                # RTK Query API definitions
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
├── pages/                  # Page components
├── routes/                 # Application routes
└── App.tsx                 # Root component
```

## Shift Types

The application supports the following shift types:
- **"M" (Morning shift)**: 06:48 AM to 03:00 PM
- **"A" (Afternoon shift)**: 02:48 PM to 11:00 PM
- **"N" (Night shift)**: 10:48 PM to 07:00 AM
- **"D" (Day shift)**: 09:00 AM to 06:00 PM
- **"PL" (Paid leave)**: Employee is on paid leave
- **"SL" (Sick Leave)**: Employee is on sick leave
- **"C" (Compensation)**: Taking compensation for overtime
- **"NH" (National holiday)**: Off for a national holiday

## License

[MIT](LICENSE) 