# Complete n8n Integration Guide for AI Research Bot

This guide provides everything you need to set up the AI Research Bot with n8n as the primary data store and workflow engine.

## Quick Start

1. **Set up n8n instance** (local or cloud)
2. **Import the provided workflows** into n8n
3. **Configure environment variables** in your bot
4. **Test the integration** with sample messages
5. **Customize workflows** as needed

## Prerequisites

### n8n Installation

**Option A: Local n8n (Recommended for development)**
```bash
npx n8n
# n8n will start on http://localhost:5678
```

**Option B: n8n Cloud**
- Sign up at https://n8n.io
- Get your webhook URLs from the cloud dashboard

**Option C: Docker**
```bash
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
```

### Environment Variables

Add these to your `.env` file:
```bash
# n8n Configuration
N8N_BASE_URL=http://localhost:5678
N8N_WEBHOOK_URL=http://localhost:5678/webhook

# Optional: Enhanced features
OPENAI_API_KEY=your_openai_api_key_here
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

## Workflow Setup

### 1. Import Workflows

In your n8n interface:

1. Go to **Workflows** → **Import from URL** or **Import from File**
2. Import these files from your project:
   - `n8n-workflows/knowledge-base-manager.json`
   - `n8n-workflows/message-processor.json`

### 2. Activate Workflows

After importing:
1. Open each workflow
2. Click **Activate** in the top-right corner
3. Verify webhook URLs are accessible

## Workflow Details

### Knowledge Base Manager (`knowledge-base-manager.json`)

**Purpose**: Handles CRUD operations for knowledge pairs

**Webhooks**:
- `POST /webhook/knowledge-pair-created` - Store new knowledge pairs
- `POST /webhook/get-knowledge-pairs` - Retrieve knowledge pairs with filtering
- `POST /webhook/search-knowledge-pairs` - Search knowledge base

**Features**:
- Stores data in workflow static data
- Supports filtering by validation status and date
- Text-based similarity search
- Pagination support

### Message Processor (`message-processor.json`)

**Purpose**: Processes incoming messages and extracts knowledge

**Webhooks**:
- `POST /webhook/message-received` - Store incoming messages  
- `POST /webhook/process-message` - Extract knowledge from messages

**Features**:
- Automatic pattern recognition for Q&A pairs
- Confidence scoring for extractions
- Slack notifications for high-confidence pairs
- Review queue for low-confidence extractions

## API Integration

### Bot → n8n Communication

The bot sends data to n8n via webhook calls:

```javascript
// Example: Storing a new message
const response = await fetch('http://localhost:5678/webhook/message-received', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'create',
    data: {
      id: 'msg_123',
      platform: 'slack',
      content: 'How do I optimize React performance?'
    }
  })
});
```

### n8n → Bot Communication

n8n can trigger bot actions via HTTP requests:

```javascript
// In n8n HTTP Request node
{
  "url": "http://your-bot-url/api/knowledge-pairs",
  "method": "POST",
  "body": {
    "problem": "{{ $json.problem }}",
    "solution": "{{ $json.solution }}"
  }
}
```

## Data Flow Examples

### 1. New Message Processing

1. **Slack/Telegram** sends webhook to bot
2. **Bot** stores message via n8n webhook
3. **n8n Message Processor** analyzes content
4. **n8n** extracts problem-solution pairs
5. **n8n** sends notifications if high confidence
6. **Bot dashboard** displays updated data

### 2. Knowledge Base Search

1. **User** searches via bot dashboard
2. **Bot** queries n8n search webhook
3. **n8n** performs text similarity matching
4. **n8n** returns ranked results
5. **Bot** displays results to user

## Customizing Workflows

### Adding OpenAI Integration

Enhance the Message Processor with OpenAI:

1. Add **OpenAI** node to the workflow
2. Configure with your API key
3. Replace the JavaScript extraction code:

```javascript
// In the Extract Knowledge node
const openaiResponse = await $httpRequest({
  url: 'https://api.openai.com/v1/chat/completions',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + $credentials.openAIApi.apiKey,
    'Content-Type': 'application/json'
  },
  body: {
    model: 'gpt-4',
    messages: [{
      role: 'user',
      content: `Extract problem and solution from: "${message.content}"`
    }]
  }
});

// Process OpenAI response...
```

### Adding Database Storage

Replace static data with external database:

1. Add **Postgres** or **MySQL** node
2. Configure connection credentials
3. Replace static data operations with SQL queries:

```javascript
// Replace static data operations
const insertQuery = `
  INSERT INTO knowledge_pairs (problem, solution, confidence_score) 
  VALUES ($1, $2, $3) RETURNING id
`;

const result = await $database.query(insertQuery, [
  knowledgePair.problem,
  knowledgePair.solution,
  knowledgePair.confidence_score
]);
```

### Adding Slack Notifications

Configure Slack notifications for team collaboration:

1. Add **Slack** node to workflows
2. Configure with your bot token
3. Set up notification triggers:

```javascript
// In notification nodes
{
  "channel": "#ai-research-bot",
  "text": "🧠 New knowledge pair extracted:\n\n*Problem:* {{ $json.problem }}\n*Solution:* {{ $json.solution }}\n*Confidence:* {{ $json.confidence_score }}"
}
```

## Advanced Features

### Vector Search with Pinecone

For semantic search capabilities:

1. Add **HTTP Request** node for Pinecone API
2. Generate embeddings with OpenAI
3. Store and query vectors:

```javascript
// Generate embedding
const embedding = await openai.createEmbedding({
  model: 'text-embedding-ada-002',
  input: `${problem} ${solution}`
});

// Store in Pinecone
await pinecone.upsert({
  vectors: [{
    id: knowledgePair.id,
    values: embedding.data[0].embedding,
    metadata: { problem, solution }
  }]
});
```

### Automated Validation

Implement smart validation rules:

```javascript
// In validation logic
const autoValidate = (pair) => {
  // High confidence + good patterns = auto-validate
  if (pair.confidence_score > 0.9 && 
      pair.problem.includes('?') && 
      pair.solution.length > 50) {
    return true;
  }
  
  // Technical keywords = higher confidence
  const techKeywords = ['react', 'javascript', 'api', 'database'];
  const hasTechKeywords = techKeywords.some(keyword => 
    pair.problem.toLowerCase().includes(keyword)
  );
  
  return pair.confidence_score > 0.85 && hasTechKeywords;
};
```

## Monitoring and Debugging

### n8n Execution Logs

1. Go to **Executions** in n8n
2. Click on any execution to see detailed logs
3. Check each node's input/output data
4. Look for error messages in failed executions

### Bot Dashboard Integration

The bot provides these endpoints for monitoring:

- `GET /api/knowledge-pairs` - View all knowledge pairs
- `GET /api/messages` - View processed messages  
- `GET /api/stats` - Get system statistics
- `POST /api/search` - Test search functionality

### Common Issues

**Webhooks not working**:
- Check n8n is running and accessible
- Verify webhook URLs match exactly
- Check network connectivity between bot and n8n

**No data appearing**:
- Verify workflows are activated
- Check execution logs for errors
- Ensure webhook payloads are correct format

**Performance issues**:
- Consider external database for large datasets
- Implement caching for frequently accessed data
- Use n8n's queue mode for high-volume processing

## Production Deployment

### Security Considerations

1. **Authentication**: Set up n8n with proper authentication
2. **HTTPS**: Use secure connections in production
3. **API Keys**: Store sensitive credentials in n8n's credential store
4. **Access Control**: Limit webhook access to authorized sources

### Scaling Options

1. **n8n Cloud**: Automatic scaling and maintenance
2. **Queue Mode**: Handle high-volume processing
3. **Multiple Instances**: Load balance across n8n instances
4. **Database Backend**: Replace static data with scalable database

### Backup Strategy

1. **Export Workflows**: Regular workflow JSON exports
2. **Static Data**: Backup workflow static data
3. **Credentials**: Secure backup of n8n credentials
4. **Version Control**: Track workflow changes over time

## Next Steps

1. **Start with basic setup** using the provided workflows
2. **Test with sample messages** to verify integration
3. **Customize extraction logic** for your specific use cases
4. **Add external integrations** (OpenAI, databases, notifications)
5. **Scale up** with production-ready configurations

The n8n integration provides a powerful, visual approach to managing your AI research bot's data and workflows. You can easily modify the logic without touching code, monitor executions in real-time, and scale as your needs grow.

## Support

- **n8n Documentation**: https://docs.n8n.io
- **n8n Community**: https://community.n8n.io
- **Workflow Examples**: Check the `n8n-workflows/` directory for more examples
- **Bot Issues**: Check the application logs and n8n execution history