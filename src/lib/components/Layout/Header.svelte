<script lang="ts">
	import bookNestLogo from '$assets/app-logo.svg';
	import Button from '$components/Button.svelte';
	import { getUserState } from '$lib/state/user-state.svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	let userContext = getUserState();
	let user = $derived(userContext.user);
	let userName = $derived(userContext.userName);

	// Dark mode
	let isDark = $state(false);
	$effect(() => {
		if (!browser) return;
		const saved = localStorage.getItem('theme');
		isDark = saved === 'dark';
		document.documentElement.setAttribute('data-theme', isDark ? 'dark' : '');
	});
	function toggleTheme() {
		isDark = !isDark;
		if (browser) {
			document.documentElement.setAttribute('data-theme', isDark ? 'dark' : '');
			localStorage.setItem('theme', isDark ? 'dark' : 'light');
		}
	}

	// Global search
	let searchOpen = $state(false);
	let searchQuery = $state('');
	let allBooks = $derived(userContext.allBooks ?? []);

	let searchResults = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		if (q.length < 2) return [];
		return allBooks
			.filter(
				(b) => b.title.toLowerCase().includes(q) || (b.author ?? '').toLowerCase().includes(q)
			)
			.slice(0, 6);
	});

	function openSearch() {
		searchOpen = true;
		searchQuery = '';
	}

	function closeSearch() {
		searchOpen = false;
		searchQuery = '';
	}

	function handleSearchKey(e: KeyboardEvent) {
		if (e.key === 'Escape') closeSearch();
	}

	function goToBook(id: number) {
		closeSearch();
		goto(`/private/books/${id}`);
	}

	function handleGlobalKey(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			if (user) searchOpen ? closeSearch() : openSearch();
		}
	}
</script>

<svelte:window onkeydown={handleGlobalKey} />

<header>
	<a class="logo-link" href={user ? '/private/dashboard' : '/'} aria-label="Book Nest home">
		<img class="logo" src={bookNestLogo} alt="Book Nest logo" />
		<span class="logo-text">Book Nest</span>
	</a>

	<div class="header-right">
		<!-- Search trigger (only when logged in) -->
		{#if user}
			<button class="search-trigger" onclick={openSearch} aria-label="Search books">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
				<span class="search-trigger-label">Search</span>
				<kbd>⌘K</kbd>
			</button>
		{/if}

		<button class="theme-toggle" onclick={toggleTheme} aria-label="Toggle dark mode">
			{#if isDark}
				<svg
					width="17"
					height="17"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="5" />
					<line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
					<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line
						x1="18.36"
						y1="18.36"
						x2="19.78"
						y2="19.78"
					/>
					<line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
					<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line
						x1="18.36"
						y1="5.64"
						x2="19.78"
						y2="4.22"
					/>
				</svg>
			{:else}
				<svg
					width="17"
					height="17"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
				</svg>
			{/if}
		</button>

		<nav>
			{#if !user}
				<ul>
					<li><Button isMenu href="/register">Sign up</Button></li>
					<li><Button isMenu isSecondary href="/login">Login</Button></li>
				</ul>
			{:else}
				<ul>
					{#if userName}
						<li class="user-name">{userName}</li>
					{/if}
					<li><Button isMenu isSecondary onclick={() => userContext.logout()}>Logout</Button></li>
				</ul>
			{/if}
		</nav>
	</div>
</header>

<!-- Search overlay -->
{#if searchOpen}
	<div
		class="search-backdrop"
		role="button"
		tabindex="-1"
		aria-label="Close search"
		onclick={closeSearch}
		onkeydown={handleSearchKey}
	></div>

	<div class="search-modal" role="dialog" aria-label="Search your library">
		<div class="search-input-wrap">
			<svg
				width="17"
				height="17"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				class="search-modal-icon"
			>
				<circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
			</svg>
			<input
				type="text"
				placeholder="Search your library…"
				bind:value={searchQuery}
				onkeydown={handleSearchKey}
				autofocus
				class="search-modal-input"
				aria-label="Search books"
			/>
			<button class="search-esc" onclick={closeSearch}>Esc</button>
		</div>

		{#if searchResults.length > 0}
			<ul class="search-results">
				{#each searchResults as book (book.id)}
					<li>
						<button class="search-result" onclick={() => goToBook(book.id)}>
							{#if book.cover_image}
								<img src={book.cover_image} alt="" class="result-cover" />
							{:else}
								<div class="result-cover-placeholder">
									<svg
										width="12"
										height="12"
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
							<div class="result-text">
								<span class="result-title">{book.title}</span>
								{#if book.author}
									<span class="result-author">{book.author}</span>
								{/if}
							</div>
							<span class="result-status">
								{book.finished_reading_on
									? 'Finished'
									: book.started_reading_on
										? 'Reading'
										: 'Unread'}
							</span>
						</button>
					</li>
				{/each}
			</ul>
		{:else if searchQuery.length >= 2}
			<p class="search-empty">No books found for "<strong>{searchQuery}</strong>"</p>
		{:else}
			<p class="search-hint">Type to search by title or author</p>
		{/if}
	</div>
{/if}

<style>
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 clamp(1rem, 4vw, 2.5rem);
		height: 64px;
		background: var(--bg);
		border-bottom: 1px solid var(--border);
		position: sticky;
		top: 0;
		z-index: 100;
		transition:
			background-color 160ms ease,
			border-color 160ms ease;
	}

	.logo-link {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
	}
	.logo {
		height: 36px;
		width: auto;
	}
	.logo-text {
		font-family: 'Fraunces', serif;
		font-size: 1.15rem;
		font-weight: 500;
		color: var(--text);
		display: none;
	}
	@media (min-width: 480px) {
		.logo-text {
			display: block;
		}
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	/* Search trigger */
	.search-trigger {
		display: none;
		align-items: center;
		gap: 8px;
		padding: 6px 12px;
		border-radius: var(--r-md);
		border: 1.5px solid var(--border);
		background: var(--bg-subtle);
		color: var(--text-muted);
		font-size: 0.8rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			border-color 160ms ease,
			color 160ms ease;
	}
	@media (min-width: 600px) {
		.search-trigger {
			display: flex;
		}
	}
	.search-trigger:hover {
		border-color: var(--border-strong);
		color: var(--text);
	}

	.search-trigger-label {
		display: none;
	}
	@media (min-width: 760px) {
		.search-trigger-label {
			display: block;
		}
	}

	kbd {
		font-family: inherit;
		font-size: 0.7rem;
		padding: 1px 5px;
		border-radius: 4px;
		background: var(--bg-muted);
		border: 1px solid var(--border);
		display: none;
	}
	@media (min-width: 900px) {
		kbd {
			display: inline;
		}
	}

	/* Theme toggle */
	.theme-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: var(--r-md);
		color: var(--text-muted);
		background: var(--bg-subtle);
		border: 1.5px solid var(--border);
		cursor: pointer;
		transition:
			color 160ms ease,
			background 160ms ease,
			border-color 160ms ease;
		flex-shrink: 0;
	}
	.theme-toggle:hover {
		color: var(--text);
		background: var(--bg-muted);
		border-color: var(--border-strong);
	}

	nav ul {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.user-name {
		font-size: 0.875rem;
		color: var(--text-muted);
		font-weight: 500;
		display: none;
		padding: 0 4px;
	}
	@media (min-width: 560px) {
		.user-name {
			display: block;
		}
	}

	/* Search overlay */
	.search-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 300;
		backdrop-filter: blur(2px);
		cursor: pointer;
		border: none;
	}

	.search-modal {
		position: fixed;
		top: 80px;
		left: 50%;
		transform: translateX(-50%);
		width: min(580px, 95vw);
		background: var(--bg-card);
		border-radius: var(--r-xl);
		box-shadow: var(--shadow-lg);
		z-index: 301;
		overflow: hidden;
		border: 1px solid var(--border);
		animation: search-in 180ms cubic-bezier(0.32, 0.72, 0, 1);
	}

	@keyframes search-in {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(-8px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0) scale(1);
		}
	}

	.search-input-wrap {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 14px 16px;
		border-bottom: 1px solid var(--border);
	}

	.search-modal-icon {
		color: var(--text-muted);
		flex-shrink: 0;
	}

	.search-modal-input {
		flex: 1;
		font-size: 1rem;
		background: transparent;
		border: none;
		outline: none;
		color: var(--text);
		min-height: unset;
		padding: 0;
		box-shadow: none;
	}

	.search-esc {
		font-size: 0.7rem;
		padding: 2px 6px;
		border-radius: 4px;
		background: var(--bg-muted);
		border: 1px solid var(--border);
		color: var(--text-muted);
		font-family: inherit;
		cursor: pointer;
	}

	.search-results {
		padding: 8px;
	}

	.search-result {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		padding: 9px 10px;
		border-radius: var(--r-md);
		text-align: left;
		transition: background 140ms ease;
		cursor: pointer;
	}
	.search-result:hover {
		background: var(--bg-muted);
	}

	.result-cover {
		width: 32px;
		height: 46px;
		border-radius: 3px;
		object-fit: cover;
		flex-shrink: 0;
		box-shadow: var(--shadow-sm);
	}

	.result-cover-placeholder {
		width: 32px;
		height: 46px;
		border-radius: 3px;
		background: var(--bg-muted);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-muted);
		flex-shrink: 0;
	}

	.result-text {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.result-title {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.result-author {
		font-size: 0.78rem;
		color: var(--text-muted);
		font-style: italic;
	}

	.result-status {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
		flex-shrink: 0;
	}

	.search-hint,
	.search-empty {
		padding: 20px 16px;
		font-size: 0.875rem;
		color: var(--text-muted);
		text-align: center;
	}
</style>
