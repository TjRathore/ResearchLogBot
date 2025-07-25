interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
    title?: string;
    username?: string;
  };
  date: number;
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "dummy_token";
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const isTelegramConfigured = !!process.env.TELEGRAM_BOT_TOKEN;

export async function sendTelegramMessage(chatId: number, text: string, replyToMessageId?: number): Promise<void> {
  if (!isTelegramConfigured) {
    console.log("Telegram not configured, would send message:", text.substring(0, 100));
    return;
  }

  try {
    const payload: any = {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    };

    if (replyToMessageId) {
      payload.reply_to_message_id = replyToMessageId;
    }

    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Telegram API error: ${error}`);
    }
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    throw error;
  }
}

export async function setTelegramWebhook(webhookUrl: string): Promise<void> {
  if (!isTelegramConfigured) {
    console.log("Telegram not configured, would set webhook:", webhookUrl);
    return;
  }

  try {
    const response = await fetch(`${TELEGRAM_API_URL}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to set webhook: ${error}`);
    }

    console.log('Telegram webhook set successfully');
  } catch (error) {
    console.error('Failed to set Telegram webhook:', error);
    throw error;
  }
}

export function parseTelegramUpdate(update: TelegramUpdate): {
  messageId: string;
  platform: string;
  channelId: string;
  userId: string;
  content: string;
} | null {
  if (!update.message || !update.message.text) {
    return null;
  }

  const message = update.message;
  
  return {
    messageId: message.message_id.toString(),
    platform: 'telegram',
    channelId: message.chat.id.toString(),
    userId: message.from.id.toString(),
    content: message.text || "",
  };
}

export { type TelegramUpdate };
