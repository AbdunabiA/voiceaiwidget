import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Site } from '@/types';

interface SiteState {
  currentSite: Site | null;
  sites: Site[];
}

const initialState: SiteState = {
  currentSite: null,
  sites: [],
};

const siteSlice = createSlice({
  name: 'site',
  initialState,
  reducers: {
    setCurrentSite: (state, action: PayloadAction<Site | null>) => {
      state.currentSite = action.payload;
    },
    setSites: (state, action: PayloadAction<Site[]>) => {
      state.sites = action.payload;
    },
  },
});

export const { setCurrentSite, setSites } = siteSlice.actions;
export default siteSlice.reducer;
