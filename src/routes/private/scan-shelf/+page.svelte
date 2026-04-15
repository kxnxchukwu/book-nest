<script lang="ts">
	import Dropzone from 'svelte-file-dropzone';
	import Icon from '@iconify/svelte';
	import { Button } from '$components';
	import { convertFileToBase64 } from '$lib/utils/image-helpers';
	import { type ScannedBook, getUserState } from '$lib/state/user-state.svelte';

	interface FileDropDetail {
		acceptedFiles: File[];
		rejectedFiles: File[];
	}

	let userContext = getUserState();
	let isLoading = $state(false);
	let errorMessage = $state('');
	let recognizedBooks = $state<ScannedBook[]>([]);
	let booksSuccessfullyAdded = $state(false);

	async function handleDrop(e: CustomEvent<FileDropDetail>) {
		const { acceptedFiles } = e.detail;
		if (acceptedFiles.length) {
			isLoading = true;
			const file = acceptedFiles[0];
			const base64String = await convertFileToBase64(file);
			try {
				const response = await fetch('/api/scan-shelf', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ base64: base64String })
				});
				const result = (await response.json()) as { bookArray?: ScannedBook[]; error?: string };
				if (!response.ok) {
					errorMessage = result.error ?? `Server error (${response.status}). Please try again.`;
					isLoading = false;
					return;
				}
				recognizedBooks = result.bookArray ?? [];
			} catch (error) {
				console.error('Error uploading file:', error);
				errorMessage = 'Error processing the uploaded file.';
			}
		} else {
			errorMessage = `Could not upload given file. Make sure it's an image under 10 MB.`;
		}
		isLoading = false;
	}

	function removeBook(index: number) {
		recognizedBooks.splice(index, 1);
	}

	async function addAllBooks() {
		isLoading = true;
		try {
			await userContext.addBooksToLibrary(recognizedBooks);
			isLoading = false;
			booksSuccessfullyAdded = true;
		} catch (error: unknown) {
			errorMessage = (error as Error).message;
			isLoading = false;
		}
	}
</script>

<div class="scan-page">
	<div class="scan-header">
		<h5>Add books</h5>
		<h2>Scan your shelf</h2>
		<p class="scan-desc">
			Photograph your bookshelf and we'll automatically recognise and add the books to your library.
		</p>
	</div>

	{#if recognizedBooks.length === 0}
		<div class="upload-area">
			{#if errorMessage}
				<div class="scan-error">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line
							x1="12"
							y1="16"
							x2="12.01"
							y2="16"
						/>
					</svg>
					{errorMessage}
				</div>
			{/if}

			{#if isLoading}
				<div class="loading-state">
					<div class="spinner"></div>
					<p>Scanning your shelf…</p>
				</div>
			{:else}
				<Dropzone
					on:drop={handleDrop}
					multiple={false}
					accept="image/*"
					maxSize={10 * 1024 * 1024}
					containerClasses="dropzone-scan"
				>
					<div class="dropzone-inner">
						<div class="drop-icon">
							<Icon icon="bi:camera-fill" width="28" />
						</div>
						<p class="drop-label">Drag a photo here, or click to browse</p>
						<span class="drop-hint">JPG, PNG, WEBP · max 10 MB</span>
					</div>
				</Dropzone>
			{/if}
		</div>
	{:else if !booksSuccessfullyAdded}
		<div class="results-area">
			<div class="results-header">
				<p class="results-count">
					{recognizedBooks.length} book{recognizedBooks.length !== 1 ? 's' : ''} found
				</p>
				<p class="results-hint">Remove any that were misidentified before adding.</p>
			</div>

			<div class="book-table-wrap">
				<table class="book-table">
					<thead>
						<tr>
							<th aria-label="Cover"></th>
							<th>Title</th>
							<th>Author</th>
							<th>Genre</th>
							<th aria-label="Remove"></th>
						</tr>
					</thead>
					<tbody>
						{#each recognizedBooks as book, index (index)}
							<tr>
								<td class="cell-cover">
									{#if book.cover_image}
										<img src={book.cover_image} alt={book.bookTitle} class="cover-thumb" />
									{:else}
										<div class="cover-placeholder">
											<svg
												width="14"
												height="14"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="1.5"
												><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path
													d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
												/></svg
											>
										</div>
									{/if}
								</td>
								<td class="cell-title">
									{book.bookTitle}
									{#if book.description}
										<span class="cell-desc">{book.description}</span>
									{/if}
								</td>
								<td class="cell-author">{book.author}</td>
								<td class="cell-genre">{book.genre ?? '—'}</td>
								<td class="cell-remove">
									<button
										type="button"
										aria-label="Remove {book.bookTitle}"
										class="remove-btn"
										onclick={() => removeBook(index)}
									>
										<svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<polyline points="3 6 5 6 21 6" /><path
												d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
											/><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
										</svg>
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			{#if isLoading}
				<div class="loading-inline">
					<div class="spinner"></div>
					<span>Adding books…</span>
				</div>
			{:else}
				<Button onclick={addAllBooks}>
					Add {recognizedBooks.length} book{recognizedBooks.length !== 1 ? 's' : ''} to library
				</Button>
			{/if}
		</div>
	{:else}
		<div class="success-state">
			<div class="success-icon">
				<svg
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<polyline points="20 6 9 17 4 12" />
				</svg>
			</div>
			<h3>{recognizedBooks.length} book{recognizedBooks.length !== 1 ? 's' : ''} added!</h3>
			<p>They've been added to your library.</p>
			<Button href="/private/dashboard">Go to your library</Button>
		</div>
	{/if}
</div>

<style>
	.scan-page {
		width: 100%;
	}

	.scan-header {
		margin-bottom: 32px;
	}
	.scan-header h2 {
		font-size: clamp(1.5rem, 3vw, 2.2rem);
		margin-bottom: 8px;
	}
	.scan-desc {
		color: var(--text-muted);
		max-width: 480px;
		font-size: 0.95rem;
	}

	/* Upload area */
	.upload-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		max-width: 560px;
	}

	.scan-error {
		display: flex;
		align-items: center;
		gap: 8px;
		background: rgba(155, 41, 41, 0.08);
		border: 1px solid rgba(155, 41, 41, 0.2);
		color: var(--danger);
		font-size: 0.875rem;
		border-radius: var(--r-md);
		padding: 10px 14px;
		width: 100%;
	}

	:global(.dropzone-scan) {
		width: 100% !important;
		min-width: min(520px, 90vw) !important;
		min-height: 280px !important;
		border: 2px dashed var(--border-strong) !important;
		border-radius: var(--r-lg) !important;
		background: var(--bg-muted) !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		cursor: pointer !important;
		transition:
			background 160ms ease,
			border-color 160ms ease !important;
	}

	:global(.dropzone-scan:hover) {
		background: var(--bg-card) !important;
		border-color: var(--accent) !important;
	}

	.dropzone-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		text-align: center;
		padding: 24px;
		color: var(--text-muted);
	}

	.drop-icon {
		width: 56px;
		height: 56px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 4px;
		box-shadow: var(--shadow-sm);
	}

	.drop-label {
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--text);
	}
	.drop-hint {
		font-size: 0.78rem;
	}

	/* Loading */
	.loading-state,
	.loading-inline {
		display: flex;
		align-items: center;
		gap: 10px;
		color: var(--text-muted);
		font-size: 0.9rem;
	}

	.spinner {
		width: 22px;
		height: 22px;
		border: 2.5px solid var(--border);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
		flex-shrink: 0;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Results */
	.results-area {
		display: flex;
		flex-direction: column;
		gap: 20px;
		max-width: 640px;
	}

	.results-header {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.results-count {
		font-weight: 600;
		font-size: 0.95rem;
	}
	.results-hint {
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	.book-table-wrap {
		border-radius: var(--r-lg);
		border: 1px solid var(--border);
		overflow: hidden;
		background: var(--bg-card);
		box-shadow: var(--shadow-sm);
	}

	.book-table {
		width: 100%;
		border-collapse: collapse;
	}

	.book-table th {
		text-align: left;
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: var(--text-muted);
		padding: 10px 16px;
		background: var(--bg-muted);
		border-bottom: 1px solid var(--border);
	}

	.book-table td {
		padding: 12px 16px;
		font-size: 0.9rem;
		border-bottom: 1px solid var(--border);
	}

	.book-table tr:last-child td {
		border-bottom: none;
	}

	.cell-cover {
		width: 44px;
		padding: 8px 8px 8px 16px !important;
	}
	.cover-thumb {
		width: 36px;
		height: 52px;
		object-fit: cover;
		border-radius: 3px;
		display: block;
		box-shadow: var(--shadow-sm);
	}
	.cover-placeholder {
		width: 36px;
		height: 52px;
		background: var(--bg-muted);
		border-radius: 3px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-muted);
	}
	.cell-title {
		font-weight: 500;
		color: var(--text);
	}
	.cell-desc {
		display: block;
		font-size: 0.78rem;
		color: var(--text-muted);
		font-weight: 400;
		margin-top: 3px;
		line-height: 1.4;
	}
	.cell-author {
		color: var(--text-muted);
		font-style: italic;
	}
	.cell-genre {
		font-size: 0.8rem;
		color: var(--text-muted);
		white-space: nowrap;
	}
	.cell-remove {
		width: 40px;
		text-align: center;
	}

	.remove-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border-radius: var(--r-sm);
		color: var(--text-muted);
		transition:
			background 160ms ease,
			color 160ms ease;
	}

	.remove-btn:hover {
		background: rgba(155, 41, 41, 0.08);
		color: var(--danger);
	}

	/* Success */
	.success-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 12px;
		padding: 60px 24px;
	}

	.success-icon {
		width: 72px;
		height: 72px;
		border-radius: 50%;
		background: rgba(45, 106, 79, 0.12);
		color: var(--success, #2d6a4f);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 8px;
	}

	.success-state h3 {
		font-size: 1.5rem;
	}
	.success-state p {
		color: var(--text-muted);
	}
</style>
