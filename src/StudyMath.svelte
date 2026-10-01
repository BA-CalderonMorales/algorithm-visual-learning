<script>
  let { expression, label = undefined } = $props();
</script>

<div class="study-math" aria-label={label}>
  <!-- expression is authored MathML from study-lessons.js, never external input. -->
  {@html `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mrow>${expression}</mrow></math>`}
</div>

<style>
  .study-math { min-width:0; max-width:100%; overflow-x:auto; padding:18px 12px; text-align:center; color:#e0d6fb; scrollbar-width:thin; scrollbar-color:#61547c transparent; }
  .study-math :global(math) { display:math; max-width:100%; margin-inline:auto; font:1.3rem Cambria,"STIX Two Math",serif; }
  @media(max-width:600px) { .study-math { padding:16px 6px; } .study-math :global(math) { font-size:1.08rem; } }
</style>
