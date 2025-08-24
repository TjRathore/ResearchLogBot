# AI Research Bot - Replit Configuration

## Overview

This is a full-stack AI Research Bot application that uses n8n as the primary data store and workflow engine instead of traditional databases. The bot monitors Slack and Telegram messages, extracts problem-solution pairs through n8n workflows, and provides intelligent responses through a visual workflow-based knowledge management system. The application features a React-based admin dashboard for managing extracted knowledge pairs and monitoring bot activities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend concerns:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **AI Integration**: OpenAI GPT-4o for text processing and embeddings
- **External APIs**: Slack Web API and Telegram Bot API for messaging platform integration

## Key Components

### n8n Workflow Data Management
The application uses n8n workflows for data storage and processing:
- **Knowledge Base Manager**: Stores and retrieves problem-solution pairs with filtering and search capabilities
- **Message Processor**: Handles incoming messages and extracts knowledge pairs automatically
- **Webhook Integration**: Real-time data synchronization between the bot and n8n workflows

### Core Services
- **n8n Service**: Manages communication with n8n workflows for data operations and automation
- **n8n Storage**: Provides storage abstraction layer using n8n webhooks instead of database
- **Quality Scorer Service**: Automated confidence scoring and quality metrics using AI analysis and heuristic algorithms
- **OpenAI Service** (Optional): Enhanced text processing and embedding generation when API key is provided
- **Telegram Service**: Manages Telegram bot webhook integration and message handling
- **Slack Service**: Handles Slack Events API integration and message processing

### Admin Dashboard Pages
- **Dashboard**: Overview with statistics and quick search functionality
- **Knowledge Pairs**: Stack Overflow-style interface with upvoting/downvoting and related queries
- **Quality Dashboard**: Comprehensive quality metrics, batch processing, and automated scoring
- **Messages**: Monitor incoming messages from both platforms
- **Search**: Test the knowledge base search functionality
- **Settings**: Bot configuration and connection status

## Data Flow

1. **Message Ingestion**: Webhooks receive messages from Slack and Telegram platforms
2. **n8n Storage**: Messages are sent to n8n workflows via webhooks for storage and processing
3. **Automated Processing**: n8n workflows automatically extract problem-solution pairs using pattern matching
4. **Quality Scoring**: Multi-layered quality assessment combining AI analysis, heuristic scoring, and community feedback
5. **Auto-Validation**: High-quality pairs with confidence scores above 85% are automatically validated
6. **Community Validation**: Stack Overflow-style voting system provides ongoing quality improvement
7. **Knowledge Base**: Validated pairs stored with comprehensive quality metrics and related query relationships
8. **Bot Responses**: Commands trigger intelligent search with quality-weighted results

## External Dependencies

### Required APIs and Services
- **OpenAI API**: GPT-4o for text processing and text-embedding-ada-002 for embeddings
- **Slack Bot Token**: For Slack workspace integration and message handling
- **Telegram Bot Token**: For Telegram bot functionality and webhook handling
- **PostgreSQL Database**: Configured through DATABASE_URL environment variable
- **Neon Database**: Used as the PostgreSQL provider with serverless connection pooling

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API access key
- `SLACK_BOT_TOKEN`: Slack bot authentication token
- `TELEGRAM_BOT_TOKEN`: Telegram bot authentication token

## Deployment Strategy

The application is designed for deployment on Replit with the following considerations:

### Build Process
- **Development**: Uses tsx for TypeScript execution with hot reloading
- **Production**: Vite builds the frontend, esbuild bundles the backend
- **n8n Workflows**: Import provided workflow JSON files for data management

### Architecture Decisions
- **Monorepo Structure**: Frontend (`client/`), backend (`server/`), and shared code (`shared/`) in single repository
- **Type Safety**: Full TypeScript implementation with shared schema definitions
- **Visual Workflows**: n8n provides visual workflow management for easy customization
- **Real-time Processing**: n8n handles concurrent webhook processing without blocking responses
- **Flexible Data**: n8n static data storage with easy backup and migration capabilities
- **Modular Design**: Service-based architecture for easy testing and maintenance

### Performance Considerations
- **Webhook Processing**: n8n handles multiple concurrent webhook requests efficiently
- **Visual Monitoring**: n8n provides execution logs and workflow monitoring out of the box
- **Easy Scaling**: Add new processing steps through visual workflow editor
- **Text-based Search**: Simple similarity search implemented in JavaScript within workflows

The system prioritizes reliability and maintainability while providing a responsive user experience for both bot interactions and admin management tasks.