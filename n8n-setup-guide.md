# n8n Integration Setup Guide

This guide shows how to set up the AI Research Bot to use n8n as the primary data store and workflow engine instead of a traditional database.

## Overview

With this setup:
- n8n workflows handle all data storage and processing
- The bot sends webhooks to n8n for storage and retrieval
- Knowledge extraction and validation happen within n8n workflows
- Real-time notifications and automated processing via n8n

## Prerequisites

1. **n8n Instance**: Running n8n instance (local or cloud)
2. **Webhook URLs**: Configure webhook endpoints in n8n
3. **Environment Variables**: Set n8n connection details

## Environment Variables

Add these to your `.env` file:

```bash
# n8n Configuration
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key
N8N_WEBHOOK_URL=http://localhost:5678/webhook

# Optional: Slack notifications
SLACK_BOT_TOKEN=your_slack_bot_token
```

## n8n Workflow Setup

### 1. Import Workflows

Import these workflow files into your n8n instance:

- `n8n-workflows/knowledge-base-manager.json` - Handles knowledge pair CRUD operations
- `n8n-workflows/message-processor.json` - Processes incoming messages and extracts knowledge

### 2. Configure Webhook URLs

In n8n, make sure these webhook paths are configured:

**Knowledge Base Manager:**
- `/webhook/knowledge-pair-created` - Store new knowledge pairs
- `/webhook/get-knowledge-pairs` - Retrieve knowledge pairs with filtering
- `/webhook/search-knowledge-pairs` - Search knowledge base

**Message Processor:**
- `/webhook/message-received` - Store incoming messages
- `/webhook/process-message` - Extract knowledge from messages

### 3. Workflow Configuration

#### Knowledge Base Manager Workflow

This workflow handles:
- Storing knowledge pairs in n8n static data
- Retrieving knowledge pairs with filtering (validated, since date, etc.)
- Searching knowledge pairs with text-based similarity

#### Message Processor Workflow

This workflow:
- Stores all incoming messages
- Analyzes messages for problem-solution patterns
- Extracts knowledge pairs automatically
- Sends notifications for high-confidence extractions
- Queues low-confidence pairs for review

## API Endpoints

The bot now provides these n8n-powered endpoints:

### Knowledge Pairs
```
GET /api/knowledge-pairs
POST /api/knowledge-pairs
PUT /api/knowledge-pairs/:id
```

### Messages
```
GET /api/messages
POST /api/telegram/webhook
POST /api/slack/webhook
```

### Search
```
POST /api/search
```

## Data Flow

1. **Message Ingestion**
   - Slack/Telegram → Bot API → n8n webhook
   - n8n stores message and triggers processing

2. **Knowledge Extraction**
   - n8n analyzes message content
   - Extracts problem-solution pairs
   - Stores in workflow static data

3. **Validation & Notifications**
   - High-confidence pairs auto-approved
   - Low-confidence pairs sent for review
   - Slack notifications for team awareness

4. **Frontend Display**
   - Bot queries n8n webhooks
   - n8n returns processed data
   - Dashboard displays real-time stats

## Advantages of n8n Integration

1. **Visual Workflows**: Easy to modify extraction logic
2. **No Database**: Eliminates database setup and maintenance
3. **Automation**: Built-in triggers and notifications
4. **Scalability**: n8n handles concurrent requests
5. **Flexibility**: Easy to add new processing steps
6. **Monitoring**: n8n provides execution logs and monitoring

## Sample n8n Workflow Customizations

### Add OpenAI Integration

Add an OpenAI node to the message processor for better extraction:

```javascript
// In the Extract Knowledge node
const { Configuration, OpenAIApi } = require('openai');
const openai = new OpenAIApi(new Configuration({
  apiKey: 'your-openai-key'
}));

const response = await openai.createCompletion({
  model: 'text-davinci-003',
  prompt: `Extract problem and solution from: ${message.content}`,
  max_tokens: 200
});

// Process OpenAI response...
```

### Add External Database

Replace static data with external database connections:

```javascript
// In storage nodes, replace static data with database operations
const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL);

await client.query('INSERT INTO knowledge_pairs...', values);
```

### Add Vector Search

Integrate with vector databases like Pinecone:

```javascript
// In search node
const { PineconeClient } = require('@pinecone-database/pinecone');
const pinecone = new PineconeClient();

const results = await pinecone.query({
  vector: embedding,
  topK: 5
});
```

## Troubleshooting

### Webhooks Not Working
- Check n8n webhook URLs are accessible
- Verify webhook paths match exactly
- Check n8n execution logs for errors

### No Data Appearing
- Verify workflows are active in n8n
- Check static data in workflow executions
- Ensure webhook responses are properly formatted

### Performance Issues
- Consider using external database instead of static data
- Implement caching for frequently accessed data
- Use n8n's queue mode for high-volume processing

## Next Steps

1. Import the provided workflows into n8n
2. Configure webhook URLs and test connections
3. Set up Slack notifications for team collaboration
4. Customize extraction logic based on your data patterns
5. Add external integrations (databases, AI services, etc.)

The n8n integration provides a powerful, visual way to manage your AI research bot's data and workflows without traditional database complexity.