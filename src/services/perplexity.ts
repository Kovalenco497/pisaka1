import { db } from '../db';
import { decryptKey } from './crypto';
import { logActivity } from './activity';
import { renderTemplate, buildPostContext } from './templateRenderer';

export async function generateContentWithAI(
  prompt: string,
  systemPrompt?: string
): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    const providers = await db.aiProviders.toArray();
    const provider = providers.find(p => p.type === 'perplexity' && p.active) || 
                     providers.find(p => p.active);
    
    if (!provider) {
      return { success: false, error: 'No active AI provider found' };
    }
    
    const apiKey = decryptKey(provider.apiKey);
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: provider.model || 'sonar',
        messages: [
          { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      if (content) {
        return { success: true, content };
      }
    }
    
    return { success: false, error: 'Failed to generate content' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function generatePostWithPipeline(
  profile: any,
  channel: any,
  category: string,
  topic: string
): Promise<{ success: boolean; content?: string; error?: string; categoryUsed?: string }> {
  await logActivity('info', `Pipeline: generating post for category "${category}"`);
  
  const categoryPrompt = await getCategoryPrompt(category, profile);
  
  if (!categoryPrompt) {
    return { 
      success: false, 
      error: `Prompt for category "${category}" not found`,
      categoryUsed: category
    };
  }
  
  const context = buildPostContext(profile, channel, category, topic);
  const { rendered } = renderTemplate(categoryPrompt, context);
  
  const systemPrompt = `You are a professional copywriter for Telegram channel "${profile?.brand || channel?.name || ''}".
TOPIC: ${topic}
CHANNEL: ${profile?.brand || channel?.name || ''}
AUDIENCE: ${profile?.audience || ''}
TONE: ${profile?.toneOfVoice || ''}

Write a post now. No introductions, just the post itself.`;
  
  const result = await generateContentWithAI(rendered, systemPrompt);
  
  return { ...result, categoryUsed: category };
}

async function getCategoryPrompt(category: string, profile?: any): Promise<string | null> {
  if (profile) {
    const promptField = `${category}Prompt`;
    if (profile[promptField]) {
      return profile[promptField];
    }
  }
  
  const prompts = await db.prompts.toArray();
  const activePrompt = prompts.find(p => p.category === category && p.active);
  if (activePrompt) return activePrompt.content;
  
  const anyPrompt = prompts.find(p => p.category === category);
  if (anyPrompt) return anyPrompt.content;
  
  return null;
}
