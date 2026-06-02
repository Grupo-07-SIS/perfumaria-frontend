/// <reference types="vite/client" />

interface ViteTypeOptions { }

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly VITE_BOTPRESS_WEBHOOK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}