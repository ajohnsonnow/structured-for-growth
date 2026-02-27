/**
 * Module declarations for packages used in the mobile app.
 * Run `npm install` in the mobile/ directory to get full type definitions.
 * These declarations provide minimal type stubs so the project type-checks
 * even before node_modules are installed.
 */

declare module 'expo-local-authentication' {
  export function hasHardwareAsync(): Promise<boolean>;
  export function isEnrolledAsync(): Promise<boolean>;
  export function authenticateAsync(options?: {
    promptMessage?: string;
    cancelLabel?: string;
    disableDeviceFallback?: boolean;
  }): Promise<{ success: boolean }>;
}

declare module 'expo-secure-store' {
  export function getItemAsync(key: string): Promise<string | null>;
  export function setItemAsync(key: string, value: string): Promise<void>;
  export function deleteItemAsync(key: string): Promise<void>;
}

declare module 'zustand' {
  type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  type GetState<T> = () => T;
  export function create<T>(initializer: (set: SetState<T>, get: GetState<T>) => T): () => T;
}
