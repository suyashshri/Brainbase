import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone';
import { downloadFromS3 } from './downloadfromS3';
import fs from 'fs';
import md5 from 'md5';
import { getEmbeddingsFromOpenAI } from './embeddings';
import path from 'path';
import pdf from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
});

async function createIndex() {
    const index_name = process.env.PINECONE_INDEX_NAME!;
    const existingIndexes = await pc.listIndexes();
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
        });
        console.log(`Index "${index_name}" created!`);
    } else {
        console.log(`Index "${index_name}" already exists.`);
    }
}
createIndex();

async function extractTextFromPdf(pdfPath: string) {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    return data.text;
}

export async function loadDataIntoPinecone(filekey: string) {
    const file_name = await downloadFromS3(filekey);
    const index_name = process.env.PINECONE_INDEX_NAME!;
    if (!file_name) {
        throw new Error('Could not download file from S3');
    }
    const localFilePath = path.join(process.cwd(), 'tmp', file_name);

    const text = await extractTextFromPdf(localFilePath);
    console.log('Extracted Text:', text);

    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 450,
        chunkOverlap: 50,
    });
    const chunks = await textSplitter.splitText(text);
    console.log('chunks', chunks);
    console.log('chunks', chunks.length);

    const vectors = await Promise.all(
        chunks.map(async (c, idx) => {
            const embeddings = await getEmbeddingsFromOpenAI(c);
            const metadata = {
                text: c,
                fileKey: filekey,
                chunkNumber: Number(idx),
            };
            const pineconeIndex = pc.index(index_name);
            const namespace = pineconeIndex.namespace('models/pdf');
            await namespace.upsert([
                {
                    id: `file_name_${filekey}_${idx}`,
                    values: embeddings,
                    metadata: metadata,
                },
            ]);

            const hash = md5(c);
            return {
                id: hash,
                values: embeddings,
                metadata: metadata,
            } as PineconeRecord;
        })
    );

    // await prisma.contentChunk.createMany({
    //     data: vectors.map((chunk) => ({
    //       documentId: "123",
    //       chunkText: chunk.metadata?.text ?? '',
    //       chunkIndex: chunk.metadata?.chunkNumber ?? 0,
    //       pinecodeId: chunk.id,
    //     })),
    // });

    const index = pc.index(process.env.PINECONE_INDEX_NAME!);

    await index.upsert(vectors);
}
