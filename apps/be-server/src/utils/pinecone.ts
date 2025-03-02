import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone'
import { downloadFromS3 } from './downloadfromS3'
import fs from 'fs'
import md5 from 'md5'
import { splitPdfIntoChunks } from './splitpdf'
import { getEmbeddingsFromOpenAI } from './embeddings'
import path from 'path'

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
})

async function createIndex() {
  const index_name = process.env.PINECONE_INDEX_NAME!
  const existingIndexes = await pc.listIndexes()
  if (!existingIndexes.indexes?.map((index) => index.name === index_name)) {
    await pc.createIndex({
      name: 'brainbase-index',
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
    console.log(`Index "${index_name}" created!`)
  } else {
    console.log(`Index "${index_name}" already exists.`)
  }
}
createIndex()

export async function loadDataIntoPinecone(filekey: string) {
  const file_name = await downloadFromS3(filekey)
  if (!file_name) {
    throw new Error('Could not download file from S3')
  }

  const dataBuffer = fs.readFileSync(path.join(process.cwd(), 'tmp', file_name))
  const chunks = await splitPdfIntoChunks(dataBuffer)

  const vectors = await Promise.all(
    chunks.map(async (c) => {
      const embeddings = await getEmbeddingsFromOpenAI(c.chunk)
      const hash = md5(c.chunk)
      return {
        id: hash,
        values: embeddings,
        metadata: {
          text: c.chunk,
          pageNumber: Number(c.pageIndex),
          chunkNumber: Number(c.chunkIndex),
        },
      } as PineconeRecord
    })
  )

  const index = pc.index(process.env.PINECONE_INDEX_NAME!)

  await index.upsert(vectors)
}
