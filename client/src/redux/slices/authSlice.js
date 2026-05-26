import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data.user;
  } catch { return rejectWithValue(null); }
});

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Login failed'); }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Registration failed'); }
});

export const googleLogin = createAsyncThunk('auth/google', async (googleData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/google', googleData);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Google login failed'); }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await api.post('/auth/logout');
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, loading: false, initialized: false, error: null },
  reducers: {
    setUser: (state, action) => { state.user = action.payload; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => { state.loading = true; })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => { state.user = action.payload; state.loading = false; state.initialized = true; })
      .addCase(fetchCurrentUser.rejected, (state) => { state.loading = false; state.initialized = true; })
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => { state.user = action.payload.user; state.token = action.payload.accessToken; state.loading = false; })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => { state.user = action.payload.user; state.token = action.payload.accessToken; state.loading = false; })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(googleLogin.fulfilled, (state, action) => { state.user = action.payload.user; state.token = action.payload.accessToken; state.loading = false; })
      .addCase(logoutUser.fulfilled, (state) => { state.user = null; state.token = null; });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
