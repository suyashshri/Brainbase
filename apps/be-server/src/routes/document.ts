import express, { Router } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import prisma from '@repo/db/client';
import { DocumentUploadSchema } from '@repo/backend-common/types';
import { authMiddleware } from '../middleware';
import { loadDataIntoPinecone } from '../utils/pinecone';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import { getAllDocs, getContext } from '../utils/context';

const router: Router = express.Router();

//GET presigned URL and send it to frontend
router.post('/pre-signed-url', authMiddleware, async (req, res) => {
    try {
        const { filename, filetype } = req.body;
        if (!filename || !filetype) {
            res.status(400).json({
                error: 'Filename and filetype are required',
            });
            return;
        }
        const key = `models/${Date.now()}_${filename}`;

        const client = new S3Client({ region: process.env.AWS_REGION! });
        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: key,
        });
        const uploadUrl = await getSignedUrl(client, command, {
            expiresIn: 3600,
        });

        res.json({
            uploadUrl,
            key,
        });
    } catch (err) {
        console.log('Error in generating presigned URL:', err);
        throw new Error();
    }
});

//GET presigned URL and send it to frontend
router.post('/upload', authMiddleware, async (req, res) => {
    const data = req.body;
    const parsedData = DocumentUploadSchema.safeParse(data);
    console.log(' uploading to db');

    if (!parsedData.success) {
        res.json({
            message: 'Please enter valid title and description',
        }).status(422);
        return;
    }
    const { fileName, fileType, fileUrl, fileKey } = parsedData.data!;
    console.log(' uploading to db', fileKey);

    try {
        const doc = await prisma.documents.create({
            data: {
                userId: req.userId,
                fileName,
                fileType,
                fileUrl,
                fileKey,
            },
        });
        console.log('docccc', doc);

        if (doc) {
            try {
                await loadDataIntoPinecone(doc.fileKey);
            } catch (error) {
                console.error('Unable to upload the document', error);
                res.status(500).json({
                    error: 'Failed to save file metadata in DB',
                });
                return;
            }
        }
        res.json({
            message: 'Document Uploaded Successfully',
            id: doc.id,
        }).status(201);
    } catch (error) {
        console.error('Unable to upload the document', error);
        res.status(500).json({ error: 'Failed to save file metadata in DB' });
        return;
    }
});

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
        });

        res.json({
            documents: docs,
        }).status(201);
    } catch (error) {
        console.log(error);
    }
});

//POST adding chat of current doc
router.post('/:documentId/chat', async (req, res) => {
    console.log('Inside Chat post document');
    try {
        const documentId = req.params.documentId;
        const { message } = req.body;
        if (!documentId || !message) {
            res.status(400).json({
                error: 'Document ID and query are required.',
            });
            return;
        }

        console.log('After documentId', documentId);

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const doc = await prisma.documents.findUnique({
            where: { id: documentId },
        });

        if (!doc) {
            res.status(404).json({ error: 'Document not found.' });
            return;
        }
        console.log('After doc', doc);

        const fileKey = doc.fileKey;
        const context = await getContext(message, fileKey);
        console.log('Context:', context);

        const chatHistory = await prisma.pdfMessages.findMany({
            where: { docId: documentId },
            orderBy: { createAt: 'asc' },
            select: { role: true, content: true },
        });

        const messages: ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content:
                    'You are an AI assistant answering based on PDF content.',
            },
            ...chatHistory.map((message) => ({
                role: message.role as 'system' | 'user',
                content: message.content,
            })),
            {
                role: 'user',
                content: `Context: ${context}\n\nQuery: ${message}`,
            },
        ];
        console.log('messages:', messages);

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages,
            });
            if (!completion || !completion.choices[0]) {
                res.status(500).json({ error: 'Error in chat completions.' });
                return;
            }
            const assistantResponse =
                completion.choices[0].message.content ||
                'Unable to find answer due to heavy load on server';
            console.log('assistantResponse:', assistantResponse);

            await prisma.pdfMessages.create({
                data: { docId: documentId, content: message, role: 'user' },
            });
            await prisma.pdfMessages.create({
                data: {
                    docId: documentId,
                    content: assistantResponse,
                    role: 'system',
                },
            });
            res.status(200).json({
                response: assistantResponse,
            });
        } catch (error) {
            console.error('Error in chat completions:', error);
            res.status(500).json({ error: 'Error in chat completions.' });
        }
    } catch (error) {
        console.error('Error in chatWithPdf:', error);
        res.status(500).json({
            error: 'An error occurred while processing your request.',
        });
    }
});

//GET all chats for current doc
router.get('/:documentId/chat', authMiddleware, async (req, res) => {
    try {
        const documentId = req.params.documentId!;
        console.log('documentId:', documentId);

        const chat = await prisma.pdfMessages.findMany({
            where: {
                docId: documentId,
            },
        });
        console.log('chat:', chat);

        res.json({
            chats: chat,
        }).status(201);
    } catch (error) {
        console.log('Error in creating chat message:', error);
        throw new Error();
    }
});

//POST documents which are related to query
router.post('/find', authMiddleware, async (req, res) => {
    const { query } = req.body;

    if (!query) {
        res.json({ error: 'Query is required' }).status(400);
    }

    const docs = await getAllDocs(query);
    console.log(docs);
    if (!docs) {
        res.json({
            message: 'Can not find any document related',
        }).status(500);
        return;
    }
    const documents = await prisma.documents.findMany({
        where: {
            fileKey: {
                in: Array.from(docs) as string[],
            },
        },
    });
    res.json({
        docs: documents,
    }).status(200);
});

//GET specific document with specific ID
router.get('/:documentId', authMiddleware, async (req, res) => {
    try {
        const documentId = req.params.documentId;

        const doc = await prisma.documents.findUnique({
            where: {
                id: documentId,
                userId: req.userId,
            },
        });
        if (!doc) {
            res.json({
                messgae: 'No Document found with this ID',
            }).status(404);
            return;
        }

        res.json({
            document: doc,
        }).status(201);
    } catch (error) {
        console.log(error);
    }
});

//DELETE specific document with specific ID
router.delete('/:documentId', authMiddleware, async (req, res) => {
    try {
        const documentId = req.params.documentId;
        const doc = await prisma.documents.delete({
            where: {
                id: documentId,
                userId: req.userId,
            },
        });
        res.json({
            message: 'Deleted Successfully',
        });
    } catch (error) {
        console.log(error);
    }
});

export default router;
