export interface PatternLesson {
  id: string;
  pattern: string;
  title: string;
  idea: string;
  invariant: string;
  example: string;
  trace: { state: string; why: string }[];
  time: string;
  space: string;
  trap: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  section?: string;
}

export function lesson(
  pattern: string,
  title: string,
  idea: string,
  invariant: string,
  example: string,
  trace: string[],
  time: string,
  space: string,
  trap: string,
  question: string,
  options: string[],
  explanation: string,
  section = '',
): PatternLesson {
  return {
    id: title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-$/, ''),
    pattern,
    title,
    idea,
    invariant,
    example,
    trace: trace.map((step) => {
      const [state, ...why] = step.split(' :: ');
      return { state, why: why.join(' :: ') };
    }),
    time,
    space,
    trap,
    question,
    options,
    answer: 0,
    explanation,
    section,
  };
}
