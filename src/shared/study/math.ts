// Trusted, locally authored MathML fragments. Never interpolate user input.
export const n = (value) => `<mn>${value}</mn>`;
export const v = (value) => `<mi>${value}</mi>`;
export const o = (value) => `<mo>${value}</mo>`;
export const r = (...parts) => `<mrow>${parts.join('')}</mrow>`;
export const f = (top, bottom) => `<mfrac>${r(top)}${r(bottom)}</mfrac>`;
export const p = (base, exponent) => `<msup>${base}${exponent}</msup>`;
export const par = (value) => r(o('('), value, o(')'));
export const next = (variable) => r(v(variable), o('+'), n(1));
export const triangular = (variable) => f(r(v(variable), par(next(variable))), n(2));
export const reciprocal = (denominator) => f(n(1), denominator);
export const sigma = (index, lower, upper, term) =>
  r(`<munderover>${o('∑')}${r(v(index), o('='), n(lower))}${v(upper)}</munderover>`, term);
export const eq = (...parts) => parts.join(o('='));
