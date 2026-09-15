export interface TemplateContext {
  [key: string]: string | undefined;
}

export interface RenderResult {
  rendered: string;
  unresolved: string[];
}

export function renderTemplate(template: string, context: TemplateContext): RenderResult {
  const unresolved: string[] = [];
  
  let rendered = template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = context[key];
    if (value !== undefined && value !== '') {
      return value;
    }
    unresolved.push(key);
    return '';
  });
  
  rendered = rendered.replace(/\n{3,}/g, '\n\n').trim();
  
  return { rendered, unresolved };
}

export function buildPostContext(
  profile: any,
  channel: any,
  category: string,
  topic: string
): TemplateContext {
  const now = new Date();
  
  return {
    channel_name: channel?.name || '',
    brand_name: profile?.brand || '',
    business_description: profile?.businessDescription || '',
    niche: profile?.niche || '',
    country: profile?.country || '',
    city: profile?.city || '',
    region: profile?.region || profile?.geography || `${profile?.city || ''}, ${profile?.country || ''}`.replace(/,\s*$/, ''),
    language: profile?.language || 'ru',
    audience: profile?.audience || '',
    tone_of_voice: profile?.toneOfVoice || '',
    phone: profile?.phone || '',
    whatsapp: profile?.whatsapp || '',
    website: profile?.website || '',
    cta: profile?.requiredCTA || '',
    hashtags: profile?.hashtags || '',
    category,
    topic,
    current_date: now.toLocaleDateString('ru-RU'),
    current_time: now.toLocaleTimeString('ru-RU'),
    timezone: 'America/Toronto'
  };
}
