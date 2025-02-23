import { Pinecone } from '@pinecone-database/pinecone'

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
})

export async function loadDataIntoPinecone() {
  await pc.createIndex({
    name: 'example-index',
    dimension: 1536,
    metric: 'cosine',
    spec: {
      serverless: {
        cloud: 'aws',
        region: 'us-east-1',
      },
    },
    deletionProtection: 'disabled',
    tags: { environment: 'development' },
  })
}
