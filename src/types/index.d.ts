export {};

declare global {
    interface Window {
        onDataRecievedHook: (token: string) => Promise<void>;
        onDataExpiredHook: () => void;
        onCaptchaError: () => void;
        resetCaptcha: () => void;
    }
}