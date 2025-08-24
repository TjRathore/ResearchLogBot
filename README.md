# AI Research Logging Bot

An intelligent bot system that monitors Telegram and Slack messages in real-time, extracts problem-solution pairs using AI, and provides a community-driven knowledge management system with Stack Overflow-style features.

## 🌟 Features

### Core Functionality
- **Real-time Message Monitoring**: Tracks messages from Slack workspaces and Telegram channels
- **AI-Powered Extraction**: Automatically identifies and extracts problem-solution pairs from conversations
- **n8n Workflow Integration**: Uses n8n as the primary data store and workflow engine for scalable automation
- **Stack Overflow-Style Interface**: Community-driven validation with upvoting, downvoting, and related questions

### Knowledge Management
- **Voting System**: Upvote/downvote knowledge pairs to surface the best solutions
- **Related Questions**: Automatically suggests similar problems based on tags and content similarity
- **Tag-Based Organization**: Categorizes knowledge pairs with relevant technology tags
- **Confidence Scoring**: AI-generated confidence scores for automated quality assessment
- **Community Validation**: Human review process for high-quality knowledge curation

### Admin Dashboard
- **Dashboard Overview**: Statistics, recent activity, and quick search functionality
- **Knowledge Pairs Management**: Browse, validate, edit, and organize extracted knowledge
- **Message Monitoring**: Track incoming messages and processing status
- **Advanced Search**: Semantic and keyword-based search with filtering options
- **Settings Panel**: Bot configuration and connection status monitoring

## 🏗️ Architecture

### System Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Slack/Telegram │────│   Webhooks      │────│   Express API   │
│   Messages       │    │   Integration   │    │   Server        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                               ┌─────────────────┐
                                               │   n8n Workflows │
                                               │   Data Engine   │
                                               └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Admin   │────│   REST API      │────│   PostgreSQL    │
│   Dashboard     │    │   Endpoints     │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend
- **React 18** with TypeScript for type-safe component development
- **Vite** for fast development and optimized production builds
- **Tailwind CSS** with shadcn/ui components for modern, responsive design
- **TanStack Query** for efficient server state management and caching
- **Wouter** for lightweight client-side routing

#### Backend
- **Node.js** with Express.js for RESTful API server
- **TypeScript** with ES modules for modern JavaScript development
- **PostgreSQL** with Drizzle ORM for type-safe database operations
- **n8n Integration** for workflow-based data processing and storage

#### External Services
- **OpenAI GPT-4o** for text processing and problem-solution extraction
- **OpenAI text-embedding-ada-002** for semantic search capabilities
- **Slack Web API** for workspace integration and message handling
- **Telegram Bot API** for bot functionality and webhook processing

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (Neon Database recommended)
- n8n instance (cloud or self-hosted)
- API keys for external services

### Environment Variables
Create a `.env` file with the following variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# AI Services
OPENAI_API_KEY=sk-your-openai-api-key-here

# Bot Integration
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# n8n Integration
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
N8N_API_KEY=your-n8n-api-key
```

### Installation

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd ai-research-bot
   npm install
   ```

2. **Database Setup**
   ```bash
   # Run database migrations
   npm run db:migrate
   
   # Generate database schema
   npm run db:generate
   ```

3. **n8n Workflow Configuration**
   - Import the provided workflow files from `n8n-workflows/` directory
   - Configure webhook URLs in your n8n instance
   - Set up the knowledge base manager and message processor workflows

4. **Bot Platform Setup**
   
   **Slack Setup:**
   - Create a Slack app in your workspace
   - Configure OAuth scopes: `channels:read`, `chat:write`, `im:read`
   - Set up Event Subscriptions with your webhook URL
   - Install the app to your workspace

   **Telegram Setup:**
   - Create a bot using @BotFather
   - Set the webhook URL: `/setwebhook`
   - Configure bot commands and permissions

5. **Start the Application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## 📁 Project Structure

```
ai-research-bot/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Application pages/routes
│   │   ├── hooks/            # Custom React hooks
│   │   └── lib/              # Utility functions and configurations
│   └── index.html
├── server/                    # Express.js backend
│   ├── services/             # External API integrations
│   ├── storage/              # Data access layer
│   ├── routes.ts             # API route definitions
│   └── index.ts              # Server entry point
├── shared/                    # Shared TypeScript schemas
│   └── schema.ts             # Database and API type definitions
├── n8n-workflows/            # n8n workflow configurations
│   ├── knowledge-base-manager.json
│   ├── message-processor.json
│   └── webhook-integrations.json
└── docs/                     # Documentation files
    ├── n8n-setup-guide.md
    └── api-documentation.md
```

## 🔧 Key Components

### n8n Workflow Engine
The system uses n8n as the primary data processing engine:

- **Knowledge Base Manager**: Stores and retrieves problem-solution pairs
- **Message Processor**: Handles incoming messages and extracts knowledge
- **Webhook Integration**: Real-time data synchronization
- **Automated Validation**: Pattern-based quality assessment

### Stack Overflow-Style Features

#### Voting System
- **Upvote/Downvote**: Community-driven quality assessment
- **Vote Persistence**: Tracks voting history and prevents duplicate votes
- **Score Calculation**: Net score (upvotes - downvotes) for ranking

#### Related Questions
- **Tag-Based Matching**: Finds questions with similar technology tags
- **Content Similarity**: Semantic matching for related problems
- **Dynamic Updates**: Real-time suggestions as content grows

#### Community Validation
- **Confidence Scoring**: AI-generated quality indicators
- **Human Review**: Manual validation for high-confidence pairs
- **Status Tracking**: Validated, pending, and flagged states

### API Endpoints

#### Knowledge Pairs
- `GET /api/knowledge-pairs` - List all knowledge pairs with filtering
- `POST /api/knowledge-pairs` - Create new knowledge pair
- `PATCH /api/knowledge-pairs/:id` - Update existing pair
- `DELETE /api/knowledge-pairs/:id` - Remove knowledge pair
- `POST /api/knowledge-pairs/:id/vote` - Vote on knowledge pair
- `GET /api/knowledge-pairs/:id/related` - Get related questions
- `POST /api/knowledge-pairs/:id/view` - Increment view count

#### Search and Discovery
- `POST /api/search` - Semantic and keyword search
- `GET /api/stats` - Dashboard statistics and metrics

#### Message Processing
- `GET /api/messages` - Recent messages and processing status
- `POST /api/webhooks/slack` - Slack message webhook
- `POST /api/webhooks/telegram` - Telegram message webhook

## 🎯 Usage Guide

### For Administrators

1. **Access the Dashboard**: Navigate to the admin interface at `/`
2. **Monitor Activity**: Review incoming messages and processing status
3. **Validate Knowledge**: Review and approve extracted problem-solution pairs
4. **Manage Quality**: Use voting and flagging to maintain content quality
5. **Search Knowledge**: Test search functionality and browse categories

### For End Users (Bot Interaction)

**Slack Commands:**
```
/search [query] - Search the knowledge base
/ask [question] - Ask a question and get AI-powered responses
/latest - Get recent validated solutions
```

**Telegram Commands:**
```
/search query - Search for solutions
/ask question - Ask for help
/stats - View knowledge base statistics
```

## 🔍 Search Capabilities

### Semantic Search
- **Vector Embeddings**: OpenAI text-embedding-ada-002 for semantic understanding
- **Similarity Matching**: Finds conceptually related content
- **Context Awareness**: Understands intent behind queries

### Keyword Search
- **Full-text Search**: Traditional keyword-based search
- **Tag Filtering**: Search within specific technology categories
- **Content Matching**: Searches problem and solution text

### Advanced Filtering
- **Status Filters**: Validated, pending, flagged content
- **Date Ranges**: Search within specific time periods
- **Source Platforms**: Filter by Slack or Telegram origin
- **Confidence Scores**: Filter by AI confidence levels

## 📊 Monitoring and Analytics

### Dashboard Metrics
- **Knowledge Pairs**: Total count and validation status
- **Message Processing**: Throughput and success rates
- **User Engagement**: Views, votes, and search activity
- **Quality Metrics**: Confidence scores and validation rates

### Performance Monitoring
- **API Response Times**: Track endpoint performance
- **Database Queries**: Monitor query efficiency
- **External API Usage**: Track OpenAI and n8n API calls
- **Error Rates**: Monitor system reliability

## 🔐 Security Considerations

### API Security
- **Environment Variables**: Secure storage of API keys and credentials
- **CORS Configuration**: Proper cross-origin request handling
- **Rate Limiting**: Prevent abuse of API endpoints

### Data Privacy
- **Message Processing**: Configurable data retention policies
- **User Privacy**: No personal data storage without consent
- **Secure Transmission**: HTTPS for all external communications

## 🚀 Deployment

### Replit Deployment
The application is optimized for Replit deployment:

1. **Automatic Scaling**: Replit handles traffic scaling automatically
2. **Environment Management**: Secure environment variable handling
3. **Database Integration**: Built-in PostgreSQL support
4. **Domain Management**: Custom domain configuration available

### Production Considerations
- **Database Optimization**: Index configuration for search performance
- **Caching Strategy**: Redis implementation for high-traffic scenarios
- **Load Balancing**: Multiple instance deployment for scalability
- **Monitoring**: Application performance monitoring (APM) integration

## 🛠️ Development

### Local Development
```bash
# Start development server
npm run dev

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

### Database Management
```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# Reset database
npm run db:reset
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request with detailed description

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `docs/` directory
- Review the n8n setup guide for workflow configuration

---

Built with ❤️ using modern web technologies and AI-powered automation.