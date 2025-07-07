"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentOrchestrator = void 0;
const real_document_processor_1 = require("../real-document-processor");
const real_openai_agents_1 = require("../real-openai-agents");
const kv_storage_1 = require("../kv-storage");
const weaviate_1 = require("../weaviate");
const uuid_1 = require("uuid");
const MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
const SUMMARY_MODEL = MODEL;
const SUMMARY_TOKENS = 300;
class AgentOrchestrator {
    // Add the missing methods for streaming
    getAgents() {
        return [
            { id: 'theoretical', name: 'Theoretical Physicist', role: 'Theory', confidence: 0.9 },
            { id: 'mathematical', name: 'Mathematical Analyst', role: 'Mathematics', confidence: 0.85 },
            { id: 'epistemic', name: 'Epistemic Reviewer', role: 'Epistemics', confidence: 0.8 },
        ];
    }
    async analyzeWithAgent(agentId, paperContent, paperTitle) {
        try {
            // Get knowledge context
            const knowledge = await (0, weaviate_1.searchPhysicsKnowledge)(paperContent.slice(0, 200), 3);
            // Run the specific agent
            const result = await real_openai_agents_1.RealOpenAIAgents.runAgent(agentId, {
                text: paperContent,
                context: knowledge.map(k => k.content)
            });
            // Format the result for streaming
            const analysis = [
                `## ${result.agentName} Analysis`,
                '',
                '**Key Findings:**',
                ...result.findings.map(f => `- ${f}`),
                '',
                '**Recommendations:**',
                ...result.recommendations.map(r => `- ${r}`),
                '',
                `*Confidence: ${Math.round(result.confidence * 100)}%*`
            ].join('\n');
            return analysis;
        }
        catch (error) {
            console.error(`Agent ${agentId} analysis failed:`, error);
            return `Analysis failed for ${agentId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }
    async analyzeDocument(file, summary, reviewMode = 'full') {
        const analysisId = (0, uuid_1.v4)();
        await kv_storage_1.AnalysisStorage.store(analysisId, {
            analysisId,
            documentName: file.name,
            reviewMode,
            summary,
            status: 'processing',
            timestamp: new Date().toISOString(),
        });
        // Run full pipeline before returning
        await this.processDocumentAsync(analysisId, file, summary, reviewMode);
        return analysisId;
    }
    async processDocumentAsync(analysisId, file, summary, reviewMode = 'full') {
        const startAll = Date.now();
        try {
            // 1. Ingest & chunk (only once)
            const processed = await real_document_processor_1.RealDocumentProcessor.processFile(file);
            const fullText = processed.getContent();
            // 2. RAG (first 200 chars)
            const knowledge = await (0, weaviate_1.searchPhysicsKnowledge)(fullText.slice(0, 200), 5);
            await kv_storage_1.AnalysisStorage.store(analysisId, { status: 'running', timestamp: new Date().toISOString() });
            // 3. Use chunks from PaperChunker only
            const chunks = processed.chunks.map(chunk => chunk.content);
            console.log(`[Orchestrator] Number of chunks: ${chunks.length}`);
            // 4. Run each agent across all chunks
            const perAgent = await Promise.all(real_openai_agents_1.RealOpenAIAgents.agentIds().map(async (agentId) => {
                const t0 = Date.now();
                const results = [];
                for (const chunk of chunks) {
                    results.push(await real_openai_agents_1.RealOpenAIAgents.runAgent(agentId, { text: chunk, context: knowledge }));
                }
                return { agentId, results, durationMs: Date.now() - t0 };
            }));
            const totalDurationMs = Date.now() - startAll;
            // 5. Aggregate
            const allResults = perAgent.flatMap(a => a.results);
            const confidences = allResults.map(r => r.confidence);
            const recommendations = allResults.flatMap(r => r.recommendations);
            // 6. Persist final (API-compatible structure)
            const resultObject = {
                analysisId,
                documentName: processed.metadata.fileName,
                reviewMode,
                timestamp: new Date().toISOString(),
                status: 'completed',
                error: '',
                overallScore: 0, // TODO: calculate if needed
                confidence: confidences.length ? Math.max(...confidences) : 0,
                summary: '', // TODO: add summary if available
                keyFindings: [], // TODO: extract from agent results if needed
                recommendations,
                agentResults: allResults,
                detailedAnalysis: {}, // TODO: fill if you have per-agent details
            };
            await kv_storage_1.AnalysisStorage.store(analysisId, resultObject);
            return resultObject;
        }
        catch (error) {
            await kv_storage_1.AnalysisStorage.store(analysisId, {
                analysisId,
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString(),
            });
            throw error;
        }
    }
}
exports.AgentOrchestrator = AgentOrchestrator;
