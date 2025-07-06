export class KnowledgeBaseService {
    async explainConcept(concept) {
        return `Explanation for "${concept}": This is a placeholder explanation.`;
    }
    async searchKnowledge(query, limit) {
        return [];
    }
    async addKnowledge(entry) {
        return `mock-id-${Date.now()}`;
    }
    // Robust: always return a valid stats structure
    async getKnowledgeStats() {
        return {
            totalConcepts: 0,
            fieldDistribution: {},
            difficultyDistribution: {},
        };
    }
}
