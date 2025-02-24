declare namespace NodeJS {
  export interface ProcessEnv {
    // # Clerk API Keys
    CLERK_PUBLISHABLE_KEY: string
    CLERK_SECRET_KEY: string

    // #AWS S3 Api key
    S3_ACCESS_KEY_ID: string
    S3_SECRET_ACCESS_KEY: string
    S3_BUCKET_NAME: string
    AWS_REGION: string

    // # OpenAI Api Key
    OPENAI_API_KEY: string

    // # Pinecone API keys
    PINECONE_API_KEY: string
  }
}
