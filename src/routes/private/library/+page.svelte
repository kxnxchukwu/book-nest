<script lang="ts">
	import { getUserState, type Book } from '$lib/state/user-state.svelte';
	import { BookCard } from '$components';

	let userContext = getUserState();
	let allBooks = $derived(userContext.allBooks ?? []);

	// Filter + sort state
	type StatusFilter = 'all' | 'reading' | 'unread' | 'finished';
	type SortOption = 'added' | 'title' | 'author' | 'rating';

	type ViewMode = 'grid' | 'list';
	let statusFilter = $state<StatusFilter>('all');
	let genreFilter = $state('all');
	let sortBy = $state<SortOption>('added');
	let searchQuery = $state('');
	let viewMode = $state<ViewMode>('grid');

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
		<div class="header-right">
			<span class="book-count">{filtered.length} book{filtered.length !== 1 ? 's' : ''}</span>
			<div class="view-toggle" role="group" aria-label="View mode">
				<button
					class="view-btn"
					class:active={viewMode === 'grid'}
					onclick={() => (viewMode = 'grid')}
					aria-label="Grid view"
				>
					<svg
						width="15"
						height="15"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
						<rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
					</svg>
				</button>
				<button
					class="view-btn"
					class:active={viewMode === 'list'}
					onclick={() => (viewMode = 'list')}
					aria-label="List view"
				>
					<svg
						width="15"
						height="15"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line
							x1="8"
							y1="18"
							x2="21"
							y2="18"
						/>
						<line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line
							x1="3"
							y1="18"
							x2="3.01"
							y2="18"
						/>
					</svg>
				</button>
			</div>
		</div>
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
		{#if viewMode === 'grid'}
			<div class="book-grid">
				{#each filtered as book (book.id)}
					<BookCard {book} />
				{/each}
			</div>
		{:else}
			<div class="book-list-view">
				<div class="list-header">
					<span class="col-cover"></span>
					<button
						class="col-title sortable"
						onclick={() => (sortBy = 'title')}
						class:sorted={sortBy === 'title'}>Title</button
					>
					<button
						class="col-author sortable"
						onclick={() => (sortBy = 'author')}
						class:sorted={sortBy === 'author'}>Author</button
					>
					<span class="col-genre">Genre</span>
					<button
						class="col-rating sortable"
						onclick={() => (sortBy = 'rating')}
						class:sorted={sortBy === 'rating'}>Rating</button
					>
					<span class="col-status">Status</span>
				</div>
				{#each filtered as book (book.id)}
					<a href="/private/books/{book.id}" class="list-row">
						<span class="col-cover">
							{#if book.cover_image}
								<img src={book.cover_image} alt="" class="list-cover" />
							{:else}
								<div class="list-cover-placeholder"></div>
							{/if}
						</span>
						<span class="col-title list-title">{book.title}</span>
						<span class="col-author list-author">{book.author ?? '—'}</span>
						<span class="col-genre list-genre">{book.genre ?? '—'}</span>
						<span class="col-rating list-rating">
							{#if book.rating}
								{'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
							{:else}
								<span class="no-rating">—</span>
							{/if}
						</span>
						<span class="col-status">
							<span
								class="status-pill status-{book.finished_reading_on
									? 'done'
									: book.started_reading_on
										? 'reading'
										: 'unread'}"
							>
								{book.finished_reading_on
									? 'Finished'
									: book.started_reading_on
										? 'Reading'
										: 'Unread'}
							</span>
						</span>
					</a>
				{/each}
			</div>
		{/if}
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

	/* Header right */
	.header-right {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	/* View toggle */
	.view-toggle {
		display: flex;
		border: 1.5px solid var(--border);
		border-radius: var(--r-md);
		overflow: hidden;
	}

	.view-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		color: var(--text-muted);
		background: transparent;
		transition:
			background 140ms ease,
			color 140ms ease;
		cursor: pointer;
	}
	.view-btn:hover {
		background: var(--bg-muted);
		color: var(--text);
	}
	.view-btn.active {
		background: var(--accent);
		color: var(--text-inv);
	}

	/* List view */
	.book-list-view {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border);
		border-radius: var(--r-lg);
		overflow: hidden;
		background: var(--bg-card);
	}

	.list-header,
	.list-row {
		display: grid;
		grid-template-columns: 44px 1fr 1fr 120px 90px 90px;
		align-items: center;
		gap: 0;
	}

	@media (max-width: 768px) {
		.list-header,
		.list-row {
			grid-template-columns: 44px 1fr 80px 70px;
		}
		.col-author,
		.col-genre {
			display: none;
		}
	}

	.list-header {
		padding: 8px 12px;
		background: var(--bg-muted);
		border-bottom: 1px solid var(--border);
	}

	.list-header span,
	.list-header button {
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		text-align: left;
		background: none;
		border: none;
		cursor: default;
		padding: 4px 8px;
	}

	.list-header .sortable {
		cursor: pointer;
		transition: color 140ms ease;
	}
	.list-header .sortable:hover {
		color: var(--text);
	}
	.list-header .sortable.sorted {
		color: var(--accent);
	}

	.list-row {
		padding: 8px 12px;
		border-bottom: 1px solid var(--border);
		text-decoration: none;
		transition: background 140ms ease;
	}
	.list-row:last-child {
		border-bottom: none;
	}
	.list-row:hover {
		background: var(--bg-muted);
	}

	.col-cover {
		padding: 4px 8px 4px 0;
	}

	.list-cover {
		width: 28px;
		height: 40px;
		object-fit: cover;
		border-radius: 2px;
		display: block;
		box-shadow: var(--shadow-sm);
	}

	.list-cover-placeholder {
		width: 28px;
		height: 40px;
		border-radius: 2px;
		background: var(--bg-muted);
	}

	.list-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text);
		padding: 0 8px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.list-author {
		font-size: 0.8rem;
		color: var(--text-muted);
		font-style: italic;
		padding: 0 8px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.list-genre {
		font-size: 0.78rem;
		color: var(--text-muted);
		padding: 0 8px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.list-rating {
		font-size: 0.75rem;
		letter-spacing: -1px;
		color: #d4a240;
		padding: 0 8px;
	}

	.no-rating {
		color: var(--text-muted);
		letter-spacing: 0;
	}

	.status-pill {
		display: inline-block;
		font-size: 0.68rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 2px 8px;
		border-radius: 99px;
	}

	.status-done {
		background: rgba(45, 106, 79, 0.12);
		color: #2d6a4f;
	}
	.status-reading {
		background: var(--accent-glow);
		color: var(--accent);
	}
	.status-unread {
		background: var(--bg-muted);
		color: var(--text-muted);
	}
</style>
