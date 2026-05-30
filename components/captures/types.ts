export type CaptureShareMode = "complete" | "secret";

export type Capture = {
  id: number;
  lat: number;
  lng: number;
  placeId?: number;
  species: string;
  weight: string;
  size: string;
  bait: string;
  comment: string;
  photo: string;
  capturedAt: string;
};

export type StoredCapture = Omit<Capture, "photo"> & {
  photo?: string;
  photoId?: string;
};

export type CaptureFormData = {
  species: string;
  weight: string;
  size: string;
  bait: string;
  comment: string;
  photo: string;
  capturedDate: string;
  capturedTime: string;
};
