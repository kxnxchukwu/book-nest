<script lang="ts">
	import { BookCard } from '$components/index.svelte';
	import type { Book } from '$lib/state/user-state.svelte';

	interface BookCategoryProps {
		categoryName: string;
		booksToDisplay: Book[];
	}

	let { categoryName, booksToDisplay }: BookCategoryProps = $props();
</script>

{#if booksToDisplay.length > 0}
	<section class="book-category">
		<h5 class="category-label">{categoryName}</h5>
		<div class="books-scroll">
			{#each booksToDisplay as book, index (book.id ?? index)}
				<BookCard {book} />
			{/each}
		</div>
	</section>
{/if}

<style>
	.book-category {
		margin-bottom: 40px;
	}

	.category-label {
		margin-bottom: 16px;
	}

	.books-scroll {
		display: flex;
		gap: 14px;
		overflow-x: auto;
		padding-bottom: 12px;
		-webkit-overflow-scrolling: touch;
		scroll-snap-type: x mandatory;
	}

	.books-scroll > :global(*) {
		scroll-snap-align: start;
	}

	.books-scroll::-webkit-scrollbar {
		height: 4px;
	}
	.books-scroll::-webkit-scrollbar-thumb {
		background: var(--border-strong);
		border-radius: 99px;
	}
</style>
