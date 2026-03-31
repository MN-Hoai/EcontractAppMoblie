import { create } from "zustand";

interface KycState {
    frontUri: string | null;
    backUri: string | null;
    faceUri: string | null;
    requestId: string | null;  // Trả về từ API sau khi upload ảnh KYC
    setFrontUri: (uri: string) => void;
    setBackUri: (uri: string) => void;
    setFaceUri: (uri: string) => void;
    setRequestId: (id: string) => void;
    reset: () => void;
}

export const useKycStore = create<KycState>((set) => ({
    frontUri: null,
    backUri: null,
    faceUri: null,
    requestId: null,
    setFrontUri: (uri) => set({ frontUri: uri }),
    setBackUri: (uri) => set({ backUri: uri }),
    setFaceUri: (uri) => set({ faceUri: uri }),
    setRequestId: (id) => set({ requestId: id }),
    reset: () => set({ frontUri: null, backUri: null, faceUri: null, requestId: null }),
}));
