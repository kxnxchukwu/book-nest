<script lang="ts">
	import { getUserState, type ScannedBook } from '$lib/state/user-state.svelte';
	import {
		type OpenLibraryBook,
		getCoverUrl,
		inferGenre,
		getDescription,
		getIsbn,
		searchOpenLibrary
	} from '$lib/utils/open-library';

	interface Props {
		open: boolean;
		onclose: () => void;
	}

	let { open, onclose }: Props = $props();

	let userContext = getUserState();

	let query = $state('');
	let results = $state<OpenLibraryBook[]>([]);
	let isSearching = $state(false);
	let searchError = $state('');
	let isAdding = $state(false);
	let addedBookId = $state<string | null>(null);
	let debounceTimer: ReturnType<typeof setTimeout>;

	async function search(value: string) {
		if (value.trim().length < 2) {
			results = [];
			return;
		}
		isSearching = true;
		searchError = '';
		try {
			results = await searchOpenLibrary(value);
		} catch {
			searchError = 'Search failed. Check your connection and try again.';
			results = [];
		} finally {
			isSearching = false;
		}
	}

	function onInput(e: Event) {
		query = (e.target as HTMLInputElement).value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => search(query), 350);
	}

	async function addBook(book: OpenLibraryBook) {
		isAdding = true;
		addedBookId = book.key;

		const scannedBook: ScannedBook = {
			bookTitle: book.title,
			author: book.author_name?.[0] ?? 'Unknown',
			genre: inferGenre(book.subject) || undefined,
			description: getDescription(book) || undefined,
			isbn: getIsbn(book),
			cover_image: getCoverUrl(book)
		};

		try {
			await userContext.addBooksToLibrary([scannedBook]);
		} finally {
			isAdding = false;
			addedBookId = null;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}

	$effect(() => {
		if (!open) {
			query = '';
			results = [];
			searchError = '';
		}
	});
</script>

{#if open}
	<div
		class="backdrop"
		role="button"
		tabindex="-1"
		aria-label="Close modal"
		onclick={onclose}
		onkeydown={handleKeydown}
	></div>

	<div class="modal" role="dialog" aria-modal="true" aria-label="Add a book">
		<div class="modal-header">
			<h3>Add a book</h3>
			<button class="close-btn" onclick={onclose} aria-label="Close">
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>
		</div>

		<div class="modal-body">
			<div class="search-wrap">
				<svg
					class="search-icon"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
				<input
					type="text"
					placeholder="Search by title or author…"
					value={query}
					oninput={onInput}
					autofocus
					class="search-input"
				/>
				{#if isSearching}
					<div class="search-spinner"></div>
				{/if}
			</div>

			<div class="or-scan">
				<span>or</span>
				<a href="/private/scan-shelf" onclick={onclose}>scan your shelf</a>
			</div>

			{#if searchError}
				<p class="search-error">{searchError}</p>
			{/if}

			{#if results.length > 0}
				<ul class="results">
					{#each results as book (book.key)}
						{@const cover = getCoverUrl(book)}
						{@const isThisAdding = isAdding && addedBookId === book.key}
						<li class="result-item">
							<div class="result-cover">
								{#if cover}
									<img src={cover} alt={book.title} />
								{:else}
									<div class="result-cover-placeholder">
										<svg
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="1.5"
										>
											<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path
												d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
											/>
										</svg>
									</div>
								{/if}
							</div>
							<div class="result-info">
								<p class="result-title">{book.title}</p>
								{#if book.author_name?.[0]}
									<p class="result-author">{book.author_name[0]}</p>
								{/if}
								{#if book.first_publish_year}
									<p class="result-year">{book.first_publish_year}</p>
								{/if}
							</div>
							<button
								class="add-btn"
								onclick={() => addBook(book)}
								disabled={isAdding}
								aria-label="Add {book.title}"
							>
								{#if isThisAdding}
									<div class="add-spinner"></div>
								{:else}
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
									>
										<line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
									</svg>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			{:else if query.length >= 2 && !isSearching && !searchError}
				<div class="no-results">
					<p>No books found for "<strong>{query}</strong>"</p>
					<p class="small-font">Try a different title or author name</p>
				</div>
			{:else if query.length === 0}
				<div class="empty-prompt">
					<svg
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.2"
						opacity="0.35"
					>
						<circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
					</svg>
					<p>Search the Open Library catalogue</p>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.45);
		z-index: 200;
		backdrop-filter: blur(2px);
		cursor: pointer;
		border: none;
	}

	.modal {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 201;
		background: var(--bg-card);
		border-radius: var(--r-xl) var(--r-xl) 0 0;
		max-height: 85dvh;
		display: flex;
		flex-direction: column;
		box-shadow: var(--shadow-lg);
		animation: slide-up 220ms cubic-bezier(0.32, 0.72, 0, 1);
	}

	@media (min-width: 640px) {
		.modal {
			top: 50%;
			bottom: auto;
			left: 50%;
			right: auto;
			transform: translate(-50%, -50%);
			width: min(520px, 95vw);
			max-height: 80dvh;
			border-radius: var(--r-xl);
			animation: fade-scale 200ms cubic-bezier(0.32, 0.72, 0, 1);
		}
	}

	@keyframes slide-up {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	@keyframes fade-scale {
		from {
			opacity: 0;
			transform: translate(-50%, -48%) scale(0.97);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 20px 0;
		flex-shrink: 0;
	}

	.modal-header h3 {
		font-size: 1.2rem;
		font-weight: 500;
	}

	.close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: var(--r-md);
		color: var(--text-muted);
		transition:
			background 160ms ease,
			color 160ms ease;
	}

	.close-btn:hover {
		background: var(--bg-muted);
		color: var(--text);
	}

	.modal-body {
		padding: 16px 20px 24px;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 12px;
		flex: 1;
		min-height: 0;
	}

	.search-wrap {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: 12px;
		color: var(--text-muted);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding-left: 38px !important;
		padding-right: 38px !important;
		font-size: 0.95rem;
	}

	.search-spinner,
	.add-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid var(--border);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
		flex-shrink: 0;
	}

	.search-spinner {
		position: absolute;
		right: 12px;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.or-scan {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.or-scan a {
		color: var(--accent);
		font-weight: 500;
		border-bottom: 1px solid currentColor;
		padding-bottom: 1px;
	}

	.search-error {
		font-size: 0.85rem;
		color: var(--danger);
		background: rgba(155, 41, 41, 0.08);
		border: 1px solid rgba(155, 41, 41, 0.2);
		border-radius: var(--r-md);
		padding: 9px 12px;
	}

	.results {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.result-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 8px;
		border-radius: var(--r-md);
		transition: background 140ms ease;
	}

	.result-item:hover {
		background: var(--bg-muted);
	}

	.result-cover {
		flex-shrink: 0;
		width: 38px;
		height: 54px;
		border-radius: 3px;
		overflow: hidden;
	}

	.result-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.result-cover-placeholder {
		width: 100%;
		height: 100%;
		background: var(--bg-muted);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-muted);
	}

	.result-info {
		flex: 1;
		min-width: 0;
	}

	.result-title {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin: 0;
	}

	.result-author {
		font-size: 0.78rem;
		color: var(--text-muted);
		font-style: italic;
		margin: 2px 0 0;
	}
	.result-year {
		font-size: 0.72rem;
		color: var(--text-muted);
		margin: 2px 0 0;
	}

	.add-btn {
		flex-shrink: 0;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--accent);
		color: var(--text-inv);
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			filter 160ms ease,
			transform 100ms ease;
	}

	.add-btn:hover:not(:disabled) {
		filter: brightness(1.12);
		transform: scale(1.08);
	}
	.add-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.empty-prompt,
	.no-results {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 32px 16px;
		text-align: center;
		color: var(--text-muted);
	}

	.empty-prompt p,
	.no-results p {
		font-size: 0.9rem;
		margin: 0;
	}
</style>
