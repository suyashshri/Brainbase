import express, { Router } from 'express'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import prisma from '@repo/db/client'
import { DocumentUploadSchema } from '@repo/backend-common/types'
import { authMiddleware } from '../middleware'
import { loadDataIntoPinecone } from '../utils/pinecone'
import { getContext } from '../utils/context'
import OpenAI from "openai"
import {Readable} from 'stream'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'

const router: Router = express.Router()


//GET presigned URL and send it to frontend
router.post('/pre-signed-url', authMiddleware, async (req, res) => {
  try {
    const { filename, filetype } = req.body
    if (!filename || !filetype) {
      res.status(400).json({ error: 'Filename and filetype are required' })
      return
    }
    const key = `models/${Date.now()}_${filename}`

    const client = new S3Client({ region: process.env.AWS_REGION! })
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    })
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 })

    res.json({
      uploadUrl,
      key,
    })
  } catch (err) {
    console.log('Error in generating presigned URL:', err)
    throw new Error()
  }
})

//GET presigned URL and send it to frontend
router.post('/upload', authMiddleware, async (req, res) => {
  const data = req.body
  const parsedData = DocumentUploadSchema.safeParse(data)
  console.log(' uploading to db')

  if (!parsedData.success) {
    res
      .json({ message: 'Please enter valid title and description' })
      .status(422)
    return
  }
  const { fileName, fileType, fileUrl, fileKey } = parsedData.data!
  console.log(' uploading to db', fileKey)

  try {
    const doc = await prisma.documents.create({
      data: {
        userId: req.userId,
        fileName,
        fileType,
        fileUrl,
        fileKey,
      },
    })
    console.log('docccc', doc)

    if (doc) {
      try {
        await loadDataIntoPinecone(doc.fileKey)
      } catch (error) {
        console.error('Unable to upload the document', error)
        res.status(500).json({ error: 'Failed to save file metadata in DB' })
        return
      }
    }
    res
      .json({
        message: 'Document Uploaded Successfully',
        id: doc.id,
      })
      .status(201)
  } catch (error) {
    console.error('Unable to upload the document', error)
    res.status(500).json({ error: 'Failed to save file metadata in DB' })
    return
  }
})

//GET all documents
router.get('/', authMiddleware, async (req, res) => {
  try {
    const docs = await prisma.documents.findMany({
      where: {
        userId: req.userId,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    })

    res
      .json({
        documents: docs,
      })
      .status(201)
  } catch (error) {
    console.log(error)
  }
})

//POST adding chat of current doc
router.post('/:documentId/chat',authMiddleware, async(req,res)=>{
  try {
    const documentId = req.params.documentId!
    const { query  } = req.body;
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const doc = await prisma.documents.findUnique({
      where:{
        id:documentId,
      }
    })

    if(!doc){
      res.json({ error: "doc not found" }).status(404);
      return
    }
    const fileKey = doc.fileKey
    try{
      const context = await getContext(query, fileKey);
    console.log("context",context);
      const chatHistory = await prisma.pdfMessages.findMany({
        where: {docId: documentId},
        orderBy:{createAt:"asc"},
        select:{role:true,content:true}
      })
      if(!chatHistory) return
      const messages: ChatCompletionMessageParam[] = [
        {role:"system",content: "You are an AI assistant answering based on PDF content."},
        ...chatHistory,
        { role: "user", content: context! },
      ]
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        stream: true,
      });
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      const encoder = new TextEncoder();
      const readableStream = new Readable({
        async read() {
          for await (const chunk of response) {
            const text = chunk.choices[0]?.delta?.content || '';
            this.push(encoder.encode(text));
    
            // Save assistant message to DB in real-time
            await prisma.pdfMessages.create({
              data: { docId: documentId, content: text, role: 'system' },
            });
          }
          this.push(null); // End the stream
        },
      });

  // Save user query to DB before returning stream
  await prisma.pdfMessages.create({
    data: { docId: documentId, content: query, role: "user" },
  });

  readableStream.pipe(res);
    }catch (error) {
      console.log('Error in fetching chat messages:', error)
      throw new Error()
    }
  } catch (error) {
    console.log('Error in creating chat message:', error)
    throw new Error()
  }
})

//GET all chats for current doc
router.get("/:documentId/chat",authMiddleware,async(req,res)=>{
  try {
    const documentId = req.params.documentId!
    const chat = await prisma.pdfMessages.findMany({
      where:{
        docId:documentId,
      }
    })
    res.json({
      chats: chat
    }).status(201)
  } catch (error) {
    console.log('Error in creating chat message:', error)
    throw new Error()
  }
})

//GET specific document with specific ID
router.get('/:documentId',authMiddleware, async (req, res) => {
  try {
    const documentId = req.params.documentId

    const doc = await prisma.documents.findUnique({
      where: {
        id: documentId,
        userId: req.userId,
      },
    })
    if (!doc) {
      res
        .json({
          messgae: 'No Document found with this ID',
        })
        .status(404)
      return
    }

    res
      .json({
        document: doc,
      })
      .status(201)
  } catch (error) {
    console.log(error)
  }
})

//DELETE specific document with specific ID
router.delete('/:documentId',authMiddleware, async (req, res) => {
  try {
    const documentId = req.params.documentId
    const doc = await prisma.documents.delete({
      where: {
        id: documentId,
        userId: req.userId,
      },
    })
    res.json({
      message: 'Deleted Successfully',
    })
  } catch (error) {
    console.log(error)
  }
})

export default router
