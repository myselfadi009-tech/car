import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

export const fetchUserBookings = createAsyncThunk('booking/fetchUserBookings', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/bookings/my');
    return data.bookings;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createBooking = createAsyncThunk('booking/create', async (bookingData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/bookings', bookingData);
    return data.booking;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const cancelBooking = createAsyncThunk('booking/cancel', async (id, { rejectWithValue }) => {
  try {
    await api.patch(`/bookings/${id}/cancel`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const bookingSlice = createSlice({
  name: 'booking',
  initialState: { bookings: [], currentBooking: null, loading: false, error: null },
  reducers: { setCurrentBooking: (state, action) => { state.currentBooking = action.payload; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserBookings.pending, (state) => { state.loading = true; })
      .addCase(fetchUserBookings.fulfilled, (state, action) => { state.bookings = action.payload; state.loading = false; })
      .addCase(fetchUserBookings.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createBooking.fulfilled, (state, action) => { state.currentBooking = action.payload; })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const idx = state.bookings.findIndex(b => b._id === action.payload);
        if (idx !== -1) state.bookings[idx].status = 'Cancelled';
      });
  },
});

export const { setCurrentBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
