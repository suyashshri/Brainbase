import express, { Router } from 'express'
import AWS from 'aws-sdk'
import { DocumentUploadSchema } from '@repo/backend-common/types'

const router: Router = express.Router()

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECCRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})

router.get('/pre-signed-url', async (req, res) => {
  const { filename, filetype } = req.body()
  const key = `models/${Date.now()}_${filename}`

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    ContentType: filetype,
    Expires: 60,
  }
  const uploadURL = await s3.getSignedUrlPromise('putObject', params)
  res.json({
    uploadURL,
    key,
  })
})

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
router.get('/', async (req, res) => {})

export default router
