import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

interface UsersState {
  entities: Record<string, User>;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  entities: {},
  loading: false,
  error: null,
};

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.entities = action.payload.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as Record<string, User>);
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.entities[action.payload.id] = action.payload;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.entities[action.payload.id] = action.payload;
    },
    removeUser: (state, action: PayloadAction<string>) => {
      delete state.entities[action.payload];
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
  setUsers,
  addUser,
  updateUser,
  removeUser,
  setLoading,
  setError,
} = usersSlice.actions;

export default usersSlice.reducer; 