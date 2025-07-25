# AI Research Bot - Replit Configuration

## Overview

This is a full-stack AI Research Bot application built for monitoring Slack and Telegram messages, extracting problem-solution pairs using OpenAI, and providing intelligent responses through a knowledge base system. The application features a React-based admin dashboard for managing extracted knowledge pairs and monitoring bot activities.

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

### Database Schema
The application uses three main database tables:
- **messages**: Stores incoming messages from Slack and Telegram with processing status
- **knowledge_pairs**: Stores extracted problem-solution pairs with embeddings and validation status
- **users**: Basic user management for admin access

### Core Services
- **Extraction Service**: Processes unprocessed messages to extract problem-solution pairs using OpenAI
- **OpenAI Service**: Handles GPT-4o interactions for text extraction and embedding generation
- **Telegram Service**: Manages Telegram bot webhook integration and message handling
- **Slack Service**: Handles Slack Events API integration and message processing
- **Storage Layer**: Provides abstraction over database operations with Drizzle ORM

### Admin Dashboard Pages
- **Dashboard**: Overview with statistics and quick search functionality
- **Knowledge Pairs**: Management interface for reviewing and validating extracted pairs
- **Messages**: Monitor incoming messages from both platforms
- **Search**: Test the knowledge base search functionality
- **Settings**: Bot configuration and connection status

## Data Flow

1. **Message Ingestion**: Webhooks receive messages from Slack and Telegram platforms
2. **Storage**: Messages are stored in the database with unprocessed status
3. **Processing**: Background service extracts problem-solution pairs using OpenAI
4. **Embedding Generation**: Text embeddings are created for vector similarity search
5. **Knowledge Base**: Validated pairs become searchable through the admin interface
6. **Bot Responses**: Commands trigger searches against the knowledge base to provide answers

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
- **Database**: Drizzle migrations handle schema updates

### Architecture Decisions
- **Monorepo Structure**: Frontend (`client/`), backend (`server/`), and shared code (`shared/`) in single repository
- **Type Safety**: Full TypeScript implementation with shared schema definitions
- **Real-time Processing**: Background service for message processing to avoid blocking webhook responses
- **Scalable Storage**: Vector embeddings for efficient similarity search in knowledge base
- **Modular Design**: Service-based architecture for easy testing and maintenance

### Performance Considerations
- **Connection Pooling**: Neon serverless connections with WebSocket support
- **Efficient Queries**: Drizzle ORM with optimized database operations
- **Background Processing**: Non-blocking message processing to maintain webhook responsiveness
- **Vector Search**: PostgreSQL with pgvector extension for fast similarity searches

The system prioritizes reliability and maintainability while providing a responsive user experience for both bot interactions and admin management tasks.