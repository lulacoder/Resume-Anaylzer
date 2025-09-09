import { z } from 'zod';

export const AnalysisFormSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required.'),
  jobDescription: z.string().min(1, 'Job description is required.'),
  resume: z.custom<File>().refine((file) => file instanceof File, 'Resume is required.'),
});
