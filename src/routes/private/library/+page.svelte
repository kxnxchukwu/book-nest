<script lang="ts">
	import { getUserState, type Book } from '$lib/state/user-state.svelte';
	import { BookCard } from '$components';

	let userContext = getUserState();
	let allBooks = $derived(userContext.allBooks ?? []);

	// Filter + sort state
	type StatusFilter = 'all' | 'reading' | 'unread' | 'finished';
	type SortOption = 'added' | 'title' | 'author' | 'rating';

	let statusFilter = $state<StatusFilter>('all');
	let genreFilter = $state('all');
	let sortBy = $state<SortOption>('added');
	let searchQuery = $state('');

	// Derive unique genres from library
	let genres = $derived([
		'all',
		...new Set(
			allBooks.flatMap((b) => b.genre?.split(',').map((g) => g.trim()) ?? []).filter(Boolean)
		)
	]);

	// Apply filters + sort
	let filtered = $derived.by(() => {
		let books: Book[] = [...allBooks];

		// Status
		if (statusFilter === 'reading')
			books = books.filter((b) => b.started_reading_on && !b.finished_reading_on);
		if (statusFilter === 'unread') books = books.filter((b) => !b.started_reading_on);
		if (statusFilter === 'finished') books = books.filter((b) => Boolean(b.finished_reading_on));

		// Genre
		if (genreFilter !== 'all') {
			books = books.filter((b) =>
				b.genre
					?.split(',')
					.map((g) => g.trim())
					.includes(genreFilter)
			);
		}

		// Search
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			books = books.filter(
				(b) => b.title.toLowerCase().includes(q) || (b.author ?? '').toLowerCase().includes(q)
			);
		}

		// Sort
		if (sortBy === 'title') books.sort((a, b) => a.title.localeCompare(b.title));
		if (sortBy === 'author') books.sort((a, b) => (a.author ?? '').localeCompare(b.author ?? ''));
		if (sortBy === 'rating') books.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
		if (sortBy === 'added')
			books.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));

		return books;
	});

	function clearFilters() {
		statusFilter = 'all';
		genreFilter = 'all';
		sortBy = 'added';
		searchQuery = '';
	}

	let hasActiveFilters = $derived(
		statusFilter !== 'all' ||
			genreFilter !== 'all' ||
			sortBy !== 'added' ||
			searchQuery.trim() !== ''
	);
</script>

<div class="library-page">
	<div class="library-header">
		<div>
			<h5>Your collection</h5>
			<h2>Library</h2>
		</div>
		<span class="book-count">{filtered.length} book{filtered.length !== 1 ? 's' : ''}</span>
	</div>

	<!-- Search + filters -->
	<div class="filters">
		<!-- Search -->
		<div class="search-wrap">
			<svg
				class="search-icon"
				width="15"
				height="15"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
			</svg>
			<input
				type="text"
				placeholder="Search title or author…"
				bind:value={searchQuery}
				class="search-input"
			/>
		</div>

		<div class="filter-row">
			<!-- Status pills -->
			<div class="pill-group" role="group" aria-label="Filter by status">
				{#each ['all', 'reading', 'unread', 'finished'] as StatusFilter[] as status}
					<button
						class="pill"
						class:active={statusFilter === status}
						onclick={() => (statusFilter = status)}
					>
						{status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
					</button>
				{/each}
			</div>

			<div class="selects">
				<!-- Genre -->
				{#if genres.length > 2}
					<select bind:value={genreFilter} aria-label="Filter by genre">
						{#each genres as genre}
							<option value={genre}>{genre === 'all' ? 'All genres' : genre}</option>
						{/each}
					</select>
				{/if}

				<!-- Sort -->
				<select bind:value={sortBy} aria-label="Sort books">
					<option value="added">Date added</option>
					<option value="title">Title A–Z</option>
					<option value="author">Author A–Z</option>
					<option value="rating">Top rated</option>
				</select>
			</div>
		</div>

		{#if hasActiveFilters}
			<button class="clear-btn" onclick={clearFilters}> Clear filters </button>
		{/if}
	</div>

	<!-- Grid -->
	{#if filtered.length > 0}
		<div class="book-grid">
			{#each filtered as book (book.id)}
				<BookCard {book} />
			{/each}
		</div>
	{:else if allBooks.length === 0}
		<div class="empty-state">
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
			<h3>Your library is empty</h3>
			<p>Go to the dashboard to add your first book.</p>
		</div>
	{:else}
		<div class="empty-state">
			<svg
				width="40"
				height="40"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.2"
			>
				<circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
			</svg>
			<h3>No books match</h3>
			<p>Try adjusting your filters.</p>
			<button class="clear-btn" onclick={clearFilters}>Clear filters</button>
		</div>
	{/if}
</div>

<style>
	.library-page {
		width: 100%;
	}

	.library-header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		margin-bottom: 24px;
		flex-wrap: wrap;
		gap: 8px;
	}

	.library-header h2 {
		font-size: clamp(1.5rem, 3vw, 2.2rem);
	}

	.book-count {
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		padding-bottom: 6px;
	}

	/* Filters */
	.filters {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-bottom: 28px;
	}

	.search-wrap {
		position: relative;
		display: flex;
		align-items: center;
		max-width: 360px;
	}

	.search-icon {
		position: absolute;
		left: 12px;
		color: var(--text-muted);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding-left: 36px !important;
		font-size: 0.875rem;
		height: 38px;
		min-height: unset;
	}

	.filter-row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 10px;
	}

	/* Status pills */
	.pill-group {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.pill {
		padding: 5px 14px;
		border-radius: 99px;
		font-size: 0.8rem;
		font-weight: 500;
		border: 1.5px solid var(--border);
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
		transition: all 140ms ease;
		white-space: nowrap;
	}

	.pill:hover {
		border-color: var(--border-strong);
		color: var(--text);
	}

	.pill.active {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--text-inv);
	}

	/* Selects */
	.selects {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	select {
		font-family: 'DM Sans', sans-serif;
		font-size: 0.8rem;
		font-weight: 500;
		padding: 5px 28px 5px 10px;
		border-radius: 99px;
		border: 1.5px solid var(--border);
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b6560' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 10px center;
		transition:
			border-color 140ms ease,
			color 140ms ease;
		height: 32px;
		min-height: unset;
	}

	select:hover {
		border-color: var(--border-strong);
		color: var(--text);
	}
	select:focus {
		border-color: var(--accent);
		outline: none;
		box-shadow: 0 0 0 3px var(--accent-glow);
	}

	/* Clear */
	.clear-btn {
		font-size: 0.78rem;
		font-weight: 500;
		color: var(--accent);
		text-decoration: underline;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		width: fit-content;
	}

	/* Book grid */
	.book-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 16px;
	}

	/* Override BookCard width for grid */
	.book-grid :global(.book-card) {
		width: 100%;
		min-width: unset;
	}

	/* Empty state */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 10px;
		padding: 80px 24px;
		color: var(--text-muted);
	}

	.empty-state h3 {
		font-size: 1.3rem;
		color: var(--text);
	}
	.empty-state p {
		font-size: 0.9rem;
		max-width: 260px;
	}
</style>
