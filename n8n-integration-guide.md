# n8n Integration Guide for AI Research Bot

This guide explains how to integrate the AI Research Bot's knowledge pairs with n8n workflows.

## Available API Endpoints

### 1. Knowledge Pairs Management

#### Get Knowledge Pairs
```
GET /api/n8n/knowledge-pairs
```

**Query Parameters:**
- `limit` (default: 100) - Number of records to return
- `offset` (default: 0) - Pagination offset
- `validated` (optional) - Filter by validation status (true/false)
- `since` (optional) - ISO date string to get records since a specific time

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "problem": "How to fix API timeout errors",
      "solution": "Increase timeout values and implement retry logic",
      "confidence_score": 0.95,
      "validated": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "metadata": {
    "total": 100,
    "limit": 100,
    "offset": 0,
    "hasMore": false
  }
}
```

#### Create Knowledge Pair
```
POST /api/n8n/knowledge-pairs
```

**Request Body:**
```json
{
  "problem": "How to optimize database queries",
  "solution": "Use indexes and query optimization techniques",
  "confidence_score": 0.9,
  "validated": false
}
```

#### Update Knowledge Pair
```
PUT /api/n8n/knowledge-pairs/:id
```

**Request Body:**
```json
{
  "problem": "Updated problem description",
  "solution": "Updated solution",
  "confidence_score": 0.95,
  "validated": true
}
```

### 2. Messages Management

#### Get Messages
```
GET /api/n8n/messages
```

**Query Parameters:**
- `limit` (default: 100) - Number of records to return
- `offset` (default: 0) - Pagination offset
- `platform` (optional) - Filter by platform (slack/telegram)
- `processed` (optional) - Filter by processing status (true/false)
- `since` (optional) - ISO date string to get records since a specific time

### 3. Search Knowledge Base

#### Search Knowledge Pairs
```
POST /api/n8n/search
```

**Request Body:**
```json
{
  "query": "How to handle API timeouts",
  "limit": 5,
  "min_similarity": 0.3
}
```

**Response:**
```json
{
  "query": "How to handle API timeouts",
  "results": [
    {
      "id": "uuid",
      "problem": "API timeout handling",
      "solution": "Implement proper timeout and retry logic",
      "similarity": 0.85,
      "confidence_score": 0.9,
      "validated": true
    }
  ],
  "total_found": 1
}
```

### 4. Webhook Registration

#### Register Webhook
```
POST /api/n8n/webhook/register
```

**Request Body:**
```json
{
  "webhook_url": "https://your-n8n-instance.com/webhook/knowledge-bot",
  "events": ["created", "updated", "validated"]
}
```

## n8n Workflow Examples

### Example 1: Sync Knowledge Pairs to External System

1. **HTTP Request Node** (Trigger every 5 minutes)
   - Method: GET
   - URL: `http://your-bot-url/api/n8n/knowledge-pairs?since=2024-01-01T00:00:00Z&validated=true`

2. **Code Node** (Process data)
   ```javascript
   // Transform data for external system
   const knowledgePairs = items[0].json.data;
   
   return knowledgePairs.map(pair => ({
     external_id: pair.id,
     title: pair.problem,
     content: pair.solution,
     confidence: pair.confidence_score,
     tags: ["ai-research-bot", pair.validated ? "validated" : "pending"]
   }));
   ```

3. **HTTP Request Node** (Send to external system)
   - Method: POST
   - URL: Your external system endpoint
   - Body: Processed data

### Example 2: Auto-Validate High-Confidence Knowledge Pairs

1. **Webhook Node** (Listen for new knowledge pairs)
   - Register webhook with the bot using `/api/n8n/webhook/register`

2. **IF Node** (Check confidence score)
   - Condition: `{{ $json.confidence_score >= 0.9 }}`

3. **HTTP Request Node** (Auto-validate)
   - Method: PUT
   - URL: `http://your-bot-url/api/n8n/knowledge-pairs/{{ $json.id }}`
   - Body: `{ "validated": true }`

### Example 3: Create Knowledge Pairs from External Sources

1. **RSS Feed Trigger** or **HTTP Request Node** (Get external data)

2. **Code Node** (Extract problem-solution pairs)
   ```javascript
   // Process RSS or API data to extract Q&A pairs
   const items = $input.all();
   
   return items.map(item => {
     const content = item.json.description || item.json.content;
     
     // Simple extraction logic (you might use AI here)
     if (content.includes('Q:') && content.includes('A:')) {
       const parts = content.split('A:');
       const problem = parts[0].replace('Q:', '').trim();
       const solution = parts[1].trim();
       
       return {
         problem,
         solution,
         confidence_score: 0.7,
         validated: false
       };
     }
     
     return null;
   }).filter(Boolean);
   ```

3. **HTTP Request Node** (Create knowledge pair)
   - Method: POST
   - URL: `http://your-bot-url/api/n8n/knowledge-pairs`
   - Body: Processed data

### Example 4: Monitor and Alert on Knowledge Base Changes

1. **Schedule Trigger** (Check every hour)

2. **HTTP Request Node** (Get recent knowledge pairs)
   - Method: GET
   - URL: `http://your-bot-url/api/n8n/knowledge-pairs?since={{ $now.minus({hours: 1}).toISO() }}`

3. **IF Node** (Check if new pairs exist)
   - Condition: `{{ $json.data.length > 0 }}`

4. **Slack/Email Node** (Send notification)
   - Message: `New knowledge pairs added: {{ $json.data.length }} pairs`

## Authentication

Currently, the API endpoints don't require authentication. For production use, consider:

1. Adding API key authentication
2. Implementing rate limiting
3. Adding CORS configuration for web-based n8n instances

## Rate Limiting

The API doesn't currently implement rate limiting. For high-volume usage:

1. Implement proper pagination using `limit` and `offset`
2. Use `since` parameter to get incremental updates
3. Cache responses when possible

## Error Handling

All endpoints return standard HTTP status codes:
- 200: Success
- 201: Created (for POST requests)
- 400: Bad Request (missing required fields)
- 404: Not Found
- 500: Internal Server Error

Error responses include a message:
```json
{
  "error": "Problem and solution are required"
}
```

## Next Steps

1. Set up your n8n instance
2. Create workflows using the examples above
3. Register webhooks for real-time updates
4. Monitor the integration using the bot's admin dashboard