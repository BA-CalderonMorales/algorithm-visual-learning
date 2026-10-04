import { ease, lerp, label, wrap, fittedLabel } from '../../shared/playback/renderers/drawing.js';

function tile(ctx, x, y, size, value, role, palette, opacity = 1) {
  const color = palette[role] ?? palette.neutral;
  ctx.globalAlpha = opacity;
  ctx.fillStyle = role === 'neutral' ? '#202833' : color + '22';
  ctx.strokeStyle = color + (role === 'neutral' ? '55' : 'cc');
  ctx.lineWidth = role === 'key' ? 2.3 : 1.3;
  ctx.fillRect(x - size / 2, y - size / 2, size, size);
  ctx.strokeRect(x - size / 2, y - size / 2, size, size);
  if (value !== null)
    label(ctx, value, x, y, Math.min(29, size * 0.48), role === 'neutral' ? '#edf0f6' : color, 'center', 600);
  ctx.globalAlpha = 1;
}

function bracket(ctx, start, end, y, text, color, compact) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(start + 4, y - 5);
  ctx.lineTo(start + 4, y);
  ctx.lineTo(end - 4, y);
  ctx.lineTo(end - 4, y - 5);
  ctx.stroke();
  fittedLabel(ctx, text, (start + end) / 2, y + 19, end - start - 9, compact ? 17 : 16, color, 'center');
}

function arrow(ctx, from, to, color) {
  ctx.strokeStyle = color + '88';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([4, 5]);
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.setLineDash([]);
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  ctx.beginPath();
  ctx.moveTo(to.x - 8 * Math.cos(angle - 0.5), to.y - 8 * Math.sin(angle - 0.5));
  ctx.lineTo(to.x, to.y);
  ctx.lineTo(to.x - 8 * Math.cos(angle + 0.5), to.y - 8 * Math.sin(angle + 0.5));
  ctx.stroke();
}

function arrayScene(ctx, film, scene, previous, local, options) {
  const { compact, reduced, palette } = options;
  const width = compact ? 560 : 1000,
    margin = compact ? 28 : 68;
  const span = width - margin * 2,
    count = scene.tokens.length,
    stride = span / count;
  const size = Math.min(compact ? 58 : 64, stride - 10),
    y = 223;
  const x = (index) => margin + stride * (index + 0.5);
  const amount = reduced ? 1 : ease(Math.min(1, local / 1.65));
  const oldById = new Map(previous.tokens.map((token, position) => [token.id, { token, position }]));
  label(ctx, 'Array · positions stay fixed', margin, 150, compact ? 18 : 19, palette.neutral, 'left', 550);
  scene.tokens.forEach((_, position) => tile(ctx, x(position), y, size, null, 'neutral', palette));
  scene.tokens.forEach((token, position) => {
    const old = oldById.get(token.id) ?? { token, position };
    const moved = old.position !== position;
    const px = lerp(x(old.position), x(position), amount);
    const py = y + (moved ? Math.sin(Math.PI * amount) * (old.position < position ? -1 : 1) * (compact ? 24 : 28) : 0);
    const role = moved && amount < 1 ? (token.role === 'key' ? 'key' : 'shift') : token.role;
    const opacity = scene.group && !scene.group.includes(position) ? 0.45 : 1;
    tile(ctx, px, py, size, token.value, role, palette, opacity);
  });
  // Index and pointer baselines belong to slots, never to moving tiles.
  const indicesY = y + size / 2 + (compact ? 32 : 42);
  scene.tokens.forEach((token, position) => {
    const active = Boolean(token.pointer) || scene.group?.includes(position);
    label(ctx, position, x(position), indicesY, compact ? 17 : 15, active ? palette.group : palette.neutral);
    if (token.pointer)
      label(ctx, token.pointer, x(position), indicesY + 23, compact ? 18 : 16, palette.group, 'center', 650);
    if (scene.fixed?.includes(position)) {
      ctx.strokeStyle = palette.sorted;
      ctx.lineWidth = 2;
      ctx.strokeRect(x(position) - size / 2 - 3, y - size / 2 - 3, size + 6, size + 6);
    }
  });
  const bandY = compact ? 332 : 351;
  if (scene.group) {
    ctx.strokeStyle = palette.group;
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    scene.group.forEach((position, index) => {
      if (index) ctx.lineTo(x(position), bandY);
      else ctx.moveTo(x(position), bandY);
      ctx.moveTo(x(position), bandY - 5);
      ctx.lineTo(x(position), bandY + 5);
      ctx.moveTo(x(position), bandY);
    });
    ctx.stroke();
    fittedLabel(
      ctx,
      `Gap ${scene.gap} · indices ${scene.group.join(' → ')}`,
      width / 2,
      bandY + 19,
      span,
      compact ? 18 : 17,
      palette.group,
      'center',
    );
  } else if (scene.lanes) {
    scene.lanes.forEach((band) =>
      bracket(
        ctx,
        margin + band.start * span,
        margin + band.end * span,
        bandY,
        band.label,
        palette[band.role],
        compact,
      ),
    );
  } else {
    let prefix = scene.prefix;
    if (prefix === undefined) {
      prefix = 0;
      while (scene.tokens[prefix]?.role === 'sorted') prefix++;
    }
    if (prefix) {
      const settled =
        scene.chapter === 'Prefix' ||
        scene.chapter === 'Insert' ||
        scene.chapter === 'Remember' ||
        film.id === 'selection';
      bracket(
        ctx,
        margin,
        margin + stride * prefix,
        bandY,
        settled ? 'Sorted prefix' : 'Growing prefix',
        settled ? palette.sorted : palette.group,
        compact,
      );
    }
    if (prefix < count)
      bracket(ctx, margin + stride * prefix, width - margin, bandY, 'Still to process', palette.neutral, compact);
  }
  const top = compact ? 376 : 391,
    gap = 10,
    cardWidth = (span - gap * 2) / 3;
  (scene.facts ?? []).forEach((fact, index) => {
    const left = margin + index * (cardWidth + gap),
      tint = palette[fact.role];
    ctx.fillStyle = '#1b232e';
    ctx.fillRect(left, top, cardWidth, 76);
    ctx.strokeStyle = '#344253';
    ctx.lineWidth = 1;
    ctx.strokeRect(left, top, cardWidth, 76);
    fittedLabel(ctx, fact.label, left + 12, top + 19, cardWidth - 24, compact ? 15 : 13, palette.neutral);
    fittedLabel(ctx, fact.value, left + 12, top + 49, cardWidth - 24, compact ? 24 : 25, tint);
  });
}

function mergeScene(ctx, film, scene, previous, local, options) {
  const { compact, reduced, palette } = options,
    state = scene.merge;
  const width = compact ? 560 : 1000,
    margin = compact ? 28 : 68;
  if (state.phase === 'input') {
    const tokens = state.input.map((token, index) => ({ ...token, role: 'neutral', index: String(index) }));
    const facts = [
      { label: film.id === 'tim' ? 'Find runs' : 'Left half', value: 3, role: 'group' },
      { label: film.id === 'tim' ? 'Then merge' : 'Right half', value: 3, role: 'group' },
      { label: 'Output slots', value: 6, role: 'sorted' },
    ];
    arrayScene(ctx, film, { ...scene, tokens, facts, prefix: 0 }, { ...scene, tokens }, local, options);
    return;
  }
  const left = compact ? margin : 250,
    span = width - margin - left;
  const size = compact ? 54 : 64,
    ys = [compact ? 181 : 168, compact ? 299 : 283, compact ? 414 : 401];
  const sourceX = (index) => left + (span * (index + 0.5)) / 3;
  const outputX = (index) => left + (span * (index + 0.5)) / 6;
  const placing = state.phase === 'place',
    amount = reduced ? 1 : ease(Math.min(1, local / 1.8)),
    arrived = amount === 1;
  const used = (source) => state[`${source}Used`] - (placing && source === state.source && !arrived ? 1 : 0);
  const heading = (title, detail, y, role) => {
    if (compact) label(ctx, `${title} · ${detail}`, margin, y - size / 2 - 17, 18, palette[role], 'left', 550);
    else {
      label(ctx, title, margin, y - 12, 19, palette[role], 'left', 600);
      label(ctx, detail, margin, y + 13, 13, palette.neutral, 'left');
    }
  };
  const merging = ['merge', 'place', 'done'].includes(state.phase);
  heading(
    state.tim ? 'Run A' : 'Left half',
    merging
      ? `i = ${used('left')}${used('left') === 3 ? ' · exhausted' : ''}`
      : state.leftSorted
        ? 'sorted'
        : '3 fixed slots',
    ys[0],
    'group',
  );
  heading(
    state.tim ? 'Run B' : 'Right half',
    merging
      ? `j = ${used('right')}${used('right') === 3 ? ' · exhausted' : ''}`
      : state.rightSorted
        ? 'sorted'
        : '3 fixed slots',
    ys[1],
    'group',
  );
  heading('Output', '6 fixed slots', ys[2], 'sorted');
  if (placing)
    arrow(
      ctx,
      { x: sourceX(state.sourceIndex), y: ys[state.source === 'left' ? 0 : 1] + size / 2 },
      { x: outputX(state.target), y: ys[2] - size / 2 },
      palette.key,
    );

  for (const [rowIndex, source] of ['left', 'right'].entries()) {
    const sourceValues = state[source],
      oldState = previous.merge;
    sourceValues.forEach((token, position) => {
      const exhausted = merging && position < used(source);
      const front = merging && position === used(source);
      const chosen = placing && token.id === state.chosenId && !arrived;
      const pair =
        ((state.phase === 'left-pair' && source === 'left') || (state.phase === 'right-pair' && source === 'right')) &&
        position >= 1;
      const role = chosen
        ? 'key'
        : front || pair
          ? 'compare'
          : state[`${source}Sorted`]
            ? 'sorted'
            : state.phase === 'singletons'
              ? 'group'
              : 'neutral';
      let px = sourceX(position),
        py = ys[rowIndex];
      if (oldState?.phase === 'input') {
        const origin = state.input.findIndex((value) => value.id === token.id);
        px = lerp(margin + ((width - margin * 2) * (origin + 0.5)) / 6, px, amount);
        py = lerp(223, py, amount);
      } else if (oldState) {
        const oldPosition = oldState[source].findIndex((value) => value.id === token.id);
        px = lerp(sourceX(oldPosition), px, amount);
        if (oldPosition !== position) py -= Math.sin(Math.PI * amount) * (compact ? 23 : 28);
      }
      tile(ctx, px, py, size, token.value, role, palette, exhausted ? 0.35 : 1);
      label(
        ctx,
        front ? `${source === 'left' ? 'i' : 'j'}=${position}` : position,
        sourceX(position),
        ys[rowIndex] + size / 2 + 15,
        compact ? 16 : 13,
        front ? palette.group : palette.neutral,
      );
    });
  }
  state.output.forEach((token, position) => {
    const destination = placing && position === state.target;
    const visible = token && (!destination || arrived);
    tile(
      ctx,
      outputX(position),
      ys[2],
      size,
      visible ? token.value : null,
      visible ? 'sorted' : destination ? 'key' : 'neutral',
      palette,
    );
    label(
      ctx,
      position,
      outputX(position),
      ys[2] + size / 2 + 15,
      compact ? 16 : 13,
      destination ? palette.key : palette.neutral,
    );
  });
  if (placing && !arrived) {
    const fromY = ys[state.source === 'left' ? 0 : 1];
    tile(
      ctx,
      lerp(sourceX(state.sourceIndex), outputX(state.target), amount),
      lerp(fromY, ys[2], amount),
      size,
      state.output[state.target].value,
      'key',
      palette,
    );
  }
}

// The same fixed-slot drawings drive playback, seeking and exported films.
export function renderSortingScene(ctx, film, scene, previous, index, local, options) {
  const { compact, exportVideo, palette } = options;
  const width = compact ? 560 : 1000,
    margin = compact ? 28 : 68,
    span = width - margin * 2;
  label(
    ctx,
    `${String(index + 1).padStart(2, '0')} / ${film.frames.length}     ${scene.chapter.toUpperCase()}`,
    margin,
    28,
    14,
    palette.neutral,
    'left',
    550,
  );
  fittedLabel(ctx, scene.title, margin, 63, span, compact ? 24 : 30, '#f0f3f8', 'left', 600);
  fittedLabel(ctx, scene.operation, margin, 103, span, compact ? 17 : 19, palette.key);
  if (scene.merge) mergeScene(ctx, film, scene, previous, local, options);
  else arrayScene(ctx, film, scene, previous, local, options);
  if (exportVideo) {
    const y = compact ? 532 : 509;
    ctx.strokeStyle = '#303944';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin, y - 17);
    ctx.lineTo(width - margin, y - 17);
    ctx.stroke();
    wrap(ctx, scene.caption, margin, y, span, compact ? 16 : 17, '#c8d2df', 1.4);
    label(ctx, 'ALGORITHM VISUAL LEARNING', margin, (compact ? 610 : 560) - 10, 9, '#748496', 'left');
  }
}
