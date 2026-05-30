<script>
  import { send } from '../lib/ws.js'
  import { t } from '../lib/i18n.js'

  export let revealed = false
  export let voteCount = 0
  export let totalParticipants = 0

  function reveal() {
    send({ type: 'reveal' })
  }

  function reset() {
    send({ type: 'reset' })
  }
</script>

<div class="actions">
  {#if revealed}
    <button class="btn-reset" on:click={reset}>{$t('reveal.newRound')}</button>
  {:else}
    <button
      class="btn-reveal"
      on:click={reveal}
      disabled={voteCount === 0}
    >
      {$t('reveal.reveal')}
      {#if totalParticipants > 0}
        <span class="count">{voteCount}/{totalParticipants}</span>
      {/if}
    </button>
  {/if}
</div>

<style>
  .actions {
    display: flex;
    justify-content: center;
  }

  .btn-reveal {
    background: var(--accent);
    color: #fff;
    border-radius: var(--radius-sm);
    padding: 0.85rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: background 0.15s, opacity 0.15s;
  }

  .btn-reveal:hover:not(:disabled) {
    background: var(--accent-hover);
  }

  .btn-reveal:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .count {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 0.1rem 0.5rem;
    font-size: 0.85rem;
  }

  .btn-reset {
    background: var(--bg-elevated);
    border: 2px solid var(--border);
    color: var(--text);
    border-radius: var(--radius-sm);
    padding: 0.85rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    transition: border-color 0.15s;
  }

  .btn-reset:hover {
    border-color: var(--accent);
  }
</style>
