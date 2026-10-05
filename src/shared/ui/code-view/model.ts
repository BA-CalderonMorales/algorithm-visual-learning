const pythonTokenPattern =
  /(?<triple>"""[\s\S]*?"""|'''[\s\S]*?''')|(?<comment>\#[^\n]*)|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?<number>\b(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?\b)|(?<constant>\b(?:True|False|None)\b)|(?<keyword>\b(?:and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b)|(?<builtin>\b(?:bool|dict|enumerate|filter|float|int|isinstance|len|list|map|max|min|print|range|reversed|set|sorted|str|sum|tuple|type|zip|super|property|staticmethod|classmethod)\b)|(?<operator>[-+*/%=<>!&|^~]+)|(?<punct>[()[\]{}.,:;])|(?<space>\s)|(?<identifier>[A-Za-z_]\w*)|(?<other>.)/g;

export function highlightCode(source, language) {
  const isPython = language.startsWith('python');
  const tokens = isPython
    ? pythonTokenPattern
    : /(?<comment>\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?<number>\b\d+(?:\.\d+)?\b)|(?<constant>\b(?:true|false|null|undefined)\b)|(?<keyword>\b(?:as|async|await|break|case|catch|class|const|continue|default|else|export|extends|for|from|function|if|import|interface|let|new|of|return|static|throw|try|type|typeof|var|while)\b)|(?<builtin>\b(?:Array|Boolean|console|Error|Map|Math|Number|Object|Set|String)\b)|(?<operator>[-+*/%=<>!&|^~?:]+)|(?<punct>[()[\]{}.,;])|(?<space>\s)|(?<identifier>[A-Za-z_$][\w$]*)|(?<other>.)/g;
  const lines = [[]];
  for (const match of source.matchAll(tokens)) {
    const type = Object.keys(match.groups).find((key) => match.groups[key] !== undefined) ?? 'other';
    const chunks = match[0].split('\n');
    chunks.forEach((text, index) => {
      if (text) lines[lines.length - 1].push({ text, type });
      if (index < chunks.length - 1) lines.push([]);
    });
  }
  return lines;
}
