<script>
  import Router from 'svelte-spa-router'
  import Home from './pages/Home.svelte'
  import Room from './pages/Room.svelte'
  import { lang } from './lib/i18n.js'

  const routes = {
    '/': Home,
    '/room/:id': Room
  }
</script>

<Router {routes} />

<div class="lang-switcher">
  <button class:active={$lang === 'de'} on:click={() => lang.set('de')}>DE</button>
  <span class="sep">|</span>
  <button class:active={$lang === 'en'} on:click={() => lang.set('en')}>EN</button>
</div>

<style>
  .lang-switcher {
    position: fixed;
    top: 1rem;
    right: 1rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    z-index: 200;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 0.3rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
  }

  button {
    background: none;
    border: none;
    color: var(--text-muted);
    padding: 0 0.1rem;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 600;
    transition: color 0.15s;
  }

  button.active {
    color: var(--accent);
  }

  button:hover:not(.active) {
    color: var(--text);
  }

  .sep {
    color: var(--border);
    user-select: none;
  }
</style>
