import { z } from 'zod'

export const DocumentUploadSchema = z.object({
  title: z.string(),
  description: z.string(),
})
