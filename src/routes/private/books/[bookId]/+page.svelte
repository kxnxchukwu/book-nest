<script lang="ts">
	import { Button, StarRating } from '$components';
	import { getUserState, type Book } from '$lib/state/user-state.svelte';
	import Icon from '@iconify/svelte';
	import Dropzone from 'svelte-file-dropzone';

	interface BookPageProps {
		data: { book: Book };
	}
	interface FileDropDetail {
		acceptedFiles: File[];
		rejectedFiles: File[];
	}

	let { data }: BookPageProps = $props();
	let userContext = getUserState();
	let book = $derived(userContext.getBookById(data.book.id) || data.book);
	let isEditMode = $state(false);

	let title = $state(data.book.title);
	let author = $state(data.book.author);
	let description = $state(data.book.description || '');
	let genre = $state(data.book.genre || '');

	function goBack() {
		history.back();
	}

	async function toggleEditModeAndSaveToDatabase() {
		if (isEditMode) {
			await userContext.updateBook(book.id, { title, author, description, genre });
		}
		isEditMode = !isEditMode;
	}

	async function updateReadingStatus() {
		const hasStartedReading = Boolean(book.started_reading_on);
		const currentTimestamp = new Date().toISOString();
		if (hasStartedReading) {
			await userContext.updateBook(book.id, { finished_reading_on: currentTimestamp });
		} else {
			await userContext.updateBook(book.id, { started_reading_on: currentTimestamp });
		}
	}

	async function updateDatabaseRating(newRating: number) {
		await userContext.updateBook(book.id, { rating: newRating });
	}

	async function handleDrop(e: CustomEvent<FileDropDetail>) {
		const { acceptedFiles } = e.detail;
		if (acceptedFiles.length) {
			await userContext.uploadBookCover(acceptedFiles[0] as File, book.id);
		}
	}

	let readingStatus = $derived(
		book.finished_reading_on
			? 'Finished'
			: book.started_reading_on
				? 'Currently reading'
				: 'Not started'
	);
</script>

<div class="book-page">
	<button class="back-btn" onclick={goBack} aria-label="Go back">
		<Icon icon="ep:back" width="18" />
		<span>Back</span>
	</button>

	<div class="book-layout">
		<!-- Left: Info / Edit -->
		<div class="book-info">
			{#if isEditMode}
				<input
					class="edit-title"
					bind:value={title}
					type="text"
					name="title"
					placeholder="Book title"
				/>
				<div class="edit-author-row">
					<span>by</span>
					<input
						class="edit-author"
						bind:value={author}
						type="text"
						name="author"
						placeholder="Author"
					/>
				</div>
			{:else}
				<div class="status-badge">{readingStatus}</div>
				<h2 class="book-title">{book.title}</h2>
				<p class="book-author">by <em>{book.author}</em></p>
			{/if}

			<div class="section">
				<h5>Your rating</h5>
				<StarRating value={book.rating || 0} {updateDatabaseRating} />
				<p class="small-font">Click to {book.rating ? 'update' : 'give a'} rating</p>
			</div>

			{#if isEditMode}
				<div class="section">
					<h5>Description</h5>
					<textarea name="description" bind:value={description} placeholder="Add a description…"
					></textarea>
				</div>
				<div class="section">
					<h5>Genre</h5>
					<input type="text" name="genre" bind:value={genre} placeholder="e.g. Fiction" />
				</div>
			{:else}
				{#if book.description}
					<div class="section">
						<h5>Description</h5>
						<p class="book-description">{book.description}</p>
					</div>
				{/if}
				{#if book.genre}
					<div class="section">
						<h5>Genre</h5>
						<p class="genre-tag">{book.genre}</p>
					</div>
				{/if}
			{/if}

			{#if !book.finished_reading_on}
				<div class="section">
					<Button isSecondary={Boolean(book.started_reading_on)} onclick={updateReadingStatus}>
						{book.started_reading_on ? '✓ I finished this book' : 'Start reading'}
					</Button>
				</div>
			{/if}

			<div class="action-row">
				<Button isSecondary onclick={toggleEditModeAndSaveToDatabase}>
					{isEditMode ? 'Save changes' : 'Edit'}
				</Button>
				<Button isDanger onclick={() => userContext.deleteBookFromLibrary(book.id)}>Delete</Button>
			</div>
		</div>

		<!-- Right: Cover -->
		<div class="book-cover-area">
			{#if book.cover_image}
				<div class="cover-frame">
					<img src={book.cover_image} alt={book.title} />
				</div>
			{:else}
				<Dropzone
					on:drop={handleDrop}
					multiple={false}
					accept="image/*"
					maxSize={5 * 1024 * 1024}
					containerClasses="dropzone-cover"
				>
					<div class="dropzone-inner">
						<Icon icon="bi:camera-fill" width="28" />
						<p>Drop or click to add cover</p>
						<span class="small-font">Max 5 MB</span>
					</div>
				</Dropzone>
			{/if}
		</div>
	</div>
</div>

<style>
	.book-page {
		width: 100%;
	}

	.back-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: var(--text-muted);
		font-size: 0.875rem;
		font-weight: 500;
		padding: 6px 0;
		margin-bottom: 28px;
		transition: color 160ms ease;
	}
	.back-btn:hover {
		color: var(--text);
	}

	.book-layout {
		display: flex;
		gap: clamp(24px, 5vw, 64px);
		align-items: flex-start;
		flex-wrap: wrap;
	}

	/* ── Info panel ─── */
	.book-info {
		flex: 1;
		min-width: 260px;
	}

	.status-badge {
		display: inline-block;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--accent-mid);
		background: var(--accent-glow);
		border-radius: 99px;
		padding: 3px 10px;
		margin-bottom: 12px;
	}

	.book-title {
		font-size: clamp(1.6rem, 4vw, 2.6rem);
		line-height: 1.15;
		margin-bottom: 8px;
	}

	.book-author {
		color: var(--text-muted);
		font-size: 1rem;
		margin-bottom: 4px;
	}

	.section {
		margin-top: 24px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.book-description {
		color: var(--text-muted);
		line-height: 1.7;
	}

	.genre-tag {
		display: inline-block;
		font-size: 0.85rem;
		padding: 4px 12px;
		background: var(--bg-muted);
		border-radius: 99px;
		border: 1px solid var(--border);
	}

	.action-row {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 32px;
	}

	/* Edit mode inputs */
	.edit-title {
		font-family: 'Fraunces', serif;
		font-size: clamp(1.4rem, 3.5vw, 2.2rem);
		font-weight: 500;
		background: var(--bg-subtle);
		border: 1.5px solid var(--border);
		border-radius: var(--r-md);
		padding: 10px 14px;
		width: 100%;
		color: var(--text);
		margin-bottom: 10px;
	}

	.edit-author-row {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--text-muted);
	}

	.edit-author {
		flex: 1;
	}

	/* ── Cover panel ─── */
	.book-cover-area {
		flex: 0 0 auto;
		width: clamp(200px, 30vw, 320px);
	}

	.cover-frame {
		border-radius: var(--r-lg);
		overflow: hidden;
		box-shadow: var(--shadow-lg);
		aspect-ratio: 2/3;
	}

	.cover-frame img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	:global(.dropzone-cover) {
		width: 100% !important;
		aspect-ratio: 2/3;
		border-radius: var(--r-lg) !important;
		border: 2px dashed var(--border-strong) !important;
		background: var(--bg-muted) !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		cursor: pointer;
		transition:
			background 160ms ease,
			border-color 160ms ease !important;
	}

	:global(.dropzone-cover:hover) {
		background: var(--bg-subtle) !important;
		border-color: var(--accent) !important;
	}

	.dropzone-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		color: var(--text-muted);
		text-align: center;
		padding: 16px;
	}

	.dropzone-inner p {
		font-size: 0.875rem;
		font-weight: 500;
	}

	/* Mobile: stack cover above info */
	@media (max-width: 640px) {
		.book-layout {
			flex-direction: column-reverse;
		}
		.book-cover-area {
			width: min(240px, 70vw);
			margin: 0 auto;
		}
	}
</style>
