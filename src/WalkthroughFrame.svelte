<script>
  let { name, src, onShortcut } = $props();
  let frame = $state(null);
  let status = $state('loading');
  let attempt = $state(0);

  $effect(() => {
    const element = frame;
    const expectedTitle = `${name} Walkthrough`.toLowerCase();
    // Capture the URL so a new algorithm starts its own monitor.
    const expectedUrl = src;
    if (!element) return;
    status = 'loading';
    let keyboardDocument;
    let poll;
    let deadline;
    const stopWaiting = () => { clearInterval(poll); clearTimeout(deadline); };
    const inspect = () => {
      try {
        const doc = element.contentDocument;
        if (!doc || doc.URL !== expectedUrl) return false;
        if (doc.title.trim().toLowerCase() !== expectedTitle || !doc.querySelector('.history-row, .row')) return false;
        if (keyboardDocument !== doc) {
          keyboardDocument?.removeEventListener('keydown', onShortcut);
          keyboardDocument = doc;
          doc.addEventListener('keydown', onShortcut);
        }
        status = 'ready';
        return true;
      } catch {
        return false;
      }
    };
    const loaded = () => {
      // Cached documents and HMR can finish before a load listener is attached.
      if (inspect()) stopWaiting();
    };
    const failed = () => { status = 'error'; stopWaiting(); };
    element.addEventListener('load', loaded);
    element.addEventListener('error', failed);
    poll = setInterval(loaded, 100);
    deadline = setTimeout(() => { if (!inspect()) failed(); else stopWaiting(); }, 8000);
    loaded();
    return () => {
      stopWaiting();
      element.removeEventListener('load', loaded);
      element.removeEventListener('error', failed);
      keyboardDocument?.removeEventListener('keydown', onShortcut);
    };
  });
</script>

<div class="walkthrough-host" aria-busy={status === 'loading'}>
  {#key attempt}
    <iframe bind:this={frame} class="walkthrough-frame" title="{name} step-by-step walkthrough" {src}></iframe>
  {/key}
  {#if status === 'loading'}
    <div class="walkthrough-status" role="status">Loading the interactive walkthrough…</div>
  {:else if status === 'error'}
    <div class="walkthrough-status" role="alert">
      <strong>The walkthrough couldn’t open.</strong>
      <span>Try reloading it, or open it in its own tab.</span>
      <button onclick={() => (attempt += 1)}>Reload walkthrough</button>
      <a href={src} target="_blank" rel="noreferrer">Open standalone</a>
    </div>
  {/if}
</div>
