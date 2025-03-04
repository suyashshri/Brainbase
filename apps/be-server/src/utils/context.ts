import { Pinecone } from "@pinecone-database/pinecone";
import { getEmbeddingsFromOpenAI } from "./embeddings";

export async function getMatchesFromEmbeddings(embeddings: number[],fileKey: string){
    try {
        const client = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
          })
          const pineconeIndex = client.index("brainbase-index");
          const namespace = pineconeIndex.namespace("models/pdf")

          const queryResult = await namespace.query({
            topK: 5,
            vector: embeddings,
            includeMetadata: true,
          });

          return queryResult.matches || [];

    } catch (error) {
        console.log("error querying embeddings", error);
    throw error;
    }
}

export async function getContext(query: string, fileKey: string){
    
    const queryEmbeddings = await getEmbeddingsFromOpenAI(query)
    if(!queryEmbeddings){
        return
    }
    const matches = await getMatchesFromEmbeddings(queryEmbeddings,fileKey)

    const qualifyingDocs = matches.filter((match)=> match.score && match.score>0.4)
    type Metadata = {
        text: string;
        pageNumber: number;
      };
    
      let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);

      return docs.join("\n").substring(0, 3000);
}