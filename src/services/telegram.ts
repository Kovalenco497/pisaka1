import { db } from '../db';
import { decryptKey } from './crypto';
import { logActivity } from './activity';

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

export async function testTelegramConnection(botToken: string): Promise<{ success: boolean; bot?: any; error?: string }> {
  try {
    const response = await fetch(`${TELEGRAM_API_BASE}${botToken}/getMe`);
    const data = await response.json();
    
    if (data.ok) {
      return { success: true, bot: data.result };
    } else {
      return { success: false, error: data.description || 'Unknown error' };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
  }
}

export async function sendMessage(
  botToken: string,
  chatId: string,
  text: string,
  parseMode: string = 'HTML'
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  try {
    const MAX_LENGTH = 4096;
    let truncatedText = text;
    
    if (text.length > MAX_LENGTH) {
      truncatedText = text.substring(0, MAX_LENGTH - 3) + '...';
    }
    
    const response = await fetch(`${TELEGRAM_API_BASE}${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: truncatedText,
        parse_mode: parseMode
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      return { success: true, messageId: data.result.message_id };
    } else {
      return { success: false, error: data.description || 'Failed to send message' };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send message' };
  }
}

export async function sendPhoto(
  botToken: string,
  chatId: string,
  photoUrl: string,
  caption?: string,
  parseMode: string = 'HTML'
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  try {
    const body: any = {
      chat_id: chatId,
      photo: photoUrl
    };
    
    if (caption) {
      const MAX_CAPTION_LENGTH = 1024;
      let truncatedCaption = caption;
      
      if (caption.length > MAX_CAPTION_LENGTH) {
        truncatedCaption = caption.substring(0, MAX_CAPTION_LENGTH - 3) + '...';
      }
      
      body.caption = truncatedCaption;
      body.parse_mode = parseMode;
    }
    
    const response = await fetch(`${TELEGRAM_API_BASE}${botToken}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (data.ok) {
      return { success: true, messageId: data.result.message_id };
    } else {
      return { success: false, error: data.description || 'Failed to send photo' };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send photo' };
  }
}

export async function publishPost(channelId: number, postId: number): Promise<{ success: boolean; messageId?: number; error?: string }> {
  try {
    const channel = await db.channels.get(channelId);
    const post = await db.posts.get(postId);
    
    if (!channel || !post) {
      return { success: false, error: 'Channel or post not found' };
    }
    
    if (!channel.botToken || !channel.telegramChatId) {
      return { success: false, error: 'Telegram not configured' };
    }
    
    const decryptedToken = decryptKey(channel.botToken);
    
    let result;
    if (post.imageUrl) {
      result = await sendPhoto(decryptedToken, channel.telegramChatId, post.imageUrl, post.content);
      
      if (!result.success && post.content) {
        result = await sendMessage(decryptedToken, channel.telegramChatId, post.content);
        
        if (result.success) {
          await logActivity('warning', 'Photo send failed, published text only');
        }
      }
    } else {
      result = await sendMessage(decryptedToken, channel.telegramChatId, post.content);
    }
    
    if (result.success) {
      await db.posts.update(postId, {
        status: 'published',
        publishedAt: new Date().toISOString(),
        telegramMessageId: result.messageId,
        telegramChatId: channel.telegramChatId
      });
      
      await logActivity('success', `Post published to ${channel.name}`);
    }
    
    return result;
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to publish post' };
  }
}
