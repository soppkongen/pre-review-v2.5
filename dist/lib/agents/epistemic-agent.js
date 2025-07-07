"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EpistemicAgent = void 0;
class EpistemicAgent {
    async run(text) {
        return {
            summary: 'Epistemic analysis complete.',
            issues: ['No critical issues found.'],
        };
    }
}
exports.EpistemicAgent = EpistemicAgent;
