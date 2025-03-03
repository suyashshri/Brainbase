import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function getEmbeddingsFromOpenAI(text: string) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.replace('/\n/g', ' '),
      encoding_format: 'float',
    })
    const result = response.data[0]?.embedding

    return result
  } catch (error) {
    console.log('error calling openai embeddings api', error)
    throw error
  }
}
