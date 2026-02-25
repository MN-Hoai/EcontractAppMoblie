import { create } from "zustand";

interface KycState {
    frontUri: string | null;
    backUri: string | null;
    setFrontUri: (uri: string) => void;
    setBackUri: (uri: string) => void;
    reset: () => void;
}

export const useKycStore = create<KycState>((set) => ({
    frontUri: null,
    backUri: null,
    setFrontUri: (uri) => set({ frontUri: uri }),
    setBackUri: (uri) => set({ backUri: uri }),
    reset: () => set({ frontUri: null, backUri: null }),
}));
