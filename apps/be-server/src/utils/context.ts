import { Pinecone } from "@pinecone-database/pinecone";
import { getEmbeddingsFromOpenAI } from "./embeddings";

export async function getMatchesFromEmbeddings(embeddings: number[],fileKey: string){
    try {
        console.log("apiKey",process.env.PINECONE_API_KEY);
        
        const client = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
          })
          const pineconeIndex = client.index("brainbase-index");
            console.log("pineconeIndex",pineconeIndex);

          const namespace = pineconeIndex.namespace("models/pdf")
            console.log("namespace",namespace);

          const queryResult = await namespace.query({
            topK: 5,
            vector: embeddings,
            includeMetadata: true,
          });
          console.log("queryResult",queryResult);

          return queryResult.matches || [];

    } catch (error) {
        console.log("error querying embeddings", error);
    throw error;
    }
}

export async function getContext(query: string, fileKey: string){
    console.log("Inside getcontext",query,fileKey);
    
    const queryEmbeddings = await getEmbeddingsFromOpenAI(query)
    if(!queryEmbeddings){
        return
    }

    const matches = await getMatchesFromEmbeddings(queryEmbeddings,fileKey)
    console.log("matches",matches);


    const qualifyingDocs = matches.filter((match)=> match.score && match.score>0.7)
    type Metadata = {
        text: string;
        pageNumber: number;
      };
      console.log("qualifyingDocs",qualifyingDocs);
    
      let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);
      console.log("docs",docs);

      // 5 vectors
      return docs.join("\n").substring(0, 3000);
}