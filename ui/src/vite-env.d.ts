/// <reference types="vite/client" />

interface ViteTypeOptions {
    strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
    readonly VITE_WS_ENDPOINT: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
