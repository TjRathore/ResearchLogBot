// @ts-ignore
import fetch from 'node-fetch';

interface N8nConfig {
  baseUrl: string;
  apiKey?: string;
  webhookUrl?: string;
}

interface KnowledgePair {
  id: string;
  problem: string;
  solution: string;
  confidence_score: number;
  validated: boolean;
  created_at: string;
  updated_at?: string;
  source_platform?: string;
  source_channel?: string;
}

interface Message {
  id: string;
  platform: string;
  channel_id: string;
  user_id: string;
  content: string;
  processed: boolean;
  timestamp: string;
}

class N8nService {
  private config: N8nConfig;

  constructor(config: N8nConfig) {
    this.config = config;
  }

  private async makeRequest(endpoint: string, options: any = {}) {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`n8n API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Knowledge Pairs Management
  async createKnowledgePair(data: Omit<KnowledgePair, 'id' | 'created_at'>): Promise<KnowledgePair> {
    const knowledgePair = {
      ...data,
      id: `kp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    };

    // Store in n8n workflow via webhook
    if (this.config.webhookUrl) {
      await this.makeRequest('/webhook/knowledge-pair-created', {
        method: 'POST',
        body: JSON.stringify({
          action: 'create',
          data: knowledgePair
        })
      });
    }

    return knowledgePair;
  }

  async getKnowledgePairs(options: {
    limit?: number;
    offset?: number;
    validated?: boolean;
    since?: string;
  } = {}): Promise<{ data: KnowledgePair[]; total: number }> {
    try {
      // Trigger n8n workflow to get knowledge pairs
      const result = await this.makeRequest('/webhook/get-knowledge-pairs', {
        method: 'POST',
        body: JSON.stringify(options)
      });

      return {
        data: result.knowledge_pairs || [],
        total: result.total || 0
      };
    } catch (error) {
      console.log('n8n not configured, using fallback data');
      // Don't return empty data - let the storage layer handle fallback
      throw error;
    }
  }

  async updateKnowledgePair(id: string, updates: Partial<KnowledgePair>): Promise<KnowledgePair | null> {
    try {
      const result = await this.makeRequest('/webhook/update-knowledge-pair', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update',
          id,
          updates: {
            ...updates,
            updated_at: new Date().toISOString()
          }
        })
      });

      return result.knowledge_pair || null;
    } catch (error) {
      console.log('n8n not configured, skipping knowledge pair update');
      return null;
    }
  }

  async searchKnowledgePairs(query: string, options: {
    limit?: number;
    min_similarity?: number;
  } = {}): Promise<KnowledgePair[]> {
    try {
      const result = await this.makeRequest('/webhook/search-knowledge-pairs', {
        method: 'POST',
        body: JSON.stringify({
          query,
          ...options
        })
      });

      return result.results || [];
    } catch (error) {
      console.log('n8n not configured, using fallback data');
      // Don't return empty data - let the storage layer handle fallback
      throw error;
    }
  }

  // Messages Management
  async createMessage(data: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    const message = {
      ...data,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    // Store message in n8n workflow
    if (this.config.webhookUrl) {
      await this.makeRequest('/webhook/message-received', {
        method: 'POST',
        body: JSON.stringify({
          action: 'create',
          data: message
        })
      });
    }

    return message;
  }

  async getMessages(options: {
    limit?: number;
    offset?: number;
    platform?: string;
    processed?: boolean;
    since?: string;
  } = {}): Promise<{ data: Message[]; total: number }> {
    try {
      const result = await this.makeRequest('/webhook/get-messages', {
        method: 'POST',
        body: JSON.stringify(options)
      });

      return {
        data: result.messages || [],
        total: result.total || 0
      };
    } catch (error) {
      console.log('n8n not configured, using fallback data');
      // Don't return empty data - let the storage layer handle fallback
      throw error;
    }
  }

  // Analytics and Stats
  async getStats(): Promise<any> {
    try {
      const result = await this.makeRequest('/webhook/get-stats', {
        method: 'POST',
        body: JSON.stringify({})
      });

      return result.stats || {
        knowledgePairs: 0,
        messagesProcessed: 0,
        accuracy: "0.0",
        activeChannels: 0,
        validated: 0,
        pending: 0,
        flagged: 0
      };
    } catch (error) {
      console.log('n8n not configured, using fallback data');
      // Don't return empty data - let the storage layer handle fallback
      throw error;
    }
  }

  // Workflow Triggers
  async triggerWorkflow(workflowName: string, data: any): Promise<any> {
    try {
      return await this.makeRequest(`/webhook/${workflowName}`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.log(`n8n workflow ${workflowName} not configured`);
      return null;
    }
  }

  // Processing Workflows
  async processMessage(message: Message): Promise<void> {
    await this.triggerWorkflow('process-message', {
      action: 'extract_knowledge',
      message
    });
  }

  async validateKnowledgePair(id: string): Promise<void> {
    await this.triggerWorkflow('validate-knowledge-pair', {
      action: 'validate',
      id
    });
  }

  async flagKnowledgePair(id: string): Promise<void> {
    await this.triggerWorkflow('flag-knowledge-pair', {
      action: 'flag',
      id
    });
  }
}

// Create n8n service instance
const n8nConfig: N8nConfig = {
  baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
  apiKey: process.env.N8N_API_KEY,
  webhookUrl: process.env.N8N_WEBHOOK_URL
};

export const n8nService = new N8nService(n8nConfig);
export { N8nService, type KnowledgePair, type Message };