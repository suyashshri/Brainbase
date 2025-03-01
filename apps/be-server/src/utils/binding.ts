import path from 'path'
import { downloadFromS3 } from './downloadfromS3'
import { splitPdfIntoChunks } from './splitpdf'
import fs from 'fs'
import { getEmbeddingsFromOpenAI } from './embeddings'
import md5 from 'md5'
import { PineconeRecord } from '@pinecone-database/pinecone'

// type PDFPage = {
//   pageContent: string
//   metadata: {
//     loc: { pageNumber: number }
//   }
// }

export async function bind(fileKey: string) {
  console.log('Downloading from S3 for embeddings and loading into Pinecone')
  console.log('filekey', fileKey)

  const file_path = await downloadFromS3(fileKey)
  if (!file_path) {
    throw new Error('Unable to download file from S3')
  }
  console.log('loading pdf into memory' + file_path)
  const pdfBuffer = fs.readFileSync(path.join(process.cwd(), 'tmp', file_path))
  const dataBuffer: Buffer<ArrayBufferLike> = Buffer.from(pdfBuffer)
  const chunks = await splitPdfIntoChunks(dataBuffer)
  console.log('chunksssssssssssssss', chunks)

  const embeds = await Promise.all(chunks.map((doc) => embedDocument(doc)))
  //   console.log('embedsssss', embeds)
}

async function embedDocument(doc: {
  chunk: string
  pageIndex: number
  chunkIndex: number
}) {
  try {
    const embeddings = await getEmbeddingsFromOpenAI(doc.chunk)
    const hash = md5(doc.chunk)

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.chunk,
        pageNumber: doc.pageIndex,
        chunkNumber: doc.chunkIndex,
      },
    } as PineconeRecord
  } catch (error) {
    console.log('error embedding document', error)
    throw error
  }
}
