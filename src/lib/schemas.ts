import { z } from "zod";
export const Confidence = z.enum(["high", "medium", "low", "unknown"]);
export const Status = z.enum([
  "supported",
  "likely_supported",
  "misleading",
  "unsupported",
  "false",
  "unverified",
  "insufficient_evidence",
]);
const Https = z
  .string()
  .url()
  .refine((v) => v.startsWith("https://"), "HTTPS required");
export const SourceSchema = z.object({
  source_id: z.string(),
  name: z.string(),
  url: Https,
  category: z.enum([
    "primary",
    "secondary",
    "fact_check",
    "research",
    "media",
    "mapping",
  ]),
  trust_level: z.enum(["primary", "established", "context"]),
  licence: z.string(),
  redistribution_allowed: z.boolean().nullable(),
  API_available: z.boolean().nullable(),
  refresh_frequency: z.string(),
  notes: z.string(),
});
export type Source = z.infer<typeof SourceSchema>;
export const EvidenceSchema = z.object({
  id: z.string(),
  source_id: z.string(),
  publisher: z.string(),
  title: z.string(),
  url: Https,
  published_at: z.string().nullable(),
  retrieved_at: z.string().datetime(),
  source_type: z.enum([
    "primary",
    "secondary",
    "fact_check",
    "research",
    "media",
  ]),
  archive_url: Https.nullable(),
  hash: z.string().nullable(),
  notes: z.string(),
  excerpt: z.string(),
  independence_key: z.string(),
});
export type Evidence = z.infer<typeof EvidenceSchema>;
export const ClaimSchema = z.object({
  id: z.string(),
  text: z.string(),
  normalizedText: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  status: Status,
  confidence: Confidence,
  evidenceIds: z.array(z.string()),
  locationIds: z.array(z.string()).optional(),
  entityIds: z.array(z.string()).optional(),
});
export type Claim = z.infer<typeof ClaimSchema>;
export const AnalysisSchema = z.object({
  claim: z.string(),
  status: Status,
  confidence: Confidence,
  summary: z.string(),
  observations: z.array(z.string()),
  evidence_ids: z.array(z.string()),
  contradictions: z.array(z.string()),
  information_gaps: z.array(z.string()),
  recommended_next_checks: z.array(z.string()),
});
export type Analysis = z.infer<typeof AnalysisSchema>;
export const InvestigationSchema = AnalysisSchema.extend({
  id: z.string(),
  evidence: z.array(EvidenceSchema),
  last_checked: z.string(),
  mode: z.enum(["curated", "live", "unavailable", "redirect"]),
  trace: z.array(z.string()),
  provider: z.string().nullable(),
  stored: z.boolean().optional(),
  storage_note: z.string().optional(),
});
export type Investigation = z.infer<typeof InvestigationSchema>;
export const LocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  county: z.string(),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});
export type Location = z.infer<typeof LocationSchema>;
export const EventSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.enum([
    "Official / IEBC",
    "Information integrity",
    "Fact check",
    "Security / incident",
    "Campaign event",
    "Election administration",
  ]),
  location: LocationSchema,
  timestamp: z.string(),
  status: Status,
  confidence: Confidence,
  evidenceIds: z.array(z.string()),
  description: z.string(),
  isDemo: z.boolean(),
});
export type Event = z.infer<typeof EventSchema>;
export const ThreatTechniqueSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  signals: z.array(z.string()),
  examples: z.array(z.string()),
  threshold: z.string(),
  reportSourceIds: z.array(z.string()),
  kenyaRelevance: z.string(),
  status: z.literal("Reference technique"),
});
export type ThreatTechnique = z.infer<typeof ThreatTechniqueSchema>;
export const ElectionEntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  evidenceIds: z.array(z.string()),
});
export const OrganizationSchema = ElectionEntitySchema.extend({
  kind: z.literal("organisation"),
});
export const PublicFigureSchema = ElectionEntitySchema.extend({
  publicRole: z.string(),
});
export const OfficialNoticeSchema = ElectionEntitySchema.extend({
  publishedAt: z.string(),
  issuerId: z.string(),
});
export const FactCheckSchema = ElectionEntitySchema.extend({
  claimId: z.string(),
  status: Status,
});
export const MediaArticleSchema = ElectionEntitySchema.extend({
  publisherId: z.string(),
  publishedAt: z.string(),
});
export type Organization = z.infer<typeof OrganizationSchema>;
export type PublicFigure = z.infer<typeof PublicFigureSchema>;
export type OfficialNotice = z.infer<typeof OfficialNoticeSchema>;
export type FactCheck = z.infer<typeof FactCheckSchema>;
export type MediaArticle = z.infer<typeof MediaArticleSchema>;
export type ElectionEntity = z.infer<typeof ElectionEntitySchema>;
export const RequestSchema = z
  .object({
    query: z.string().trim().min(5).max(2000),
    mode: z.enum(["ask", "investigate", "verify"]),
    image: z.string().max(4000000).optional(),
    consent: z.boolean().optional(),
  })
  .strict();
