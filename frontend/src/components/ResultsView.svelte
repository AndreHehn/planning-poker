<script>
  import { fly } from 'svelte/transition'
  import { t } from '../lib/i18n.js'


  export let users = []

  $: participants = users.filter(u => u.role === 'participant' && u.vote !== null)

  $: tally = participants.reduce((acc, u) => {
    acc[u.vote] = (acc[u.vote] || 0) + 1
    return acc
  }, {})

  $: entries = Object.entries(tally)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)

  $: max = entries.length ? Math.max(...entries.map(e => e.count)) : 1

  $: average = (() => {
    const numeric = participants.map(u => parseFloat(u.vote)).filter(n => !isNaN(n))
    if (!numeric.length) return null
    return (numeric.reduce((s, n) => s + n, 0) / numeric.length).toFixed(1)
  })()

  $: consensus = entries.length === 1
</script>

{#if entries.length > 0}
  <div class="results">
    <div class="summary">
      {#if consensus}
        <span class="consensus-badge">{$t('results.consensus')}</span>
      {/if}
      {#if average !== null}
        <span class="avg">{$t('results.average')} {average}</span>
      {/if}
    </div>

    <div class="bars">
      {#each entries as entry, i}
        <div
          class="bar-row"
          in:fly={{ y: 12, delay: i * 60, duration: 250 }}
        >
          <span class="bar-label">{entry.value}</span>
          <div class="bar-track">
            <div
              class="bar-fill"
              class:consensus-bar={consensus}
              style="width: {(entry.count / max) * 100}%"
            ></div>
          </div>
          <span class="bar-count">{entry.count}×</span>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .results {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .summary {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .consensus-badge {
    background: rgba(34, 197, 94, 0.15);
    color: var(--green);
    border-radius: 6px;
    padding: 0.2rem 0.6rem;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .avg {
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  .bars {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .bar-row {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
  }

  .bar-label {
    font-weight: 700;
    font-size: 1rem;
    text-align: right;
  }

  .bar-track {
    background: var(--bg-elevated);
    border-radius: 4px;
    height: 28px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 4px;
    transition: width 0.4s ease;
    min-width: 4px;
  }

  .bar-fill.consensus-bar {
    background: var(--green);
  }

  .bar-count {
    font-size: 0.85rem;
    color: var(--text-muted);
  }
</style>
