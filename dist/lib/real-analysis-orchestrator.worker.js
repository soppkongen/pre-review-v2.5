"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealAnalysisOrchestrator = void 0;
const real_document_processor_worker_js_1 = require("./real-document-processor.worker.js");
const physicsAgent_worker_js_1 = require("./agents/physicsAgent.worker.js");
const rate_limiter_js_1 = require("./ai/rate-limiter.js");
const rateLimiter = new rate_limiter_js_1.OpenAIRateLimiter({ minIntervalMs: 2000, concurrency: 1 });
class RealAnalysisOrchestrator {
    async processDocumentAsync(file, analysisId, reviewMode = 'full') {
        const processed = await real_document_processor_worker_js_1.RealDocumentProcessor.processFile(file);
        const physicsAgent = new physicsAgent_worker_js_1.PhysicsAgent();
        const results = [];
        let allFindings = [];
        let allRecommendations = [];
        let agentResults = [];
        let confidences = [];
        console.log(`[Orchestrator] Processing ${processed.chunks.length} chunks (was ~100+ before optimization)`);
        for (const { id, content } of processed.chunks) {
            const t0 = Date.now();
            console.log(`[Orchestrator] Processing chunk ${id + 1}/${processed.chunks.length}`);
            const res = await rateLimiter.schedule(() => physicsAgent.analyze(content));
            results.push({ chunkId: id, result: res, durationMs: Date.now() - t0 });
            if (res.summary)
                allFindings.push(res.summary);
            if (Array.isArray(res.recommendations))
                allRecommendations.push(...res.recommendations);
            agentResults.push({
                agentName: 'PhysicsAgent',
                role: 'Physics',
                confidence: 1.0,
                findings: [res.summary],
                recommendations: res.recommendations,
            });
            confidences.push(1.0);
        }
        const analysis = results
            .sort((a, b) => a.chunkId - b.chunkId)
            .map(r => `[Chunk ${r.chunkId} - ${r.durationMs}ms]\n${typeof r.result === 'string' ? r.result : JSON.stringify(r.result)}`)
            .join('\n\n');
        const avgConfidence = confidences.length > 0 ? confidences.reduce((s, c) => s + c, 0) / confidences.length : 1.0;
        const overallScore = Math.round(avgConfidence * 100) / 10;
        return {
            analysisId: analysisId || '',
            documentName: file.name,
            reviewMode,
            status: 'completed',
            summary: allFindings.join('\n'),
            keyFindings: allFindings,
            recommendations: allRecommendations,
            agentResults,
            overallScore,
            confidence: avgConfidence,
            detailedAnalysis: {
                PhysicsAgent: {
                    results: agentResults,
                    durationMs: results.reduce((s, r) => s + r.durationMs, 0),
                },
            },
            timings: { totalDurationMs: results.reduce((s, r) => s + r.durationMs, 0) },
            error: '',
            timestamp: new Date().toISOString(),
            metadata: processed.metadata,
        };
    }
}
exports.RealAnalysisOrchestrator = RealAnalysisOrchestrator;
