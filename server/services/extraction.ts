import { storage } from "../storage";
import { extractProblemSolution, generateEmbedding } from "./openai";

export class ExtractionService {
  private isProcessing = false;

  async processUnprocessedMessages(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      const unprocessedMessages = await storage.getUnprocessedMessages();
      
      for (const message of unprocessedMessages) {
        try {
          await this.processMessage(message);
          await storage.markMessageAsProcessed(message.id);
        } catch (error) {
          console.error(`Failed to process message ${message.id}:`, error);
          // Mark as processed even if extraction failed to avoid infinite loops
          await storage.markMessageAsProcessed(message.id);
        }
      }
    } catch (error) {
      console.error('Failed to process unprocessed messages:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processMessage(message: any): Promise<void> {
    // Extract problem-solution pair
    const extraction = await extractProblemSolution(message.content);
    
    if (!extraction) {
      console.log(`No problem-solution pair found in message ${message.id}`);
      return;
    }

    // Generate embedding for the combined problem and solution
    const combinedText = `${extraction.problem} ${extraction.solution}`;
    const embedding = await generateEmbedding(combinedText);

    // Store knowledge pair
    await storage.createKnowledgePair({
      problem: extraction.problem,
      solution: extraction.solution,
      sourceMessageId: message.id,
      confidenceScore: extraction.confidence,
      embedding: embedding,
      validated: extraction.confidence >= 0.8, // Auto-validate high confidence extractions
    });

    console.log(`Created knowledge pair from message ${message.id} with confidence ${extraction.confidence}`);
  }

  startPeriodicProcessing(intervalMs = 30000): void {
    setInterval(async () => {
      await this.processUnprocessedMessages();
    }, intervalMs);
  }
}

export const extractionService = new ExtractionService();
