/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STACK_PUBLISHABLE_CLIENT_KEY: string
  readonly STACK_SECRET_SERVER_KEY: string
  // Add other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
