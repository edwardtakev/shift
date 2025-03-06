# Employee Shift Calendar Website

## Objective

Create a website to manage employee shifts, where users can create accounts, suggest working hours, request holidays, and receive reports on their working hours. Admins will manage user accounts, approve shift requests, and ensure that shifts are appropriately assigned.

---

## Core Features

### 1. **User Accounts**
   - **Registration**: Users can create their own accounts (name, email, password).
   - **User Panel**:
     - Suggest when they want to work and when they wish to go on holiday.
     - View and edit their shift schedule.
     - View reports on hours worked (weekly and monthly).
   - **Admin Panel**:
     - Admins can create new users and manage user accounts (add, edit, delete).
     - Admins approve or reject user shift requests and holiday suggestions.
   
### 2. **Shift Types**
   The system will have the following shift types with designated working hours:
   - **"M" (Morning shift)**: 06:48 AM to 03:00 PM
   - **"A" (Afternoon shift)**: 02:48 PM to 11:00 PM
   - **"N" (Night shift)**: 10:48 PM to 07:00 AM
   - **"D" (Day shift)**: 09:00 AM to 06:00 PM
   - **"PL" (Paid leave)**: Employee is on paid leave.
   - **"SL" (Sick Leave)**: Employee is on sick leave.
   - **"C" (Compensation)**: Employee is taking compensation for previously worked overtime.
   - **"NH" (National holiday)**: Employee is off for a national holiday.

### 3. **Shift Calendar**
   - Employees can add their shifts to the calendar by selecting the appropriate time slot ("M", "A", "N", "D", "PL", "SL", "C", "NH").
   - **Shift Alerts**: The system should send an alert if any day is missing a required shift ("M", "A", or "N").
   - Only admins can add or edit shifts on the calendar.

### 4. **Reports**
   - **Weekly Report**: Calculate and display the total working hours for each user for a specific week.
   - **Monthly Report**: Calculate and display the total working hours for each user for a specific month.
   - Reports should include all shifts worked (M, A, N, D, PL, SL, C, NH) for each user.

### 5. **Shift Suggestions & Approvals**
   - **User Shift Suggestions**: Users can suggest preferred shifts for upcoming weeks.
   - **Holiday Requests**: Users can submit requests for time off, specifying dates for holidays.
   - **Admin Approvals**: Admins will receive notifications for shift and holiday requests and can approve or reject them.

### 6. **Permissions & Access Control**
   - **Admins**:
     - Can manage users (add, edit, delete).
     - Can approve/reject shift and holiday suggestions.
     - Can edit the calendar to assign shifts.
   - **Users**:
     - Can view their shift schedule and reports.
     - Can suggest shifts and holidays but cannot make permanent changes.
     - Cannot access other users' data or modify the calendar.

---

## Technical Requirements

- **Frontend**: Design a user-friendly interface with distinct panels for users and admins.
  - User panel for shift and holiday management.
  - Admin panel for managing users and approving requests.
  - Responsive layout for ease of use across devices.
  
- **Backend**:
  - User authentication (sign up, login, password reset).
  - Shift and holiday management system with status (approved, pending, rejected).
  - Admin controls for managing user accounts and calendar shifts.
  
- **Database**:
  - Store user information (name, email, password, shift schedules, reports).
  - Store shift types and user shift requests.
  
- **Alerts & Notifications**:
  - Send email or in-app alerts for missing shifts or shift approvals.

---

## Deliverables

- A fully functional website with user registration, shift scheduling, and reporting.
- Admin control panel for managing users and approving shift/holiday requests.
- Working shift calendar with alerts for missing shifts and approval workflow.
- User reports for working hours (weekly/monthly).
  
---

## Milestones & Timeline

1. **Week 1**: 
   - Set up the project structure (frontend, backend, database).
   - Implement user registration, login, and authentication.
   - Build the basic user dashboard and admin panel layout.

2. **Week 2**: 
   - Implement shift management system (adding, editing, viewing shifts).
   - Develop shift suggestions and holiday request features for users.
   - Create admin approval system for shift and holiday requests.

3. **Week 3**:
   - Implement reporting features for weekly and monthly hours.
   - Set up shift alerts and notifications for missing shifts.
   - Finalize the user interface (responsive design, accessibility).

4. **Week 4**: 
   - Testing and bug fixing.
   - User acceptance testing and deployment.

---

## Conclusion

This project aims to streamline employee shift management while providing users with the ability to suggest shifts and request holidays, and allowing admins to manage and approve these actions. It should offer a user-friendly experience while maintaining an efficient backend for handling shift assignments and reports.
