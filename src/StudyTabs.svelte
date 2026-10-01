<script>
  let { tabs, selected, label, controls = undefined, idPrefix = 'view-tab' } = $props();
  function navigate(event, index) {
    const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length
      : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault();
    event.currentTarget.parentElement.children[next].focus();
    window.location.hash = tabs[next].href;
  }
</script>

<div class="study-tabs" role="tablist" aria-label={label}>
  {#each tabs as tab, index}<a href={tab.href} role="tab" id="{idPrefix}-{tab.id}" aria-selected={selected === tab.id} aria-controls={controls} tabindex={selected === tab.id ? 0 : -1} onkeydown={(event) => navigate(event, index)}>{tab.label}</a>{/each}
</div>

<style>
  .study-tabs { display:flex; flex-wrap:wrap; flex:none; min-width:0; border-bottom:1px solid #3a3d47; background:#202229; }
  a { display:grid; place-items:center; min-height:49px; padding:10px 23px; border-bottom:2px solid transparent; border-radius:0; color:#9aa9bb; text-decoration:none; font-size:13px; white-space:nowrap; }
  a[aria-selected='true'] { background:#252d38; border-bottom-color:#79b7ff; color:#d1e6ff; }
  a:hover { color:#e8eff7; background:#242b35; }
  a:focus-visible { outline:2px solid #79b7ff; outline-offset:-3px; }
  @media(max-width:720px) { a { flex:1 0 auto; min-height:45px; padding:10px 13px; font-size:12px; } }
</style>
