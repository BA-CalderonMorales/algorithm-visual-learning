// CSS Modules scope appearance; stable semantic names remain DOM/test hooks.
export function classNames(styles: Record<string, string>, names = '', flags: Record<string, unknown> = {}) {
  const active = [...names.split(/\s+/), ...Object.keys(flags).filter((name) => flags[name])].filter(Boolean);
  return [...new Set([styles.scope, ...active.flatMap((name) => [name, styles[name]])].filter(Boolean))].join(' ');
}
