"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhysicsAgent = void 0;
const weaviate_js_1 = require("../weaviate.js");
class PhysicsAgent {
    async analyze(content) {
        try {
            // For larger chunks, use a more focused search query
            // Take first 500 characters as the search query to avoid overwhelming Weaviate
            const searchQuery = content.length > 500 ? content.substring(0, 500) + '...' : content;
            console.log(`[PhysicsAgent] Searching knowledge base with query length: ${searchQuery.length}`);
            // Use the focused query for semantic search
            const knowledgeResults = await (0, weaviate_js_1.searchPhysicsKnowledge)(searchQuery, 5);
            console.log(`[PhysicsAgent] Found ${knowledgeResults.length} relevant knowledge results`);
            // Generate a summary and recommendations based on the results
            const summary = knowledgeResults.length > 0
                ? `Found ${knowledgeResults.length} relevant physics concepts. ${knowledgeResults.map(k => k.content).join('\n\n')}`
                : 'No specific physics knowledge found for this content.';
            const recommendations = knowledgeResults.length > 0
                ? ['Review related physics concepts in the results.', 'Consider cross-referencing with established physics literature.']
                : ['Consider expanding the knowledge base with more physics content.'];
            return {
                summary,
                recommendations,
                knowledge: knowledgeResults,
                queryLength: searchQuery.length,
                resultsCount: knowledgeResults.length,
            };
        }
        catch (error) {
            console.error('[PhysicsAgent] Error during analysis:', error);
            return {
                summary: 'Analysis encountered an error while searching physics knowledge.',
                recommendations: ['Please try again or contact support if the issue persists.'],
                knowledge: [],
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}
exports.PhysicsAgent = PhysicsAgent;
