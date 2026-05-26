import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import carReducer from './slices/carSlice.js';
import bookingReducer from './slices/bookingSlice.js';

export default configureStore({
  reducer: {
    auth: authReducer,
    cars: carReducer,
    booking: bookingReducer,
  },
});
