import { WebClient } from "@slack/web-api";

const slack = new WebClient(process.env.SLACK_BOT_TOKEN || "xoxb-dummy-token");
const isSlackConfigured = !!process.env.SLACK_BOT_TOKEN;

interface SlackEvent {
  type: string;
  channel: string;
  user: string;
  text: string;
  ts: string;
  thread_ts?: string;
}

export async function sendSlackMessage(channel: string, text: string, threadTs?: string): Promise<string | undefined> {
  if (!isSlackConfigured) {
    console.log("Slack not configured, would send message:", text.substring(0, 100));
    return undefined;
  }

  try {
    const response = await slack.chat.postMessage({
      channel: channel,
      text: text,
      thread_ts: threadTs,
    });

    return response.ts;
  } catch (error) {
    console.error('Error sending Slack message:', error);
    throw error;
  }
}

export async function getSlackChannelHistory(channelId: string, limit = 100): Promise<any[]> {
  if (!isSlackConfigured) {
    console.log("Slack not configured, returning empty history");
    return [];
  }

  try {
    const response = await slack.conversations.history({
      channel: channelId,
      limit: limit,
    });

    return response.messages || [];
  } catch (error) {
    console.error('Error reading Slack history:', error);
    throw error;
  }
}

export function parseSlackEvent(event: SlackEvent): {
  messageId: string;
  platform: string;
  channelId: string;
  userId: string;
  content: string;
} | null {
  if (!event.text || event.type !== 'message') {
    return null;
  }

  return {
    messageId: event.ts,
    platform: 'slack',
    channelId: event.channel,
    userId: event.user,
    content: event.text,
  };
}

export { type SlackEvent };
