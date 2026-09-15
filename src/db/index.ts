import Dexie, { type Table } from 'dexie';
import type { 
  Channel, ChannelProfile, ContentMix, Schedule, Source, SourceItem, 
  Prompt, AIProvider, ImageProvider, Post, PostVersion, Job, 
  ActivityLog, ErrorLog, AppSettings 
} from '../types';

export class ContentDirectorDB extends Dexie {
  channels!: Table<Channel>;
  channelProfiles!: Table<ChannelProfile>;
  contentMixes!: Table<ContentMix>;
  schedules!: Table<Schedule>;
  sources!: Table<Source>;
  sourceItems!: Table<SourceItem>;
  prompts!: Table<Prompt>;
  aiProviders!: Table<AIProvider>;
  imageProviders!: Table<ImageProvider>;
  posts!: Table<Post>;
  postVersions!: Table<PostVersion>;
  jobs!: Table<Job>;
  activityLogs!: Table<ActivityLog>;
  errorLogs!: Table<ErrorLog>;
  appSettings!: Table<AppSettings>;

  constructor() {
    super('ContentDirectorDB');
    
    this.version(1).stores({
      channels: '++id, name, username',
      channelProfiles: '++id, channelId',
      contentMixes: '++id, channelId',
      schedules: '++id, channelId, dayOfWeek, active',
      sources: '++id, name, type',
      sourceItems: '++id, sourceId, guid, fetchedAt, category',
      prompts: '++id, name, category',
      aiProviders: '++id, name, type',
      imageProviders: '++id, name, type',
      posts: '++id, channelId, category, status, createdAt',
      postVersions: '++id, postId, version',
      jobs: '++id, type, channelId, status, createdAt',
      activityLogs: '++id, type, timestamp',
      errorLogs: '++id, service, status, date',
      appSettings: '++id'
    });
  }
}

export const db = new ContentDirectorDB();

export async function initializeDatabase(): Promise<void> {
  const settingsCount = await db.appSettings.count();
  if (settingsCount === 0) {
    await db.appSettings.add({
      timezone: 'America/Toronto',
      language: 'ru',
      retryCount: 3,
      logsRetentionDays: 30,
      minCharacters: 300,
      maxCharacters: 1500,
      maxParagraphs: 5,
      maxEmojis: 5,
      maxHashtags: 5,
      headlineMaxLength: 80,
      ctaMaxLength: 100,
      qualityThreshold: 75,
      maxRegenerationAttempts: 3,
      deduplicationDays: 30,
      defaultImageSize: '1024x1024',
      autoGenerateImage: true,
      includeSourcesInPost: false,
      maxSourceLinks: 3,
      enableFactCheck: true,
      maxDailyPosts: 5,
      minIntervalHours: 2
    });
  }
}
