import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Shift } from '../../types';

interface ShiftsState {
  entities: Record<string, Shift>;
  selectedDate: string | null;
  pendingApprovals: string[];
  loading: boolean;
  error: string | null;
}

const initialState: ShiftsState = {
  entities: {},
  selectedDate: null,
  pendingApprovals: [],
  loading: false,
  error: null,
};

export const shiftsSlice = createSlice({
  name: 'shifts',
  initialState,
  reducers: {
    setShifts: (state, action: PayloadAction<Shift[]>) => {
      state.entities = action.payload.reduce((acc, shift) => {
        acc[shift.id] = shift;
        return acc;
      }, {} as Record<string, Shift>);
    },
    addShift: (state, action: PayloadAction<Shift>) => {
      state.entities[action.payload.id] = action.payload;
    },
    updateShift: (state, action: PayloadAction<Shift>) => {
      state.entities[action.payload.id] = action.payload;
    },
    removeShift: (state, action: PayloadAction<string>) => {
      delete state.entities[action.payload];
    },
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload;
    },
    setPendingApprovals: (state, action: PayloadAction<string[]>) => {
      state.pendingApprovals = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setShifts,
  addShift,
  updateShift,
  removeShift,
  setSelectedDate,
  setPendingApprovals,
  setLoading,
  setError,
} = shiftsSlice.actions;

export default shiftsSlice.reducer; 