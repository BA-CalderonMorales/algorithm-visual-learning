<script>
  import styles from './view.module.css';
  import { classNames } from '../class-names.ts';
  import NavigationLink from '../navigation-link/view.svelte';
  let { entry, number = 1 } = $props();
</script>

<article class={classNames(styles, 'library-row link-controls')}>
  <div class={classNames(styles, 'library-copy')}>
    <span class={classNames(styles, 'library-label')}>0{number} / {entry.title}</span>
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
