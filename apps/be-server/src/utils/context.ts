import { Pinecone } from '@pinecone-database/pinecone';
import { getEmbeddingsFromOpenAI } from './embeddings';

export async function getMatchesFromEmbeddings(
    embeddings: number[],
    fileKey: string
) {
    try {
        const client = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
        });
        const pineconeIndex = client.index('brainbase-index');
        const namespace = pineconeIndex.namespace('models/pdf');

        const queryResult = await namespace.query({
            topK: 5,
            vector: embeddings,
            includeMetadata: true,
        });

        return queryResult.matches || [];
    } catch (error) {
        console.log('error querying embeddings', error);
        throw error;
    }
}

export async function getContext(query: string, fileKey: string) {
    const queryEmbeddings = await getEmbeddingsFromOpenAI(query);
    if (!queryEmbeddings) {
        return;
    }
    const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);
    console.log('matchesmatchesmatches', matches);

    const qualifyingDocs = matches.filter(
        (match) => match.score && match.score > 0.2
    );

    type Metadata = {
        text: string;
        pageNumber: number;
    };

    let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);

    return docs.join('\n').substring(0, 3000);
}

export async function getAllDocs(query: string) {
    const query_embed = await getEmbeddingsFromOpenAI(query);
    if (!query_embed) {
        return;
    }
    try {
        const client = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
        });
        const pineconeIndex = client.index('brainbase-index');

        const searchResults = await pineconeIndex.query({
            vector: query_embed,
            topK: 5,
            includeMetadata: true,
        });

        const documents = searchResults.matches.map((match) =>
            (match.score ?? 0 > 0.25)
                ? {
                      id: match.id,
                      score: match.score,
                      metadata: match.metadata,
                  }
                : null
        );

        const uniqueDocuments = [];
        const seenFileKeys = new Set();

        for (const doc of documents) {
            const fileKey = doc?.metadata?.fileKey;
            if (!seenFileKeys.has(fileKey)) {
                seenFileKeys.add(fileKey);
                uniqueDocuments.push(doc);
            }
        }

        return seenFileKeys;
    } catch (error) {}
}
