export interface TraceScene {
  title: string;
  why: string;
  lines: number[];
  rows: { label: string; values: (string | number)[]; active?: number[]; settled?: number[]; group?: number[] }[];
  variables: Record<string, string | number>;
  links?: { from: string; to: string; label: string }[];
  nodes?: { id: string; value: string | number; active?: boolean }[];
  grid?: { row: number; column: number; value: string; role?: string }[];
  question?: { prompt: string; choices: string[]; explanation: string };
}
export interface CodeTrace {
  title: string;
  code: string[];
  scenes: TraceScene[];
  note: string;
  language?: string;
}
export function recorder(code: string[], title: string, note = '') {
  const scenes: TraceScene[] = [];
  const add = (scene: Partial<TraceScene> & { title: string; why: string; lines: number[] }) => {
    scenes.push(structuredClone({ rows: [], variables: {}, ...scene }));
  };
  return { add, finish: (): CodeTrace => ({ title, code, note, scenes }) };
}
export function parseValues(raw: string) {
  const text = raw.trim().replace(/^\[/, '').replace(/\]$/, '').trim();
  if (!text) return [];
  const parts = text.split(/[\s,]+/);
  if (parts.length > 8 || parts.some((part) => !/^-?\d+$/.test(part)))
    throw new Error('Use up to eight integers separated by commas.');
  const values = parts.map(Number);
  if (values.some((value) => value < -20 || value > 99))
    throw new Error('Keep values between −20 and 99 so every step remains readable.');
  return values;
}
