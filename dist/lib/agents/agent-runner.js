"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAgentSystem = runAgentSystem;
const epistemic_agent_1 = require("./epistemic-agent");
async function runAgentSystem(text) {
    const agent = new epistemic_agent_1.EpistemicAgent();
    const result = await agent.run(text);
    return [result];
}
