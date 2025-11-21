import { SearchTypeValue } from '../lib/types';

export interface SoccerSlice {
  searchInput: string;
  searchType: SearchTypeValue;
  setSearchInput: (input: string) => void;
  setSearchType: (type: SearchTypeValue) => void;
  resetSearch: () => void;
}

export interface UISlice {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export interface UserSlice {
  user: {
    id: string | null;
    name: string | null;
    email: string | null;
  } | null;
  setUser: (user: { id: string; name: string; email: string } | null) => void;
  clearUser: () => void;
}

export interface StoreState extends SoccerSlice, UISlice, UserSlice { }

