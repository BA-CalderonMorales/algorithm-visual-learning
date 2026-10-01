<script>
  // Four terms are enough to see the full pairing without an overflowing line.
  const colors = ['#79b7ff', '#c2a0fb', '#f0a66e'];
</script>

<figure class="cancellation-sum">
  <figcaption>Four terms · matching colors cancel, green endpoints remain</figcaption>
  <div class="sum-rows" aria-label="Expanded sum with three matching cancellation pairs">
    {#each [1, 2, 3, 4] as k}
      <div class="sum-row">
        <span class="term-index">k = {k}</span>
        <span class:survives={k === 1} class="signed-term" style:--pair={k === 1 ? '#65d9b0' : colors[k - 2]}>
          <span>+</span><math>{#if k === 1}<mn>1</mn>{:else}<mfrac><mn>1</mn><mn>{k}</mn></mfrac>{/if}</math>
        </span>
        <span class:survives={k === 4} class="signed-term" style:--pair={k === 4 ? '#65d9b0' : colors[k - 1]}>
          <span>−</span><math><mfrac><mn>1</mn><mn>{k + 1}</mn></mfrac></math>
        </span>
      </div>
    {/each}
  </div>
  <div class="pair-key">{#each [2, 3, 4] as denominator, i}<span style:color={colors[i]}>−1/{denominator} + 1/{denominator} = 0</span>{/each}</div>
  <p class="sum-result"><span>Survives</span><math><mrow><mn>1</mn><mo>−</mo><mfrac><mn>1</mn><mn>5</mn></mfrac><mo>=</mo><mfrac><mn>4</mn><mn>5</mn></mfrac></mrow></math></p>
</figure>

<style>
  .cancellation-sum { max-width:560px; margin:18px auto; border:1px solid #35434c; background:#161b22; padding:16px 20px; }
  figcaption { margin-bottom:16px; color:#a5b4c6; font-size:12px; line-height:1.5; }
  .sum-rows { display:grid; gap:8px; }
  .sum-row { display:grid; grid-template-columns:70px 1fr 1fr; gap:12px; align-items:center; }
  .term-index { color:#8596aa; font-size:12px; }
  .signed-term { position:relative; display:flex; align-items:center; justify-content:center; gap:10px; min-height:52px; border:1px solid color-mix(in srgb,var(--pair) 50%,transparent); color:var(--pair); background:color-mix(in srgb,var(--pair) 7%,transparent); }
  .signed-term:not(.survives)::after { position:absolute; top:50%; left:20%; width:60%; border-top:1px solid var(--pair); opacity:.7; transform:rotate(-18deg); content:''; }
  math { font:1.35rem Cambria,serif; }
  .pair-key { display:flex; flex-wrap:wrap; justify-content:center; gap:6px 18px; margin:18px 0; font-size:11px; }
  .sum-result { display:flex; justify-content:center; gap:24px; align-items:center; margin:0; padding-top:14px; border-top:1px solid #35434c; color:#65d9b0; }
  .sum-result span { font-size:12px; }
  @media(max-width:600px) { .cancellation-sum { padding:14px 12px; } .sum-row { grid-template-columns:46px 1fr 1fr; gap:8px; } figcaption { font-size:11px; } }
</style>
