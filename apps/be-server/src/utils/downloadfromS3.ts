import AWS from 'aws-sdk'
import dotenv from 'dotenv'
import fs from 'fs'
import path, { resolve } from 'path'

dotenv.config()

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})

export async function downloadFromS3(filekey: string): Promise<string> {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: filekey,
    }

    const filePath = path.join(__dirname, 'downloads', filekey)
    const fileStream = fs.createWriteStream(filePath)

    return new Promise((resolve, reject) => {
      s3.getObject(params)
        .createReadStream()
        .pipe(fileStream)
        .on('finish', async () => {
          console.log('File Downloaded: ', filePath)
          resolve(filePath)
        })
        .on('error', (err) => {
          console.error('Error downloading file:', err)
          reject(err)
        })
    })
  } catch (error) {
    console.log('error in downloading from s3', error)
    throw error
  }
}
