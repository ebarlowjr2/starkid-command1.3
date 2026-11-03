export type DataKind = 'estimated' | 'predicted' | 'archive' | 'schedule' | 'reference';
export type Availability = 'current' | 'stale' | 'unavailable';
export interface FeedEnvelope<T = unknown> {
  data: T | null;
  source: string;
  kind: DataKind;
  units: string;
  observedAt: string | null;
  received: number | null;
  expiresAt: number | null;
  status: Availability;
  failed: boolean;
  reason?: string;
}
export interface DisplaySnapshot {
  serverTime: number;
  feeds: Record<string, FeedEnvelope>;
  health: 'current' | 'partial' | 'unavailable';
}
export interface DisplayConfig {
  station: string; broadcast: boolean; stations: string[]; seconds: number;
  tourSeconds: number; lab: string; timezone: string; latitude: number | null;
  longitude: number | null; quality: 'low' | 'high'; reducedMotion: boolean;
  audio: false; kiosk: boolean; relatedBase: string;
}
