// A build-time availability flag, not authentication or a secrecy boundary.
export function problemsFlag(value: string | undefined, development: boolean) {
  if (value === undefined || value === '') return development;
  return value === 'true';
}

const env = import.meta.env;
export const features = Object.freeze({
  problems: problemsFlag(env?.VITE_ENABLE_PROBLEMS, env?.DEV ?? true),
});
export const routeEnabled = (href: string) => features.problems || !/^#\/problems(?:\/|$)/.test(href);
