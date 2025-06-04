export class GeminiService {
    static instance;

    constructor() {
        this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new GeminiService();
        }
        return this.instance;
    }

    isApiKeyAvailable() {
        return true;
    }
    async generateText(message, context = {}) {
        try {
            console.log(`Attempting to fetch from: ${this.baseUrl}/generate`);
            console.log('Request payload:', { message, context });

            const response = await fetch(`${this.baseUrl}/api/messages/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify({ message, context }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('Response data:', data);

            if (data.error) {
                throw new Error(data.error);
            }
            return data.text;
        } catch (error) {
            console.error('Error generating text:', error);
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Unable to connect to the AI service. Please check if the server is running.');
            }
            throw new Error(`AI service error: ${error.message}`);
        }
    }

    async generateTextStream(message, onChunk, onError, onComplete, context = {}) {
        try {
            // First create the stream
            const createStreamResponse = await fetch(`${this.baseUrl}/generate_stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, context }),
            });

            if (!createStreamResponse.ok) {
                throw new Error(`HTTP error! status: ${createStreamResponse.status}`);
            }

            const { streamId } = await createStreamResponse.json();

            // Then connect to the stream endpoint
            const eventSource = new EventSource(`${this.baseUrl}/generate_stream/${streamId}`);

            eventSource.onmessage = (event) => {
                onChunk(event.data);
            };

            eventSource.onerror = (error) => {
                eventSource.close();
                onError(error);
                onComplete();
            };

            eventSource.addEventListener('complete', () => {
                eventSource.close();
                onComplete();
            });

        } catch (error) {
            console.error('Error in text stream:', error);
            onError(error);
            onComplete();
        }
    }
}

export default GeminiService.getInstance();