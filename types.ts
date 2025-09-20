
export interface Violation {
  id: string;
  timestamp: Date;
  licensePlate: string;
  imageDataUrl: string;
}

export interface GeminiViolationResponse {
  is_violation: boolean;
  license_plate: string | null;
}
