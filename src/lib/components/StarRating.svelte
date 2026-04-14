<script lang="ts">
	interface StarRatingProps {
		value: number;
		isReadOnly?: boolean;
		updateDatabaseRating?: (newRating: number) => void;
	}

	let { isReadOnly, value, updateDatabaseRating }: StarRatingProps = $props();

	function handleRating(newRating: number) {
		value = newRating;
		if (updateDatabaseRating) {
			updateDatabaseRating(newRating);
		}
	}
</script>

<div
	class="rating"
	role={isReadOnly ? 'img' : 'group'}
	aria-label={isReadOnly ? `Rated ${value} out of 5 stars` : 'Rate this book'}
	aria-readonly={isReadOnly}
>
	{#each Array(5) as _, i (i)}
		<button
			type="button"
			class="star"
			class:filled={value > i}
			class:read-only={isReadOnly}
			aria-label={isReadOnly ? `${i + 1} star` : `Rate ${i + 1} out of 5`}
			aria-pressed={!isReadOnly && value > i}
			onclick={() => handleRating(i + 1)}
			disabled={isReadOnly}>★</button
		>
	{/each}
</div>

<style>
	.rating {
		display: inline-flex;
		gap: 1px;
	}

	.star {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0 1px;
		font-size: 1.1rem;
		line-height: 1;
		color: var(--border-strong);
		transition:
			color 120ms ease,
			transform 100ms ease;
	}

	.star.filled {
		color: #d4a240;
	}

	.star:not(.read-only):hover {
		transform: scale(1.2);
		color: #d4a240;
	}

	.star.read-only {
		cursor: default;
	}
</style>
