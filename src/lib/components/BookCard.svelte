<script lang="ts">
	import type { Book } from '$lib/state/user-state.svelte';
	import { StarRating } from '$components';

	interface BookCardProps {
		book: Book;
	}
	let { book }: BookCardProps = $props();

	let bookStatus = $derived(
		book.finished_reading_on ? 'Finished' : book.started_reading_on ? 'Reading' : 'Unread'
	);

	let statusColor = $derived(
		book.finished_reading_on
			? 'status-done'
			: book.started_reading_on
				? 'status-reading'
				: 'status-unread'
	);
</script>

<a class="book-card" href={`/private/books/${book.id}`}>
	<div class="cover-wrap">
		{#if book.cover_image}
			<img src={book.cover_image} alt={book.title} />
		{:else}
			<div class="cover-placeholder">
				<svg
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					opacity="0.4"
				>
					<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path
						d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
					/>
				</svg>
			</div>
		{/if}
		<div class="cover-overlay"></div>
	</div>

	<div class="book-badge {statusColor}">{bookStatus}</div>

	<div class="book-info">
		<h4 class="book-title">{book.title}</h4>
		<p class="book-author">{book.author}</p>
		<StarRating isReadOnly={true} value={book.rating || 0} />
	</div>
</a>

<style>
	.book-card {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		width: 180px;
		height: 260px;
		flex-shrink: 0;
		border-radius: var(--r-lg, 18px);
		overflow: hidden;
		text-decoration: none;
		color: white;
		box-shadow: var(--shadow-md);
		transition:
			transform 180ms ease,
			box-shadow 180ms ease;
	}

	.book-card:hover {
		transform: translateY(-4px) scale(1.01);
		box-shadow: var(--shadow-lg);
	}

	.cover-wrap {
		position: absolute;
		inset: 0;
		background: var(--bg-muted);
	}

	.cover-wrap img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.cover-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, var(--accent-light) 0%, var(--accent-mid) 100%);
		color: white;
	}

	.cover-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to top,
			rgba(0, 0, 0, 0.82) 0%,
			rgba(0, 0, 0, 0.3) 50%,
			rgba(0, 0, 0, 0.05) 100%
		);
	}

	.book-badge {
		position: absolute;
		top: 10px;
		right: 10px;
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		padding: 3px 8px;
		border-radius: 99px;
		text-transform: uppercase;
		backdrop-filter: blur(4px);
	}

	.status-done {
		background: rgba(45, 106, 79, 0.8);
	}
	.status-reading {
		background: rgba(61, 43, 31, 0.8);
	}
	.status-unread {
		background: rgba(0, 0, 0, 0.45);
	}

	.book-info {
		position: relative;
		padding: 12px 14px;
	}

	.book-title {
		font-family: 'Fraunces', serif;
		font-size: 0.95rem;
		font-weight: 500;
		line-height: 1.3;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: white;
		margin-bottom: 2px;
	}

	.book-author {
		font-size: 0.75rem;
		opacity: 0.75;
		font-style: italic;
		margin-bottom: 6px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
