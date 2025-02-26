import { z } from 'zod'

export const DocumentUploadSchema = z.object({
  fileName: z.string(),
  fileType: z.string(z.enum(['PDF', 'PNG', 'JPEG'])),
  fileUrl: z.string(),
})
