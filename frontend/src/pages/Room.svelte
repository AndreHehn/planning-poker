<script>
  import { onMount, onDestroy } from 'svelte'
  import { roomState, connect, disconnect, send } from '../lib/ws.js'
  import { loadSession, saveSession } from '../lib/storage.js'
  import { t } from '../lib/i18n.js'
  import { fly } from 'svelte/transition'
  import JoinModal from '../components/JoinModal.svelte'
  import PlayerList from '../components/PlayerList.svelte'
  import CardGrid from '../components/CardGrid.svelte'
  import RevealButton from '../components/RevealButton.svelte'
  import ResultsView from '../components/ResultsView.svelte'

  export let params = {}

  const roomId = params.id

  let session = null
  let myUserId = null
  let showModal = true

  $: state = $roomState

  $: if (state && !state.expired && !state.notFound && !myUserId) {
    const me = state.users.find(u => u.name.toLowerCase() === session?.name?.toLowerCase())
    if (me) myUserId = me.id
  }

  $: me = state?.users?.find(u => u.id === myUserId) ?? null
  $: myVote = me?.vote ?? null
  $: myRole = me?.role ?? session?.role ?? 'participant'

  $: participants = state?.users?.filter(u => u.role === 'participant') ?? []
  $: voteCount = participants.filter(u => u.voted).length

  onMount(() => {
    session = loadSession(roomId)
    if (session) {
      showModal = false
      connect(roomId, session.name, session.role)
    }
  })

  onDestroy(() => {
    disconnect()
  })

  function handleJoin(e) {
    const { name, role } = e.detail
    session = { name, role }
    saveSession(roomId, session)
    showModal = false
    connect(roomId, name, role)
  }

  function toggleRole() {
    const newRole = myRole === 'observer' ? 'participant' : 'observer'
    send({ type: 'changeRole', role: newRole })
    if (session) {
      session = { ...session, role: newRole }
      saveSession(roomId, session)
    }
  }
</script>

{#if !state}
  {#if showModal}
    <JoinModal {roomId} on:join={handleJoin} />
  {:else}
    <div class="loading">{$t('room.connecting')}</div>
  {/if}

{:else if state.notFound}
  <div class="error-page">
    <h2>{$t('room.notFound')}</h2>
    <p>{$t('room.notFoundDesc')}</p>
    <a href="/">{$t('room.backHome')}</a>
  </div>

{:else if state.full}
  <div class="error-page">
    <h2>{$t('room.full')}</h2>
    <p>{$t('room.fullDesc')}</p>
    <a href="/">{$t('room.backHome')}</a>
  </div>

{:else if state.expired}
  <div class="error-page">
    <h2>{$t('room.expired')}</h2>
    <p>{$t('room.expiredDesc')}</p>
    <a href="/">{$t('room.newRoom')}</a>
  </div>

{:else}
  <div class="room">
    <header>
      <div class="room-info">
        <span class="scale-tag">{state.scaleName}</span>
        <span class="room-id-label">{$t('room.label')} <code>{roomId}</code></span>
      </div>
      {#if me}
        <button class="role-toggle-btn" on:click={toggleRole}>
          {myRole === 'observer' ? $t('room.toParticipant') : $t('room.toObserver')}
        </button>
      {/if}
    </header>

    <section class="players">
      <PlayerList users={state.users} revealed={state.revealed} currentUserId={myUserId} />
    </section>

    {#if state.revealed}
      <div in:fly={{ y: 16, duration: 300 }}>
        <ResultsView users={state.users} />
      </div>
    {/if}

    {#if myRole !== 'observer' && !state.revealed}
      <section class="voting">
        <CardGrid
          scale={state.scale}
          myVote={myVote}
          revealed={state.revealed}
          role={myRole}
        />
      </section>
    {/if}

    <RevealButton
      revealed={state.revealed}
      voteCount={voteCount}
      totalParticipants={participants.length}
    />
  </div>
{/if}

<style>
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    color: var(--text-muted);
  }

  .error-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    gap: 1rem;
    text-align: center;
    padding: 2rem;
  }

  .error-page h2 { font-size: 1.5rem; font-weight: 700; }
  .error-page p  { color: var(--text-muted); }
  .error-page a  { color: var(--accent); text-decoration: none; }
  .error-page a:hover { text-decoration: underline; }

  .room {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .room-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .scale-tag {
    background: rgba(var(--accent-rgb), 0.15);
    color: var(--accent);
    border-radius: 6px;
    padding: 0.2rem 0.6rem;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .room-id-label {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  code { font-family: monospace; color: var(--text); }

  .role-toggle-btn {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-muted);
    border-radius: var(--radius-sm);
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
    transition: border-color 0.15s, color 0.15s;
  }

  .role-toggle-btn:hover {
    border-color: var(--accent);
    color: var(--text);
  }

  .voting {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
