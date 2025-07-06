export class KnowledgeBaseService {
  async explainConcept(concept: string): Promise<string> {
    return `Explanation for "${concept}": This is a placeholder explanation.`;
  }

  async searchKnowledge(query: string, limit: number): Promise<any[]> {
    return [];
  }

  async addKnowledge(entry: any): Promise<string> {
    return `mock-id-${Date.now()}`;
  }

  // Robust: always return a valid stats structure
  async getKnowledgeStats(): Promise<{ totalConcepts: number; fieldDistribution: Record<string, number>; difficultyDistribution: Record<string, number> }> {
    return {
      totalConcepts: 0,
      fieldDistribution: {},
      difficultyDistribution: {},
    };
  }
}

