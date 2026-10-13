<script>
  import styles from './view.module.css';
  import { classNames } from '../class-names.ts';
  import NavigationLink from '../navigation-link/view.svelte';
  let { entry, number = 1 } = $props();
</script>

<article class={classNames(styles, 'library-row link-controls')}>
  <div class={classNames(styles, 'library-copy')}>
    {#if entry.title !== entry.question}<span class={classNames(styles, 'library-label')}>{entry.title}</span>{/if}
    <h2 class={styles.scope}>
      <a class={styles.scope} href={entry.href}>{entry.question}</a>
    </h2>
    <p class={styles.scope}>{entry.description}</p>
  </div>
  <div class={classNames(styles, 'library-sketch')} aria-hidden="true">
    {#if entry.id === 'algorithms'}
      <svg class={styles.scope} viewBox="0 0 220 90"
        ><path class={classNames(styles, 'sketch-path')} d="M31 24Q110 -12 189 24" /><path
          class={classNames(styles, 'sketch-path')}
          d="M31 59Q110 104 189 59"
        />{#each [2, 4, 7, 9] as value, i}<rect
            class={styles.scope}
            x={12 + i * 53}
            y="29"
            width="36"
            height="34"
          /><text class={styles.scope} x={30 + i * 53} y="51">{value}</text>{/each}</svg
      >
    {:else if entry.id === 'problems' || entry.id === 'two-pointers'}
      <svg class={styles.scope} viewBox="0 0 220 90">
        <path class={classNames(styles, 'sketch-path')} d="M30 76h53m-10-6 10 6-10 6M190 76h-53m10-6-10 6 10 6" />
        {#each [1, 3, 5, 9] as value, i}<rect class={styles.scope} x={12 + i * 53} y="16" width="36" height="34" /><text
            class={styles.scope}
            x={30 + i * 53}
            y="38">{value}</text
          >{/each}
        <text class={styles.scope} x="30" y="65">i</text><text class={styles.scope} x="189" y="65">j</text>
      </svg>
    {:else if ['structures', 'linked-list', 'list-adt', 'list-storage', 'list-insertion', 'list-traversal', 'python-lists'].includes(entry.id)}
      <svg class={styles.scope} viewBox="0 0 220 90"
        ><path class={classNames(styles, 'sketch-path')} d="M52 43h27m-7-5 7 5-7 5M127 43h27m-7-5 7 5-7 5" />
        {#each ['A', 'B', 'C'] as value, i}<rect
            class={styles.scope}
            x={12 + i * 75}
            y="24"
            width="42"
            height="36"
          /><text class={styles.scope} x={33 + i * 75} y="47">{value}</text>{/each}
        <text class={styles.scope} x="33" y="80">head</text>
      </svg>
    {:else if ['sliding-window', 'prefix-sum', 'binary-search', 'greedy'].includes(entry.id)}
      <svg class={styles.scope} viewBox="0 0 220 90"
        >{#each [1, 2, 3, 4, 5, 6] as value, i}<rect
            class={styles.scope}
            x={8 + i * 35}
            y="26"
            width="29"
            height="32"
          /><text class={styles.scope} x={22 + i * 35} y="47">{value}</text>{/each}<path
          class={classNames(styles, 'sketch-path')}
          d="M42 20v-6h105v6M42 64v6h105v-6"
        /><text class={styles.scope} x="95" y="87">range</text></svg
      >
    {:else if entry.id === 'intervals'}
      <svg class={styles.scope} viewBox="0 0 220 90"
        ><path class={classNames(styles, 'sketch-path')} d="M20 25h95M75 47h110M20 72h165" /><text
          class={styles.scope}
          x="40"
          y="16">start</text
        ><text class={styles.scope} x="172" y="88">end</text></svg
      >
    {:else if entry.id === 'stack'}
      <svg class={styles.scope} viewBox="0 0 220 90"
        >{#each [3, 2, 1] as value, i}<rect class={styles.scope} x="65" y={8 + i * 26} width="80" height="23" /><text
            class={styles.scope}
            x="105"
            y={25 + i * 26}>{value}</text
          >{/each}<text class={styles.scope} x="175" y="23">top</text></svg
      >
    {:else if entry.id === 'matrices'}
      <svg class={styles.scope} viewBox="0 0 220 90"
        >{#each [0, 1, 2] as row}{#each [0, 1, 2] as col}<rect
              class={styles.scope}
              x={60 + col * 29}
              y={6 + row * 27}
              width="25"
              height="23"
            />{/each}{/each}<path class={classNames(styles, 'sketch-path')} d="M70 17h58v54H70V44h29" /></svg
      >
    {:else if ['heap', 'trie', 'graphs', 'depth-first-search', 'breadth-first-search', 'backtracking', 'dynamic-programming', 'lower-bound'].includes(entry.id)}
      <svg class={styles.scope} viewBox="0 0 220 90"
        ><path
          class={classNames(styles, 'sketch-path')}
          d="M110 25L55 64M110 25L165 64"
        />{#each [[110, 20], [55, 68], [165, 68]] as point, i}<circle
            class={styles.scope}
            cx={point[0]}
            cy={point[1]}
            r="16"
          /><text class={styles.scope} x={point[0]} y={point[1] + 5}
            >{entry.id === 'heap' ? [1, 3, 4][i] : ['A', 'B', 'C'][i]}</text
          >{/each}</svg
      >
    {:else if entry.id === 'discrete' || entry.id === 'induction'}
      <svg class={styles.scope} viewBox="0 0 220 90"
        ><path
          class={classNames(styles, 'sketch-path')}
          d="M36 44H184"
        />{#each ['P(1)', 'P(k)', 'P(k+1)'] as value, i}<circle
            class={styles.scope}
            cx={31 + i * 79}
            cy="44"
            r="25"
          /><text class={styles.scope} x={31 + i * 79} y="48" font-size="11">{value}</text>{/each}</svg
      >
    {:else if entry.id === 'telescoping'}
      <svg class={styles.scope} viewBox="0 0 220 90">
        <text class={styles.scope} x="110" y="32">A − B + B − C + C − D</text>
        <path class={classNames(styles, 'sketch-cost')} d="M55 22l13 17M86 22l13 17M118 22l13 17M149 22l13 17" />
        <path class={classNames(styles, 'sketch-path')} d="M30 48H190" />
        <text class={styles.scope} x="110" y="72">A − D</text>
      </svg>
    {:else if entry.id === 'master'}
      <svg class={styles.scope} viewBox="0 0 220 90">
        <path
          class={classNames(styles, 'sketch-path')}
          d="M110 22L56 42M110 22L164 42M56 42L28 72M56 42L84 72M164 42L136 72M164 42L192 72"
        />
        <text class={styles.scope} x="110" y="17">n</text>
        <text class={styles.scope} x="56" y="42">n/2</text>
        <text class={styles.scope} x="164" y="42">n/2</text>
        <text class={styles.scope} x="28" y="86">n/4</text>
        <text class={styles.scope} x="84" y="86">n/4</text>
        <text class={styles.scope} x="136" y="86">n/4</text>
        <text class={styles.scope} x="192" y="86">n/4</text>
      </svg>
    {:else if entry.id === 'space'}
      <svg class={styles.scope} viewBox="0 0 220 90">
        <text class={styles.scope} x="110" y="16">input</text>
        {#each [0, 1, 2, 3] as i}
          <rect class={styles.scope} x={25 + i * 44} y="23" width="37" height="20" />
          <rect class={styles.scope} x={25 + i * 44} y="66" width="37" height="20" />
        {/each}
        <text class={styles.scope} x="110" y="59">extra buffer</text>
      </svg>
    {:else if entry.id === 'asymptotic'}
      <svg class={styles.scope} viewBox="0 0 220 90">
        <path class={classNames(styles, 'sketch-axis')} d="M15 12V76H207" />
        <path class={classNames(styles, 'sketch-cost')} d="M16 70L201 17" />
        <path class={classNames(styles, 'sketch-path')} d="M16 74Q80 63 201 35" />
        <path class={classNames(styles, 'sketch-axis')} d="M16 76L201 57" />
        <text class={styles.scope} x="195" y="87">n</text>
      </svg>
    {:else}
      <svg class={styles.scope} viewBox="0 0 220 90"
        ><path class={classNames(styles, 'sketch-axis')} d="M15 12V76H207" /><path
          class={classNames(styles, 'sketch-path')}
          d="M16 74L201 54"
        /><path class={classNames(styles, 'sketch-cost')} d="M16 74Q148 73 201 17" /><text
          class={styles.scope}
          x="194"
          y="87"
          font-size="10">n</text
        ></svg
      >
    {/if}
  </div>
  <nav class={classNames(styles, 'library-links')} aria-label={entry.navigationLabel ?? entry.title + ' topics'}>
    {#each entry.links as link}
      <NavigationLink href={link.href} label={link.title} />
    {/each}
  </nav>
</article>
