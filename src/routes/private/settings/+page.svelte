<script lang="ts">
	import { Button } from '$components';
	import { getUserState } from '$lib/state/user-state.svelte';

	let userContext = getUserState();

	// Access reactive class properties directly — never destructure
	let userName = $state(userContext.userName || '');
	let email = $state(userContext.user?.email || '');
	let isEditMode = $state(false);

	let averageRating = $derived.by(() => {
		const booksWithRating = userContext.allBooks.filter((book) => book.rating);
		if (booksWithRating.length === 0) return null;
		const sum = booksWithRating.reduce((acc, book) => acc + book.rating!, 0);
		return Math.round(100 * (sum / booksWithRating.length)) / 100;
	});

	$effect(() => {
		if (userContext.userName) userName = userContext.userName;
		if (userContext.user?.email) email = userContext.user.email;
	});

	async function toggleEditModeAndSaveToDatabase() {
		if (isEditMode) await userContext.updateAccountData(email, userName);
		isEditMode = !isEditMode;
	}

	async function deleteAccount() {
		const confirmDelete = window.confirm(
			'Are you sure you want to delete your account? This action cannot be undone and removes all your data.'
		);
		if (confirmDelete) await userContext.deleteAccount();
	}

	let finishedCount = $derived(
		userContext.allBooks.filter((b) => Boolean(b.finished_reading_on)).length
	);
	let readingCount = $derived(
		userContext.allBooks.filter((b) => b.started_reading_on && !b.finished_reading_on).length
	);
</script>

<div class="settings-page">
	<h2 class="page-title">Settings</h2>

	<div class="settings-grid">
		<!-- Profile card -->
		<div class="card profile-card">
			<h5>Profile</h5>

			<div class="field-group">
				<div class="field">
					<label for="s-name">Display name</label>
					{#if isEditMode}
						<input id="s-name" type="text" name="userName" bind:value={userName} />
					{:else}
						<p class="field-value">{userName || '—'}</p>
					{/if}
				</div>

				<div class="field">
					<label for="s-email">Email address</label>
					{#if isEditMode}
						<input id="s-email" type="email" name="email" bind:value={email} />
					{:else}
						<p class="field-value">{email || '—'}</p>
					{/if}
				</div>
			</div>

			<div class="card-actions">
				<Button isSecondary onclick={toggleEditModeAndSaveToDatabase}>
					{isEditMode ? 'Save changes' : 'Edit profile'}
				</Button>
			</div>
		</div>

		<!-- Stats card -->
		<div class="card stats-card">
			<h5>Library stats</h5>

			<div class="stats-list">
				<div class="stat-row">
					<span class="stat-label">Books in library</span>
					<span class="stat-val">{userContext.allBooks.length}</span>
				</div>
				<div class="stat-row">
					<span class="stat-label">Finished</span>
					<span class="stat-val">{finishedCount}</span>
				</div>
				<div class="stat-row">
					<span class="stat-label">Currently reading</span>
					<span class="stat-val">{readingCount}</span>
				</div>
				<div class="stat-row">
					<span class="stat-label">Average rating</span>
					<span class="stat-val">{averageRating != null ? averageRating + ' ★' : '—'}</span>
				</div>
			</div>
		</div>

		<!-- Danger zone -->
		<div class="card danger-card">
			<h5>Danger zone</h5>
			<p class="danger-desc">
				Permanently delete your account and all associated data. This cannot be undone.
			</p>
			<Button isDanger onclick={deleteAccount}>Delete account</Button>
		</div>
	</div>
</div>

<style>
	.settings-page {
		width: 100%;
	}

	.page-title {
		margin-bottom: 28px;
		font-size: clamp(1.5rem, 3vw, 2rem);
	}

	.settings-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		max-width: 780px;
	}

	@media (max-width: 600px) {
		.settings-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Cards */
	.card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--r-lg);
		padding: 24px;
		box-shadow: var(--shadow-sm);
		display: flex;
		flex-direction: column;
		gap: 16px;
		transition:
			background-color 160ms ease,
			border-color 160ms ease;
	}

	.profile-card {
		grid-column: span 2;
	}
	@media (max-width: 600px) {
		.profile-card {
			grid-column: span 1;
		}
	}

	/* Fields */
	.field-group {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}
	@media (max-width: 500px) {
		.field-group {
			grid-template-columns: 1fr;
		}
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	label {
		font-size: 0.78rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.field-value {
		font-size: 1rem;
		font-weight: 500;
		color: var(--text);
	}

	.card-actions {
		margin-top: 4px;
	}

	/* Stats */
	.stats-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.stat-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 14px;
		background: var(--bg-muted);
		border-radius: var(--r-md);
	}

	.stat-label {
		font-size: 0.875rem;
		color: var(--text-muted);
		font-weight: 500;
	}
	.stat-val {
		font-family: 'Fraunces', serif;
		font-size: 1.3rem;
		font-weight: 500;
		color: var(--text);
	}

	/* Danger */
	.danger-card {
		border-color: rgba(155, 41, 41, 0.2);
	}
	.danger-desc {
		font-size: 0.875rem;
		color: var(--text-muted);
	}
</style>
