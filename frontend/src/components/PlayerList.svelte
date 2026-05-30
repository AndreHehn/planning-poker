<script>
  import { onDestroy } from 'svelte'
  import { fly } from 'svelte/transition'
  import { t } from '../lib/i18n.js'

  export let users = []
  export let revealed = false
  export let currentUserId = null

  const waitingSince = new Map()
  let wiggling = new Set()

  const tick = setInterval(() => {
    const now = Date.now()
    const next = new Set()
    for (const [id, since] of waitingSince) {
      if (now - since > 60000) next.add(id)
    }
    wiggling = next
  }, 5000)

  onDestroy(() => clearInterval(tick))

  $: {
    const currentIds = new Set(users.map(u => u.id))
    for (const user of users) {
      const isWaiting = !user.voted && user.role === 'participant' && user.connected && !revealed
      if (isWaiting) {
        if (!waitingSince.has(user.id)) waitingSince.set(user.id, Date.now())
      } else {
        waitingSince.delete(user.id)
      }
    }
    for (const id of [...waitingSince.keys()]) {
      if (!currentIds.has(id)) waitingSince.delete(id)
    }
  }
</script>

<div class="player-list">
  {#each users as user (user.id)}
    <div
      class="player-tile"
      class:voted={user.voted}
      class:waiting={!user.voted && user.role === 'participant' && user.connected && !revealed}
      class:wiggle={wiggling.has(user.id)}
      class:offline={!user.connected}
      class:observer={user.role === 'observer'}
      class:me={user.id === currentUserId}
      in:fly={{ y: 16, duration: 250 }}
    >
      <div class="player-header">
        <span class="dot" class:online={user.connected} class:offline-dot={!user.connected}></span>
        <span class="name">{user.name}{user.id === currentUserId ? $t('player.you') : ''}</span>
        {#if user.role === 'observer'}
          <span class="badge">{$t('player.observer')}</span>
        {/if}
      </div>

      <div class="vote-area">
        {#if user.role === 'observer'}
          <span class="vote-placeholder">—</span>
        {:else if revealed && user.vote !== null}
          <span class="vote-value">{user.vote}</span>
        {:else if user.voted}
          <span class="vote-hidden">✓</span>
        {:else}
          <span class="vote-placeholder">…</span>
        {/if}
      </div>
    </div>
  {/each}
</div>

<style>
  .player-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .player-tile {
    background: var(--bg-elevated);
    border: 2px solid var(--border);
    border-radius: var(--radius);
    padding: 1rem;
    min-width: 110px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    transition: border-color 0.2s;
  }

  .player-tile.voted {
    border-color: var(--green);
  }

  .player-tile.waiting {
    animation: pulse-waiting 2s ease-in-out infinite;
  }

  .player-tile.wiggle {
    animation: wiggle 0.5s ease-in-out 3;
  }

  .player-tile.offline {
    opacity: 0.4;
  }

  .player-tile.me {
    border-color: var(--accent);
  }

  .player-tile.me.voted {
    border-color: var(--green);
  }

  .player-header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .dot.online  { background: var(--green); }
  .dot.offline-dot { background: var(--text-muted); }

  .name {
    font-size: 0.9rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .badge {
    font-size: 0.7rem;
    color: var(--text-muted);
    background: var(--bg-card);
    border-radius: 4px;
    padding: 0.1rem 0.35rem;
    margin-left: auto;
    flex-shrink: 0;
  }

  .vote-area {
    text-align: center;
    min-height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .vote-value {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text);
    animation: flip-in 0.3s ease;
  }

  .vote-hidden    { font-size: 1.1rem; color: var(--green); }
  .vote-placeholder { font-size: 1rem; color: var(--text-muted); }
</style>
