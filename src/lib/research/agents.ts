export interface AgentContext {
  sessionId: string;
  role: 'investigator' | 'analyst';
  question: string;
  existingClaims: Array<{ text: string; status: string }>;
  existingEvidence: Array<{ excerpt: string; sourceTitle?: string }>;
  openQuestions: string[];
}

export function buildInvestigatorPrompt(ctx: AgentContext): string {
  return `You are an Investigator/Skeptic. Decompose the research topic, ask hard questions, challenge assumptions, flag contradictions.
Your task is to analyze the current state of research.
Topic: ${ctx.question}
Open Questions: ${JSON.stringify(ctx.openQuestions)}
Existing Claims: ${JSON.stringify(ctx.existingClaims)}
Output structured JSON: { "findings": string, "newQuestions": string[], "claims": Array<{text: string, confidence: number, supporting?: string[], refuting?: string[]}>, "evidence": Array<{excerpt: string, source?: string}> }`;
}

export function buildAnalystPrompt(ctx: AgentContext): string {
  return `You are an Analyst/Researcher. Gather evidence, answer questions, compare competing explanations, push back on the Investigator when evidence supports.
Topic: ${ctx.question}
Open Questions: ${JSON.stringify(ctx.openQuestions)}
Existing Claims: ${JSON.stringify(ctx.existingClaims)}
Output structured JSON: { "findings": string, "newQuestions": string[], "claims": Array<{text: string, confidence: number, supporting?: string[], refuting?: string[]}>, "evidence": Array<{excerpt: string, source?: string}> }`;
}
