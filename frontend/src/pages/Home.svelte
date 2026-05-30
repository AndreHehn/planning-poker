<script>
  import { push } from 'svelte-spa-router'
  import { SCALES } from '../lib/scales.js'
  import { t } from '../lib/i18n.js'

  let selectedScale = SCALES[0]
  let loading = false
  let error = null

  async function createRoom() {
    loading = true
    error = null
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scaleName: selectedScale.name, scale: selectedScale.values })
      })
      if (!res.ok) throw new Error('Server error')
      const { id } = await res.json()
      push(`/room/${id}`)
    } catch {
      error = $t('home.createError')
      loading = false
    }
  }
</script>

<main>
  <div class="hero">
    <h1>Planning Poker</h1>
    <p>{$t('home.tagline')}</p>
  </div>

  <div class="card">
    <h2>{$t('home.scaleHeading')}</h2>
    <div class="scales">
      {#each SCALES as scale}
        <button
          class="scale-btn"
          class:selected={selectedScale.name === scale.name}
          on:click={() => selectedScale = scale}
        >
          <span class="scale-label">{$t(`scales.${scale.name}`)}</span>
          <span class="scale-preview">{scale.values.slice(0, 5).join(' · ')} …</span>
        </button>
      {/each}
    </div>

    {#if error}
      <p class="error">{error}</p>
    {/if}

    <button class="create-btn" on:click={createRoom} disabled={loading}>
      {loading ? $t('home.creating') : $t('home.createBtn')}
    </button>
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem 1rem;
    gap: 2rem;
  }

  .hero {
    text-align: center;
  }

  .hero h1 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text);
  }

  .hero p {
    margin-top: 0.5rem;
    color: var(--text-muted);
    font-size: 1.1rem;
  }

  .card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 2rem;
    width: 100%;
    max-width: 480px;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  h2 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .scales {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .scale-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg-elevated);
    border: 2px solid transparent;
    border-radius: var(--radius-sm);
    padding: 0.75rem 1rem;
    color: var(--text);
    text-align: left;
    transition: border-color 0.15s, background 0.15s;
  }

  .scale-btn:hover {
    border-color: var(--border);
    background: var(--bg-elevated);
  }

  .scale-btn.selected {
    border-color: var(--accent);
    background: rgba(var(--accent-rgb), 0.08);
  }

  .scale-label {
    font-weight: 600;
  }

  .scale-preview {
    font-size: 0.8rem;
    color: var(--text-muted);
    font-family: monospace;
  }

  .create-btn {
    background: var(--accent);
    color: #fff;
    border-radius: var(--radius-sm);
    padding: 0.85rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    transition: background 0.15s, opacity 0.15s;
  }

  .create-btn:hover:not(:disabled) {
    background: var(--accent-hover);
  }

  .create-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error {
    color: var(--red);
    font-size: 0.9rem;
  }
</style>
