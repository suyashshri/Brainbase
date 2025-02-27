import express, { Router } from 'express'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import prisma from '@repo/db/client'
import { DocumentUploadSchema } from '@repo/backend-common/types'
import { authMiddleware } from '../middleware'

const router: Router = express.Router()

//GET presigned URL and send it to frontend
router.post('/pre-signed-url', async (req, res) => {
  try {
    const { filename, filetype } = req.body
    if (!filename || !filetype) {
      res.status(400).json({ error: 'Filename and filetype are required' })
      return
    }
    const key = `models/${Date.now()}_${filename}`

    try {
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
    } catch (error) {
      console.error('Error generating presigned URL', error)
    }
  } catch (err) {
    console.log('Error in generating presigned URL:', err)
    throw new Error()
  }
})

//GET presigned URL and send it to frontend
router.post('/upload', authMiddleware, async (req, res) => {
  const data = req.body
  const parsedData = DocumentUploadSchema.safeParse(data)

  if (!parsedData.success) {
    res
      .json({ message: 'Please enter valid title and description' })
      .status(422)
    return
  }
  const { fileName, fileType, fileUrl } = parsedData.data!

  try {
    const doc = await prisma.documents.create({
      data: {
        userId: req.userId,
        fileName,
        fileType,
        fileUrl,
      },
    })
    res
      .json({
        message: 'Document Uploaded Successfully',
        id: doc.id,
      })
      .status(201)
  } catch (error) {
    console.error('Unable to upload the document')
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

//GET specific document with specific ID
router.get('/:documentId', async (req, res) => {
  try {
    const documentId = req.params.documentId
    const doc = await prisma.documents.findUnique({
      where: {
        id: documentId,
        userId: req.userId,
      },
    })
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
router.delete('/:documentId', async (req, res) => {
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
