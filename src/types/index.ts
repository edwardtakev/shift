// User-related types
export enum UserRole {
  EMPLOYEE = 'employee',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  position?: string;
  avatar?: string;
}

// Shift-related types
export enum ShiftType {
  MORNING = 'M',
  AFTERNOON = 'A',
  NIGHT = 'N',
  DAY = 'D',
  PAID_LEAVE = 'PL',
  SICK_LEAVE = 'SL',
  COMPENSATION = 'C',
  NATIONAL_HOLIDAY = 'NH',
}

export interface ShiftTime {
  start: string;
  end: string;
}

export const SHIFT_TIMES: Record<ShiftType, ShiftTime> = {
  [ShiftType.MORNING]: { start: '06:48', end: '15:00' },
  [ShiftType.AFTERNOON]: { start: '14:48', end: '23:00' },
  [ShiftType.NIGHT]: { start: '22:48', end: '07:00' },
  [ShiftType.DAY]: { start: '09:00', end: '18:00' },
  [ShiftType.PAID_LEAVE]: { start: '00:00', end: '00:00' },
  [ShiftType.SICK_LEAVE]: { start: '00:00', end: '00:00' },
  [ShiftType.COMPENSATION]: { start: '00:00', end: '00:00' },
  [ShiftType.NATIONAL_HOLIDAY]: { start: '00:00', end: '00:00' },
};

export enum ShiftStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface Shift {
  id: string;
  userId: string;
  date: string;
  type: ShiftType;
  status: ShiftStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// Notification-related types
export enum NotificationType {
  SHIFT_APPROVED = 'shift_approved',
  SHIFT_REJECTED = 'shift_rejected',
  SHIFT_REQUESTED = 'shift_requested',
  SHIFT_UPDATED = 'shift_updated',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;
} 