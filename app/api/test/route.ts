import { NextResponse } from 'next/server';
import { AgentOrchestrator } from '@/lib/services/agent-orchestrator';

export async function GET() {
  try {
    const orchestrator = new AgentOrchestrator();
    const agents = orchestrator.getAgents();
    
    return NextResponse.json({
      success: true,
      message: 'Agent system is working',
      agents: agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        role: agent.role
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 