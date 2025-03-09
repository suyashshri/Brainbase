// import pdfParse from 'pdf-parse'
// import { chunkType } from './types'

// const splitpageIntoChunks = (
//   pageText: string,
//   pageIndex: number,
//   minChunks = 3,
//   maxChunks = 5
// ) => {
//   const words = pageText.split(/\s+/)
//   const totalWords = words.length
//   const numOfChunks = Math.min(
//     maxChunks,
//     Math.max(minChunks, Math.ceil(totalWords / 100))
//   )
//   const chunkSize = Math.ceil(totalWords / numOfChunks)

//   let chunks: chunkType[] = []
//   for (let i = 0; i < numOfChunks; i++) {
//     const chunk = words.slice(i * chunkSize, (i + 1) * chunkSize).join(' ')
//     chunks.push({
//       chunk,
//       pageIndex,
//       chunkIndex: i,
//     })
//   }
//   return chunks
// }

// export async function splitPdfIntoChunks(dataBuffer: Buffer<ArrayBufferLike>) {
//   const parsedData = pdfParse(dataBuffer)
//   let chunks: chunkType[] = []
//   const pages = (await parsedData).text.split('\f')
//   for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
//     const pageText = pages[pageIndex]?.trim()
//     if (!pageText) continue
//     const chunk = splitpageIntoChunks(pageText, pageIndex)
//     chunks.push(...chunk)
//   }
//   return chunks
// }
