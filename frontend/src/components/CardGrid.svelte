<script>
  import { send } from '../lib/ws.js'

  export let scale = []
  export let myVote = null
  export let revealed = false
  export let role = 'participant'

  function vote(value) {
    if (revealed || role === 'observer') return
    send({ type: 'vote', value })
  }
</script>

<div class="card-grid">
  {#each scale as value}
    <button
      class="card"
      class:selected={myVote === value}
      class:revealed
      disabled={revealed || role === 'observer'}
      on:click={() => vote(value)}
    >
      {value}
    </button>
  {/each}
</div>

<style>
  .card-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }

  .card {
    background: var(--bg-elevated);
    border: 2px solid var(--border);
    border-radius: var(--radius);
    width: 64px;
    height: 90px;
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--text);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.15s, background 0.15s, transform 0.15s;
  }

  .card:hover:not(:disabled):not(.selected) {
    border-color: var(--accent);
    transform: translateY(-4px);
  }

  .card.selected {
    border-color: var(--accent);
    background: rgba(var(--accent-rgb), 0.15);
    transform: translateY(-6px);
  }

  .card:disabled:not(.selected) {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .card.revealed {
    transform: none;
  }
</style>
