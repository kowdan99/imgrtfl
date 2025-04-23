// vite-env.d.ts
interface ImportMetaEnv {
    readonly VITE_CLERK_PUBLISHABLE_KEY: string
    // Add any other environment variables here
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
  