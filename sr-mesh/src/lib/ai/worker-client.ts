export class WorkerClient {
  worker: Worker | null = null;
  
  constructor() {
    if (typeof window !== 'undefined') {
        this.worker = new Worker(new URL('../../workers/embedding.worker.ts', import.meta.url));
    }
  }

  async getEmbedding(text: string): Promise<number[]> {
    return new Promise((resolve, reject) => {
        if (!this.worker) {
            reject(new Error('Worker not initialized'));
            return;
        }

        const handleMessage = (event: MessageEvent) => {
            const { type, embedding, error } = event.data;
            if (type === 'complete') {
                this.worker?.removeEventListener('message', handleMessage);
                resolve(embedding);
            } else if (type === 'error') {
                this.worker?.removeEventListener('message', handleMessage);
                reject(new Error(error));
            }
        };

        this.worker.addEventListener('message', handleMessage);
        this.worker.postMessage({ type: 'embed', text });
    });
  }
}

// Singleton instance
export const aiWorker = new WorkerClient();
