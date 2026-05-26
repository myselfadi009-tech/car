import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

export const fetchCars = createAsyncThunk('cars/fetchCars', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/cars', { params });
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchFeaturedCars = createAsyncThunk('cars/fetchFeatured', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/cars/featured');
    return data.cars;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchCarById = createAsyncThunk('cars/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/cars/${id}`);
    return data.car;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const carSlice = createSlice({
  name: 'cars',
  initialState: {
    cars: [], featuredCars: [], currentCar: null,
    total: 0, page: 1, pages: 1,
    loading: false, error: null, filters: {},
  },
  reducers: {
    setFilters: (state, action) => { state.filters = action.payload; },
    clearCurrentCar: (state) => { state.currentCar = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCars.pending, (state) => { state.loading = true; })
      .addCase(fetchCars.fulfilled, (state, action) => { state.cars = action.payload.cars; state.total = action.payload.total; state.page = action.payload.page; state.pages = action.payload.pages; state.loading = false; })
      .addCase(fetchCars.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchFeaturedCars.fulfilled, (state, action) => { state.featuredCars = action.payload; })
      .addCase(fetchCarById.pending, (state) => { state.loading = true; })
      .addCase(fetchCarById.fulfilled, (state, action) => { state.currentCar = action.payload; state.loading = false; })
      .addCase(fetchCarById.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { setFilters, clearCurrentCar } = carSlice.actions;
export default carSlice.reducer;
