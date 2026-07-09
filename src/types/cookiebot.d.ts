export {};

declare global {
  interface Window {
    Cookiebot?: {
      consent: {
        necessary: boolean;
        preferences: boolean;
        statistics: boolean;
        marketing: boolean;
      };
      renew: () => void;
      show: () => void;
      hide: () => void;
    };
  }
}
