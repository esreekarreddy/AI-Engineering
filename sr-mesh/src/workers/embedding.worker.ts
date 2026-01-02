import { pipeline, env, Pipeline } from '@xenova/transformers';

// Skip local model checks since we are running in browser
env.allowLocalModels = false;
env.useBrowserCache = true;

// Progress callback type for model loading
interface ProgressInfo {
  status: string;
  loaded?: number;
  total?: number;
}

class EmbeddingPipeline {
  static task = 'feature-extraction';
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance: Pipeline | null = null;

  static async getInstance(progressCallback?: (progress: ProgressInfo) => void): Promise<Pipeline> {
    if (this.instance === null) {
      // @ts-expect-error - Transformers.js types are incomplete for pipeline options
      this.instance = await pipeline(this.task, this.model, { progress_callback: progressCallback });
    }
    return this.instance as Pipeline;
  }
}

interface WorkerMessageEvent {
  data: {
    type: 'embed';
    text: string;
  };
}

self.addEventListener('message', async (event: WorkerMessageEvent) => {
    const { text, type } = event.data;

    if (type === 'embed') {
        // Validate input
        if (typeof text !== 'string' || text.length > 20000) {
            self.postMessage({
                type: 'error',
                error: 'Input text too long or invalid'
            });
            return;
        }

        try {
            const extractor = await EmbeddingPipeline.getInstance((progress: ProgressInfo) => {
               self.postMessage({ type: 'progress', data: progress });
            });

            const output = await extractor(text, { pooling: 'mean', normalize: true });
            const embedding = Array.from(output.data as Float32Array);

            self.postMessage({
                type: 'complete',
                embedding
            });
        } catch (error) {
            self.postMessage({
                type: 'error',
                error: String(error)
            });
        }
    }
});
