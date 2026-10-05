<script>
  import styles from './view.module.css';
  import { classNames } from '../../../../shared/ui/class-names.ts';

  import { colors } from './model.ts';
</script>

<figure class={classNames(styles, 'cancellation-sum')}>
  <figcaption class={styles.scope}>Four terms · matching colors cancel, green endpoints remain</figcaption>
  <div class={classNames(styles, 'sum-rows')} aria-label="Expanded sum with three matching cancellation pairs">
    {#each [1, 2, 3, 4] as k}
      <div class={classNames(styles, 'sum-row')}>
        <span class={classNames(styles, 'term-index')}>k = {k}</span>
        <span
          class={classNames(styles, 'signed-term', { survives: k === 1 })}
          style:--pair={k === 1 ? 'var(--green)' : colors[k - 2]}
        >
          <span class={styles.scope}>+</span><math class={styles.scope}
            >{#if k === 1}<mn class={styles.scope}>1</mn>{:else}<mfrac class={styles.scope}
                ><mn class={styles.scope}>1</mn><mn class={styles.scope}>{k}</mn></mfrac
              >{/if}</math
          >
        </span>
        <span
          class={classNames(styles, 'signed-term', { survives: k === 4 })}
          style:--pair={k === 4 ? 'var(--green)' : colors[k - 1]}
        >
          <span class={styles.scope}>−</span><math class={styles.scope}
            ><mfrac class={styles.scope}><mn class={styles.scope}>1</mn><mn class={styles.scope}>{k + 1}</mn></mfrac
            ></math
          >
        </span>
      </div>
    {/each}
  </div>
  <div class={classNames(styles, 'pair-key')}>
    {#each [2, 3, 4] as denominator, i}<span class={styles.scope} style:color={colors[i]}
        >−1/{denominator} + 1/{denominator} = 0</span
      >{/each}
  </div>
  <p class={classNames(styles, 'sum-result')}>
    <span class={styles.scope}>Survives</span><math class={styles.scope}
      ><mrow class={styles.scope}
        ><mn class={styles.scope}>1</mn><mo class={styles.scope}>−</mo><mfrac class={styles.scope}
          ><mn class={styles.scope}>1</mn><mn class={styles.scope}>5</mn></mfrac
        ><mo class={styles.scope}>=</mo><mfrac class={styles.scope}
          ><mn class={styles.scope}>4</mn><mn class={styles.scope}>5</mn></mfrac
        ></mrow
      ></math
    >
  </p>
</figure>
