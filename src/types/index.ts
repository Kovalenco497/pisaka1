export type PageType = 
  | 'dashboard' 
  | 'channels' 
  | 'sources' 
  | 'api' 
  | 'content-plan' 
  | 'autopilot' 
  | 'create-post' 
  | 'drafts' 
  | 'moderation' 
  | 'history' 
  | 'activity' 
  | 'settings';

export interface Channel {
  id?: number;
  name: string;
  username: string;
  telegramChatId?: string;
  botToken?: string;
  autopilotEnabled: boolean;
  mode?: 'full_autopilot' | 'moderation' | 'hybrid' | 'manual';
  status?: 'active' | 'paused' | 'not_configured';
  imageStyle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelProfile {
  id?: number;
  channelId: number;
  brand: string;
  businessDescription: string;
  niche: string;
  country: string;
  city: string;
  region?: string;
  geography?: string;
  language: string;
  audience: string;
  toneOfVoice: string;
  requiredCTA: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  website?: string;
  hashtags: string;
  brandMention: string;
  forbiddenElements: string;
  salesPrompt?: string;
  trustPrompt?: string;
  localPrompt?: string;
  interactivePrompt?: string;
}

export interface ContentMix {
  id?: number;
  channelId: number;
  salesPercent: number;
  trustPercent: number;
  localPercent: number;
  interactivePercent: number;
  rollingWindow: number;
}

export interface Schedule {
  id?: number;
  channelId: number;
  dayOfWeek: number;
  time: string;
  category: string;
  active: boolean;
  maxPostsPerDay: number;
  minIntervalHours: number;
  createdAt?: string;
  lastGenerated?: string;
}

export interface Source {
  id?: number;
  name: string;
  type: 'google_news' | 'rss' | 'perplexity' | 'custom_api';
  url: string;
  category: string;
  language: string;
  country: string;
  includeKeywords: string;
  excludeKeywords: string;
  refreshIntervalMinutes: number;
  active: boolean;
  lastFetchedAt?: string;
}

export interface SourceItem {
  id?: number;
  sourceId: number;
  title: string;
  description: string;
  url: string;
  sourceName: string;
  publishedAt: string;
  fetchedAt: string;
  guid: string;
  category?: string;
}

export interface Prompt {
  id?: number;
  name: string;
  description: string;
  category: 'system' | 'sales' | 'trust' | 'local' | 'interactive';
  content: string;
  active: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIProvider {
  id?: number;
  name: string;
  type: 'openai' | 'anthropic' | 'google' | 'perplexity' | 'openrouter' | 'groq';
  baseUrl: string;
  apiKey: string;
  model: string;
  active: boolean;
  isPrimary: boolean;
  timeout?: number;
}

export interface ImageProvider {
  id?: number;
  name: string;
  type: 'openai' | 'dalle' | 'stability' | 'midjourney';
  baseUrl: string;
  apiKey: string;
  model: string;
  active: boolean;
  isPrimary: boolean;
}

export interface Post {
  id?: number;
  channelId: number;
  topic: string;
  category: 'sales' | 'trust' | 'local' | 'interactive';
  content: string;
  status: 'draft' | 'approved' | 'published' | 'moderation' | 'rejected';
  imageUrl?: string;
  imagePrompt?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  telegramMessageId?: number;
  telegramChatId?: string;
  mode?: 'ai' | 'manual';
  qualityScore?: number;
  originalityScore?: number;
  factualScore?: number;
}

export interface PostVersion {
  id?: number;
  postId: number;
  version: number;
  content: string;
  createdAt: string;
}

export interface Job {
  id?: number;
  type: string;
  channelId: number;
  status: 'pending' | 'running' | 'success' | 'failed';
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface ActivityLog {
  id?: number;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

export interface ErrorLog {
  id?: number;
  service: string;
  status: 'open' | 'resolved';
  message: string;
  date: string;
}

export interface AppSettings {
  id?: number;
  timezone: string;
  language: string;
  retryCount: number;
  logsRetentionDays: number;
  minCharacters: number;
  maxCharacters: number;
  maxParagraphs: number;
  maxEmojis: number;
  maxHashtags: number;
  headlineMaxLength: number;
  ctaMaxLength: number;
  qualityThreshold: number;
  maxRegenerationAttempts: number;
  deduplicationDays: number;
  defaultImageSize: string;
  autoGenerateImage: boolean;
  includeSourcesInPost: boolean;
  maxSourceLinks: number;
  enableFactCheck: boolean;
  maxDailyPosts: number;
  minIntervalHours: number;
  autoSaveDrafts?: boolean;
  enableNotifications?: boolean;
  enableAutoHashtags?: boolean;
  defaultCategory?: string;
  backupFrequency?: string;
  maxLineLength?: number;
  defaultMaxLength?: number;
  defaultStyle?: string;
}

export interface Vehicle {
  id?: number;
  brand: string;
  model: string;
  year: number;
  category: string;
  transmission: string;
  engine: string;
  fuelType: string;
  fuelEfficiency: string;
  features: string[];
  photos: string[];
  priceDaily?: number;
  priceWeekly?: number;
  priceMonthly?: number;
  deposit?: number;
  available: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VisualBrief {
  main_idea: string;
  visual_message: string;
  primary_subject: string;
  secondary_subjects: string[];
  location: string;
  action: string;
  environment: string;
  time_of_day: string;
  season: string;
  mood: string;
  composition: string;
  camera_angle: string;
  visual_style: string;
  must_show: string[];
  must_not_show: string[];
  text_in_image: boolean;
}

export interface ImageValidation {
  match_score: number;
  main_subject_present: boolean;
  location_present: boolean;
  semantic_match: boolean;
  major_mismatch: boolean;
  wrong_person: boolean;
  wrong_object: boolean;
  explanation: string;
}
