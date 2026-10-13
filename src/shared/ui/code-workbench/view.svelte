<script>
  import styles from './view.module.css';
  import { classNames } from '../class-names.ts';
  import { createViewModel } from './view-model.svelte.ts';
  let { definition } = $props();
  const vm = createViewModel(() => ({ definition }));
</script>

<section class={classNames(styles, 'code-workbench')} aria-label="{definition.title} code workbench">
  <header class={styles.scope}>
    <h2 class={styles.scope}>{definition.title}</h2>
    <p class={styles.scope}>{definition.intro}</p>
  </header>
  <form
    class={classNames(styles, 'setup')}
    onsubmit={(event) => {
      event.preventDefault();
      vm.run();
    }}
  >
    <label class={styles.scope}
      >{definition.size ? 'Input size n' : 'Input values'}<input
        class={styles.scope}
        bind:value={vm.raw}
        maxlength="80"
        inputmode={definition.size ? 'numeric' : 'text'}
      /></label
    >
    {#if definition.variants?.length}<label class={styles.scope}
        >Experiment<select class={styles.scope} aria-label="Experiment" bind:value={vm.variant} onchange={vm.run}
          >{#each definition.variants as variant}<option class={styles.scope} value={variant.id}>{variant.label}</option
            >{/each}</select
        ></label
      >{/if}
    <button class={styles.scope} type="submit">Build trace</button>
    <label class={classNames(styles, 'predict-toggle')}
      ><input class={styles.scope} type="checkbox" bind:checked={vm.predicting} />Predict before advancing</label
    >
  </form>
  {#if vm.error}<p class={classNames(styles, 'error')} role="alert">{vm.error}</p>{/if}
  <p class={classNames(styles, 'note')}>
    {#if vm.current.nodes}Blue: active node · Solid: next · Dashed: prev.
    {:else}Blue: active · Purple: current group · Green: completed.{/if}
  </p>
  <p class={classNames(styles, 'trace-meta')}>Decision {vm.index + 1} / {vm.trace.scenes.length}</p>
  {#if !vm.predicting}<p class={classNames(styles, 'explanation')} aria-live="polite">{vm.current.why}</p>{/if}
  {#if vm.predicting && vm.next}<fieldset class={classNames(styles, 'question')}>
      <legend class={styles.scope}
        >{vm.next.question?.prompt ?? 'Which line should execute next from this state?'}</legend
      >{#each vm.options as option, i}<label class={styles.scope}
          ><input
            class={styles.scope}
            type="radio"
            name="code-prediction"
            checked={vm.choice === i}
            onchange={() => vm.choose(i)}
          />{option}</label
        >{/each}
    </fieldset>
    <button class={styles.scope} disabled={vm.choice === null} onclick={vm.check}>Check prediction</button
    >{#if vm.checked}<p class={classNames(styles, 'feedback')} role="status">
        <strong class={styles.scope}
          >{vm.correct ? 'That follows from this state.' : 'Reconsider the branch or reference being changed.'}</strong
        >
        {vm.next.question?.explanation ?? vm.next.why}
      </p>{/if}{/if}
  <div class={classNames(styles, 'controls')}>
    <button class={styles.scope} disabled={vm.index === 0} onclick={() => vm.move(-1)}>← Previous decision</button
    ><button
      class={styles.scope}
      disabled={!vm.next || (vm.predicting && (!vm.checked || !vm.correct))}
      onclick={() => vm.move(1)}>Next decision →</button
    ><button class={styles.scope} onclick={vm.restart}>Restart trace</button>
  </div>
  <div class={classNames(styles, 'workspace')}>
    <div class={classNames(styles, 'state')}>
      <h3 class={styles.scope}>{vm.current.title}</h3>
      <div class={classNames(styles, 'diagram')} bind:this={vm.stage}>
        <svg
          class={styles.scope}
          viewBox="0 0 {vm.current.grid?.length
            ? Math.max(vm.width, (Math.max(...vm.current.grid.map((c) => c.column)) + 1) * 38 + 40)
            : vm.width} {vm.height}"
          role="img"
          aria-label={vm.diagramDescription}
        >
          <defs class={styles.scope}
            ><marker
              class={styles.scope}
              id="trace-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"><path class={styles.scope} d="M0 0L10 5L0 10Z" /></marker
            ></defs
          >
          {#if vm.current.nodes}
            {#each vm.edges as edge}<path
                class={classNames(styles, 'edge', { back: edge.label === 'prev' })}
                d={edge.d}
                marker-end="url(#trace-arrow)"
              /><text class={classNames(styles, 'edge-label')} x={edge.x} y={edge.y}>{edge.label}</text>{/each}
            {#each vm.nodes as node}<g
                class={classNames(styles, 'node', { active: node.active })}
                transform="translate({node.x} {node.y})"
                ><rect class={styles.scope} width="72" height="90" /><text
                  class={classNames(styles, 'identity')}
                  x="36"
                  y="20">{node.id}</text
                ><text class={classNames(styles, 'value')} x="36" y="47">{node.value}</text><text
                  class={classNames(styles, 'reference')}
                  x="36"
                  y="66"
                  >next: {vm.current.links?.find((l) => l.from === node.id && l.label === 'next')?.to ?? 'None'}</text
                >{#if vm.trace.title.startsWith('Doubly')}<text class={classNames(styles, 'reference')} x="36" y="82"
                    >prev: {vm.current.links?.find((l) => l.from === node.id && l.label === 'prev')?.to ?? 'None'}</text
                  >{/if}</g
              >{/each}
          {/if}
          {#if vm.current.grid}
            {#each vm.current.grid as cell}<g
                class={classNames(styles, 'cell', { active: cell.role === 'active', settled: cell.role === 'settled' })}
                transform="translate({20 + cell.column * 38} {20 + cell.row * 38})"
                ><rect class={styles.scope} width="32" height="32" /><text class={styles.scope} x="16" y="22"
                  >{cell.value}</text
                ></g
              >{/each}
          {:else}
            {#each vm.rows as row}<text class={classNames(styles, 'row-label')} x="20" y={row.y}
                >{#each row.labelLines as line, k}<tspan class={styles.scope} x="20" dy={k ? 18 : 0}>{line}</tspan
                  >{/each}</text
              >
              {#if !row.values.length}<text class={classNames(styles, 'row-label')} x="20" y={row.cellY + 22}
                  >Empty</text
                >{/if}
              {#each row.values as value, i}<g
                  class={classNames(styles, 'cell', {
                    active: row.active?.includes(i),
                    settled: row.settled?.includes(i),
                    group: row.group?.includes(i),
                  })}
                  transform="translate({20 + (i % vm.columns) * 90} {row.cellY + Math.floor(i / vm.columns) * 82})"
                  ><rect class={styles.scope} width="78" height="52" /><text class={styles.scope} x="39" y="23"
                    >{#each vm.wrapValue(value) as part, k}<tspan class={styles.scope} x="39" dy={k ? 15 : 0}
                        >{part}</tspan
                      >{/each}</text
                  ><text class={classNames(styles, 'index')} x="39" y="70">{i}</text></g
                >{/each}
            {/each}
          {/if}
        </svg>
      </div>
      <dl class={classNames(styles, 'variables')}>
        {#each Object.entries(vm.current.variables) as [key, value]}<div class={styles.scope}>
            <dt class={styles.scope}>{key}</dt>
            <dd class={styles.scope}>{value}</dd>
          </div>{/each}
      </dl>
    </div>
    <div class={classNames(styles, 'code')} aria-label="Code and executed line">
      <h3 class={styles.scope}>
        {vm.trace.language ?? 'Python teaching code'} · {vm.predicting
          ? 'predict the next line'
          : 'highlight = executed line'}
      </h3>
      <ol class={styles.scope} bind:this={vm.codePanel}>
        {#each vm.trace.code as line, i}<li
            class={classNames(styles, 'code-line', { executed: !vm.predicting && vm.current.lines.includes(i) })}
            aria-current={!vm.predicting && vm.current.lines.includes(i) ? 'step' : undefined}
          >
            <code class={styles.scope}>{line || ' '}</code>
          </li>{/each}
      </ol>
    </div>
  </div>
  {#if !vm.next}<p class={styles.scope} role="status">Trace complete.</p>{/if}
  <p class={classNames(styles, 'note')}>{vm.trace.note}</p>
</section>
