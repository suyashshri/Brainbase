import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
// import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// dotenv.config();

async function streamToBuffer(stream: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

export async function downloadFromS3(filekey: string) {
    try {
        const client = new S3Client({ region: process.env.AWS_REGION! });
        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: filekey,
        });
        const response = await client.send(command);

        if (!response.Body) throw new Error('No file found in S3 response');

        const fileBuffer = await streamToBuffer(response.Body as any);

        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        const fileName = `yash_${Date.now()}.pdf`;
        const filePath = path.join(tmpDir, fileName);

        fs.writeFileSync(filePath, fileBuffer);
        console.log('PDF file downloaded successfully:', filePath);

        return fileName;
    } catch (error) {
        console.log('error in downloading from s3', error);
        throw error;
    }
}
