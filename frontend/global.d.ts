/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_RAPIDAPI_KEY: string;
    readonly NEXT_PUBLIC_RAPIDAPI_HOST: string;
  }
}
