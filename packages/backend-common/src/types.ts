import { z } from 'zod'

export const DocumentUploadSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  fileUrl: z.string(),
  fileKey: z.string(),
})
