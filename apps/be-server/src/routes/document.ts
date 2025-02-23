import express, { Router } from 'express'
import AWS from 'aws-sdk'
import prisma from '@repo/db/client'
import { DocumentUploadSchema } from '@repo/backend-common/types'

const router: Router = express.Router()

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})

//GET presigned URL and send it to frontend
router.get('/pre-signed-url', async (req, res) => {
  const { filename, filetype } = req.body()
  const key = `models/${Date.now()}_${filename}`

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    ContentType: filetype,
    Expires: 60,
  }
  const uploadUrl = await s3.getSignedUrlPromise('putObject', params)
  res.json({
    uploadUrl,
    key,
  })
})

//GET presigned URL and send it to frontend
router.post('/upload', (req, res) => {
  const data = req.body
  const parsedData = DocumentUploadSchema.safeParse(data)

  if (!parsedData.success) {
    res
      .json({ message: 'Please enter valid title and description' })
      .status(422)
  }
})

//GET all documents
router.get('/', async (req, res) => {
  try {
    const docs = await prisma.documents.findMany({
      where: {
        userId: req.userId,
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
