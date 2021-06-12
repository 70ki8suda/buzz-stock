/// <reference types="node" />
/* eslint no-unused-vars: 0 */
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_RAPIDAPI_KEY: string;
    readonly NEXT_PUBLIC_RAPIDAPI_HOST: string;
  }
}

declare module '*.svg' {
  const content: any;
  export default content;
}

declare module 'react-use-dimensions' {
  const type: any;
  export default type;
}
