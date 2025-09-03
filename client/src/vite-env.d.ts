/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_PAYTM_ENV: string;
  readonly VITE_PAYTM_WEBSITE: string;
  readonly VITE_PAYTM_MID: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
