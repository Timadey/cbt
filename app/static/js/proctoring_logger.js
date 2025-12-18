/**
 * Proctoring Logger Module
 * Handles logging of proctoring events to backend API (which stores in Redis)
 */

export class ProctoringLogger {
    constructor(examSessionId, studentId) {
        this.examSessionId = examSessionId;
        this.studentId = studentId;
        this.apiEndpoint = '/api/proctoring/log';
        this.batchSize = 10;
        this.batchInterval = 5000; // 5 seconds
        this.eventQueue = [];
        this.batchTimer = null;
        
        this.startBatchProcessor();
    }

    /**
     * Log a proctoring event
     * @param {string} eventType - Type of event (e.g., 'NO_FACE_DETECTED', 'TAB_SWITCH')
     * @param {string} severity - Severity level ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'INFO')
     * @param {object} data - Additional event data
     */
    async logEvent(eventType, severity, data = {}) {
        const event = {
            examSessionId: this.examSessionId,
            studentId: this.studentId,
            eventType,
            severity,
            data,
            timestamp: new Date().toISOString()
        };
        
        // Add to queue for batch processing
        this.eventQueue.push(event);
        
        // For critical events, send immediately
        if (severity === 'CRITICAL') {
            await this.sendBatch();
        }
        
        // If queue is full, send batch
        if (this.eventQueue.length >= this.batchSize) {
            await this.sendBatch();
        }
    }

    startBatchProcessor() {
        this.batchTimer = setInterval(async () => {
            if (this.eventQueue.length > 0) {
                await this.sendBatch();
            }
        }, this.batchInterval);
    }

    async sendBatch() {
        if (this.eventQueue.length === 0) return;
        
        const batch = [...this.eventQueue];
        this.eventQueue = [];
        
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ events: batch })
            });
            
            if (!response.ok) {
                console.error('Failed to send proctoring logs:', response.statusText);
                // Re-queue failed events
                this.eventQueue.push(...batch);
            }
        } catch (error) {
            console.error('Error sending proctoring logs:', error);
            // Re-queue failed events
            this.eventQueue.push(...batch);
        }
    }

    async getSummary() {
        try {
            const response = await fetch(
                `${this.apiEndpoint}/summary?examSessionId=${this.examSessionId}&studentId=${this.studentId}`
            );
            
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Error fetching proctoring summary:', error);
        }
        
        return null;
    }

    cleanup() {
        if (this.batchTimer) {
            clearInterval(this.batchTimer);
        }
        // Send any remaining events
        this.sendBatch();
    }
}