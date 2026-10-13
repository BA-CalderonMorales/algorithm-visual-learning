<script>
  import styles from './view.module.css';
  import { classNames } from '../../../shared/ui/class-names.ts';
  import { createViewModel } from './view-model.svelte.ts';
  const vm = createViewModel();
</script>

<section class={classNames(styles, 'node-workbench')} aria-label="Linked insertion workbench">
  <h2 class={styles.scope}>Preserve the chain, one assignment at a time.</h2>
  <div class={classNames(styles, 'choices')} role="group" aria-label="Insertion location">
    {#each [['prepend', 'At the head'], ['middle', 'Between A and B'], ['append', 'At the tail']] as [id, label]}<button
        class={styles.scope}
        aria-pressed={vm.mode === id}
        onclick={() => vm.select(id)}>{label}</button
      >{/each}
  </div>
  <div class={classNames(styles, 'diagram-scroll')}>
    <svg
      class={styles.scope}
      viewBox="0 0 740 {vm.step === 2 ? 190 : 310}"
      role="img"
      aria-label="{vm.state.order.join(' to ')}. {vm.state.statement}"
    >
      <defs class={styles.scope}
        ><marker
          class={styles.scope}
          id="node-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"><path class={styles.scope} d="M0 0L10 5L0 10Z" /></marker
        ></defs
      >
      {#each vm.edges as edge}<path
          class={classNames(styles, 'link')}
          d={edge.d}
          marker-end="url(#node-arrow)"
        />{/each}
      {#each vm.state.nodes as node (node.id)}<g
          class={classNames(styles, 'node', { selected: node.id === 'X' })}
          transform="translate({node.x} {node.y})"
        >
          {#each vm.faces as points}<polygon class={styles.scope} {points} />{/each}
          <text class={classNames(styles, 'data')} x="43" y="42">{node.id}</text>
          <text class={classNames(styles, 'next')} x="85" y="45">next</text>
          <text class={classNames(styles, 'address')} x="50" y="95">node {node.id}</text>
          {#if node.id === vm.state.head}<text class={classNames(styles, 'head')} x="40" y="-12">head</text>{/if}
          {#if node.id === vm.state.tail}<text class={classNames(styles, 'head')} x="40" y="-32">tail</text>{/if}
        </g>{/each}
      {#each vm.state.nodes.filter((node) => !vm.state.links.some((link) => link[0] === node.id)) as node}
        <path class={classNames(styles, 'link')} d="M{node.x + 112} {node.y + 35}h24" marker-end="url(#node-arrow)" />
        <text class={classNames(styles, 'end')} x={node.x + 140} y={node.y + 40}>None</text>
      {/each}
    </svg>
  </div>
  <div class={classNames(styles, 'assignment')} aria-live="polite">
    <strong class={styles.scope}>{vm.step + 1} / 3 — {vm.state.statement}</strong>
    <p class={styles.scope}>{vm.state.explanation}</p>
  </div>
  <div class={classNames(styles, 'choices')}>
    <button class={styles.scope} disabled={vm.step === 0} onclick={() => vm.move(-1)}>← Previous assignment</button
    ><button class={styles.scope} disabled={vm.step === 2} onclick={() => vm.move(1)}>Next assignment →</button>
  </div>
  <p class={classNames(styles, 'note')}>
    Nodes may live at separate memory locations. Follow their links rather than their position on the screen. An empty
    list needs both head and tail set to X.
  </p>
</section>
