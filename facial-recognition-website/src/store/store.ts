import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Face {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface AppState {
  webcamOn: boolean;
  image: string | null;
  faces: Face[];
  loading: boolean;
}

const initialState: AppState = {
  webcamOn: false,
  image: null,
  faces: [],
  loading: false,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setWebcamOn: (state, action: PayloadAction<boolean>) => {
      state.webcamOn = action.payload;
    },
    setImage: (state, action: PayloadAction<string | null>) => {
      state.image = action.payload;
    },
    setFaces: (state, action: PayloadAction<Face[]>) => {
      state.faces = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setWebcamOn, setImage, setFaces, setLoading } = appSlice.actions;

export const store = configureStore({
  reducer: { app: appSlice.reducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
