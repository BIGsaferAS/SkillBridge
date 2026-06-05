export interface ResearchNotes {
  role: string;
  competencies: string[];
  coreCompetencies: string[];
  objectionHandling: string[];
  crisisScenarios: string[];
}

export async function runAjan1Arastirmaci(role: string, competencies: string[]): Promise<any> {
  const res = await fetch('/api/agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId: 'AJAN_1', input: { role, competencies } })
  });
  const data = await res.json();
  if (!res.ok) return { error: data.error };
  return { role, competencies, ...data.result };
}

export async function runAjan2Yazar(research: ResearchNotes): Promise<any> {
  const res = await fetch('/api/agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId: 'AJAN_2', input: research })
  });
  const data = await res.json();
  if (!res.ok) return { error: data.error };
  return data.result;
}

export async function runAjan3SoruTasarimcisi(caseText: string): Promise<any> {
  const res = await fetch('/api/agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId: 'AJAN_3', input: caseText })
  });
  const data = await res.json();
  if (!res.ok) return { error: data.error };
  return { caseText, questions: data.result.questions };
}
