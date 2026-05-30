<script>
  import { createEventDispatcher } from 'svelte'
  import { fade, fly } from 'svelte/transition'
  import { t } from '../lib/i18n.js'

  export let roomId

  const dispatch = createEventDispatcher()

  let name = ''
  let role = 'participant'
  let error = ''

  function submit() {
    const trimmed = name.trim().slice(0, 32)
    if (!trimmed) { error = $t('join.nameError'); return }
    dispatch('join', { name: trimmed, role })
  }

  function onKeydown(e) {
    if (e.key === 'Enter') submit()
  }
</script>

<div class="overlay" transition:fade={{ duration: 200 }}>
  <div class="modal" in:fly={{ y: 24, duration: 250 }}>
    <h2>{$t('join.title')}</h2>
    <p class="room-id">{$t('room.label')} <code>{roomId}</code></p>

    <label for="name-input">{$t('join.nameLabel')}</label>
    <input
      id="name-input"
      bind:value={name}
      on:keydown={onKeydown}
      placeholder={$t('join.namePlaceholder')}
      maxlength="32"
    />
    {#if error}
      <p class="error">{error}</p>
    {/if}

    <div class="role-toggle">
      <button
        class="role-btn"
        class:active={role === 'participant'}
        on:click={() => role = 'participant'}
      >
        {$t('join.participant')}
      </button>
      <button
        class="role-btn"
        class:active={role === 'observer'}
        on:click={() => role = 'observer'}
      >
        {$t('join.observer')}
      </button>
    </div>

    <button class="join-btn" on:click={submit}>{$t('join.btn')}</button>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 100;
  }

  .modal {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 2rem;
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  h2 { font-size: 1.4rem; font-weight: 700; }

  .room-id { font-size: 0.85rem; color: var(--text-muted); }
  code { font-family: monospace; color: var(--accent); }

  label { font-size: 0.9rem; font-weight: 600; color: var(--text-muted); }

  input {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 0.75rem 1rem;
    color: var(--text);
    font-size: 1rem;
    outline: none;
    transition: border-color 0.15s;
  }

  input:focus { border-color: var(--accent); }

  .error { color: var(--red); font-size: 0.85rem; }

  .role-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .role-btn {
    background: var(--bg-elevated);
    border: 2px solid transparent;
    border-radius: var(--radius-sm);
    padding: 0.6rem;
    color: var(--text-muted);
    font-size: 0.9rem;
    font-weight: 500;
    transition: border-color 0.15s, color 0.15s;
  }

  .role-btn.active {
    border-color: var(--accent);
    color: var(--text);
  }

  .join-btn {
    background: var(--accent);
    color: #fff;
    border-radius: var(--radius-sm);
    padding: 0.85rem;
    font-size: 1rem;
    font-weight: 600;
    transition: background 0.15s;
  }

  .join-btn:hover { background: var(--accent-hover); }
</style>
