<script lang="ts">
	import { BookCategory, AddBookModal, ReadingCalendar } from '$components';
	import { getUserState } from '$lib/state/user-state.svelte';
	import Icon from '@iconify/svelte';

	let userContext = getUserState();

	let userName = $derived(userContext.userName);
	let allBooks = $derived(userContext.allBooks ?? []);
	let modalOpen = $state(false);
</script>

<div class="dashboard">
	<!-- Welcome header -->
	<div class="dash-header">
		<div class="dash-welcome">
			<h5>Your library</h5>
			{#if userName}
				<h2>Welcome back, <em>{userName.split(' ')[0]}</em></h2>
			{:else}
				<h2>Welcome back</h2>
			{/if}
		</div>
		<button class="add-book-btn" onclick={() => (modalOpen = true)}>
			<Icon icon="icons8:plus" width="18" />
			<span>Add a book</span>
		</button>
	</div>

	<!-- Stats row -->
	{#if allBooks.length > 0}
		<div class="stats-row">
			<div class="stat-chip">
				<span class="stat-number">{allBooks.length}</span>
				<span class="stat-label">In library</span>
			</div>
			<div class="stat-chip">
				<span class="stat-number">{allBooks.filter((b) => b.finished_reading_on).length}</span>
				<span class="stat-label">Finished</span>
			</div>
			<div class="stat-chip">
				<span class="stat-number"
					>{allBooks.filter((b) => b.started_reading_on && !b.finished_reading_on).length}</span
				>
				<span class="stat-label">Reading</span>
			</div>
		</div>
	{/if}

	<!-- Reading calendar -->
	{#if allBooks.length}
		<div class="calendar-section mb-m">
			<h5 class="mb-s">Reading activity</h5>
			<ReadingCalendar />
		</div>
	{/if}

	<!-- Book categories -->
	{#if allBooks.length}
		{#if userContext.getStartedBooks().length}
			<BookCategory
				booksToDisplay={userContext.getStartedBooks()}
				categoryName="Currently reading"
			/>
		{/if}
		{#if userContext.getHighestRatedBooks().length}
			<BookCategory
				booksToDisplay={userContext.getHighestRatedBooks()}
				categoryName="Your favorite books"
			/>
		{/if}
		<BookCategory
			booksToDisplay={userContext.getUnreadBooks()}
			categoryName="Recently added, unread"
		/>
		{#if userContext.getFavoriteGenre()}
			<BookCategory
				booksToDisplay={userContext.getBooksFromFavoriteGenre()}
				categoryName={`From your favorite genre · ${userContext.getFavoriteGenre()}`}
			/>
		{/if}
		<a href="/private/library" class="view-all-link">
			View all {allBooks.length} books →
		</a>
	{:else}
		<div class="empty-state">
			<div class="empty-icon">
				<svg
					width="48"
					height="48"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.2"
				>
					<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path
						d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
					/>
				</svg>
			</div>
			<h3>Your library is empty</h3>
			<p>Start adding books to track what you read and love.</p>
			<a href="/private/scan-shelf" class="empty-cta">
				<Icon icon="icons8:plus" width="18" />
				Add your first book
			</a>
		</div>
	{/if}
</div>

<AddBookModal open={modalOpen} onclose={() => (modalOpen = false)} />

<style>
	.dashboard {
		width: 100%;
	}

	.dash-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 16px;
		margin-bottom: 24px;
	}

	.dash-welcome h2 {
		font-size: clamp(1.5rem, 3.5vw, 2.2rem);
		line-height: 1.2;
	}

	.dash-welcome h2 em {
		font-style: italic;
		color: var(--accent-mid);
	}

	.add-book-btn {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		padding: 9px 18px;
		background: var(--accent);
		color: var(--text-inv);
		border-radius: var(--r-md);
		font-size: 0.875rem;
		font-weight: 500;
		transition:
			filter 160ms ease,
			transform 100ms ease;
		flex-shrink: 0;
	}

	.add-book-btn:hover {
		filter: brightness(1.1);
		transform: translateY(-1px);
	}

	/* Stats */
	.stats-row {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
		margin-bottom: 36px;
	}

	.stat-chip {
		display: flex;
		flex-direction: column;
		padding: 14px 20px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--r-lg);
		min-width: 90px;
		box-shadow: var(--shadow-sm);
	}

	.stat-number {
		font-family: 'Fraunces', serif;
		font-size: 1.8rem;
		font-weight: 500;
		line-height: 1;
		color: var(--text);
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--text-muted);
		margin-top: 4px;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Empty state */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 80px 24px;
		gap: 12px;
	}

	.empty-icon {
		width: 80px;
		height: 80px;
		background: var(--bg-muted);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-muted);
		margin-bottom: 8px;
	}

	.empty-state h3 {
		font-size: 1.4rem;
	}
	.empty-state p {
		color: var(--text-muted);
		max-width: 300px;
	}

	.empty-cta {
		margin-top: 8px;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 11px 22px;
		background: var(--accent);
		color: var(--text-inv);
		border-radius: var(--r-md);
		font-size: 0.9rem;
		font-weight: 500;
		transition: filter 160ms ease;
	}

	.empty-cta:hover {
		filter: brightness(1.1);
	}
	.view-all-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--accent);
		text-decoration: none;
		margin-top: 8px;
		padding: 6px 0;
		border-bottom: 1px solid transparent;
		transition: border-color 160ms ease;
	}
	.view-all-link:hover {
		border-bottom-color: var(--accent);
	}
</style>
