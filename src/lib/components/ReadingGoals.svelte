<script lang="ts">
	import { getUserState, type ReadingGoals } from '$lib/state/user-state.svelte';
	import { browser } from '$app/environment';

	let userContext = getUserState();

	let goals = $derived(userContext.readingGoals);
	let booksThisYear = $derived(userContext.getBooksFinishedThisYear());
	let minutesThisWeek = $derived(userContext.getMinutesThisWeek());

	let isEditing = $state(false);
	let editBooksPerYear = $state(12);
	let editMinutesPerWeek = $state(60);

	$effect(() => {
		if (browser) userContext.loadGoals();
	});

	function openEdit() {
		editBooksPerYear = goals.booksPerYear;
		editMinutesPerWeek = goals.minutesPerWeek;
		isEditing = true;
	}

	function saveEdit() {
		userContext.saveGoals({
			booksPerYear: Math.max(1, editBooksPerYear),
			minutesPerWeek: Math.max(1, editMinutesPerWeek)
		});
		isEditing = false;
	}

	// Progress values clamped to 100%
	let booksPct = $derived(Math.min(100, Math.round((booksThisYear / goals.booksPerYear) * 100)));
	let minutesPct = $derived(
		Math.min(100, Math.round((minutesThisWeek / goals.minutesPerWeek) * 100))
	);

	let booksOnTrack = $derived(booksThisYear >= goals.booksPerYear);
	let minutesOnTrack = $derived(minutesThisWeek >= goals.minutesPerWeek);

	// How many books per month needed to hit yearly goal
	let currentMonth = $derived(new Date().getMonth() + 1); // 1-indexed
	let monthsLeft = $derived(13 - currentMonth);
	let booksNeeded = $derived(Math.max(0, goals.booksPerYear - booksThisYear));
	let paceLabel = $derived(
		booksOnTrack
			? 'Goal reached! 🎉'
			: monthsLeft > 0
				? `~${Math.ceil(booksNeeded / monthsLeft)} book${Math.ceil(booksNeeded / monthsLeft) !== 1 ? 's' : ''}/month to stay on track`
				: `${booksNeeded} book${booksNeeded !== 1 ? 's' : ''} to go`
	);
</script>

<div class="goals-card">
	<div class="goals-header">
		<h5>Your goals</h5>
		<button class="edit-btn" onclick={openEdit} aria-label="Edit goals">
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
				<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
			</svg>
			Edit
		</button>
	</div>

	<!-- Books per year -->
	<div class="goal-item">
		<div class="goal-top">
			<div class="goal-icon">📚</div>
			<div class="goal-info">
				<span class="goal-title">Books this year</span>
				<span class="goal-sub">{new Date().getFullYear()}</span>
			</div>
			<span class="goal-fraction" class:done={booksOnTrack}>
				{booksThisYear}<span class="goal-total">/{goals.booksPerYear}</span>
			</span>
		</div>
		<div class="progress-track">
			<div class="progress-fill" class:complete={booksOnTrack} style="width: {booksPct}%"></div>
		</div>
		<p class="pace-label">{paceLabel}</p>
	</div>

	<!-- Minutes per week -->
	<div class="goal-item">
		<div class="goal-top">
			<div class="goal-icon">⏱</div>
			<div class="goal-info">
				<span class="goal-title">Minutes this week</span>
				<span class="goal-sub">Weekly target</span>
			</div>
			<span class="goal-fraction" class:done={minutesOnTrack}>
				{minutesThisWeek}<span class="goal-total">/{goals.minutesPerWeek}m</span>
			</span>
		</div>
		<div class="progress-track">
			<div class="progress-fill" class:complete={minutesOnTrack} style="width: {minutesPct}%"></div>
		</div>
		<p class="pace-label">
			{#if minutesOnTrack}
				Weekly goal reached! 🎉
			{:else}
				{goals.minutesPerWeek - minutesThisWeek}m to go this week
			{/if}
		</p>
	</div>
</div>

<!-- Edit modal -->
{#if isEditing}
	<div
		class="backdrop"
		role="button"
		tabindex="-1"
		aria-label="Close"
		onclick={saveEdit}
		onkeydown={(e) => e.key === 'Escape' && saveEdit()}
	></div>

	<div class="edit-modal" role="dialog" aria-label="Edit reading goals">
		<div class="edit-header">
			<h4>Reading goals</h4>
			<button class="close-btn" onclick={saveEdit} aria-label="Close">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>
		</div>

		<div class="edit-body">
			<div class="edit-field">
				<label for="books-goal">Books per year</label>
				<div class="stepper">
					<button
						onclick={() => (editBooksPerYear = Math.max(1, editBooksPerYear - 1))}
						aria-label="Decrease">−</button
					>
					<input id="books-goal" type="number" min="1" max="365" bind:value={editBooksPerYear} />
					<button onclick={() => (editBooksPerYear = editBooksPerYear + 1)} aria-label="Increase"
						>+</button
					>
				</div>
				<p class="edit-hint">That's ~{(editBooksPerYear / 12).toFixed(1)} books per month</p>
			</div>

			<div class="edit-field">
				<label for="minutes-goal">Minutes per week</label>
				<div class="stepper">
					<button
						onclick={() => (editMinutesPerWeek = Math.max(1, editMinutesPerWeek - 15))}
						aria-label="Decrease">−</button
					>
					<input
						id="minutes-goal"
						type="number"
						min="1"
						max="1440"
						bind:value={editMinutesPerWeek}
					/>
					<button
						onclick={() => (editMinutesPerWeek = editMinutesPerWeek + 15)}
						aria-label="Increase">+</button
					>
				</div>
				<p class="edit-hint">That's ~{Math.round(editMinutesPerWeek / 7)} min/day</p>
			</div>

			<button class="save-btn" onclick={saveEdit}>Save goals</button>
		</div>
	</div>
{/if}

<style>
	.goals-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--r-lg);
		padding: 20px;
		box-shadow: var(--shadow-sm);
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.goals-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.edit-btn {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 0.78rem;
		font-weight: 500;
		color: var(--text-muted);
		padding: 4px 8px;
		border-radius: var(--r-sm);
		transition:
			background 140ms ease,
			color 140ms ease;
	}
	.edit-btn:hover {
		background: var(--bg-muted);
		color: var(--text);
	}

	/* Goal item */
	.goal-item {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.goal-top {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.goal-icon {
		font-size: 1.2rem;
		line-height: 1;
		flex-shrink: 0;
	}

	.goal-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.goal-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text);
	}
	.goal-sub {
		font-size: 0.72rem;
		color: var(--text-muted);
	}

	.goal-fraction {
		font-family: 'Fraunces', serif;
		font-size: 1.3rem;
		font-weight: 500;
		color: var(--text);
		white-space: nowrap;
	}
	.goal-fraction.done {
		color: #2d6a4f;
	}
	.goal-total {
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	/* Progress bar */
	.progress-track {
		height: 6px;
		background: var(--bg-muted);
		border-radius: 99px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--accent);
		border-radius: 99px;
		transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1);
		min-width: 4px;
	}

	.progress-fill.complete {
		background: #2d6a4f;
	}

	.pace-label {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	/* Edit modal */
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 200;
		backdrop-filter: blur(2px);
		cursor: pointer;
		border: none;
	}

	.edit-modal {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 201;
		background: var(--bg-card);
		border-radius: var(--r-xl) var(--r-xl) 0 0;
		padding: 20px 20px 36px;
		box-shadow: var(--shadow-lg);
		animation: slide-up 220ms cubic-bezier(0.32, 0.72, 0, 1);
	}

	@media (min-width: 540px) {
		.edit-modal {
			bottom: auto;
			top: 50%;
			left: 50%;
			right: auto;
			transform: translate(-50%, -50%);
			width: min(380px, 95vw);
			border-radius: var(--r-xl);
			animation: fade-scale 180ms cubic-bezier(0.32, 0.72, 0, 1);
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

	.edit-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20px;
	}

	.close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border-radius: var(--r-md);
		color: var(--text-muted);
		transition: background 140ms ease;
	}
	.close-btn:hover {
		background: var(--bg-muted);
	}

	.edit-body {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.edit-field {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.edit-field label {
		font-size: 0.82rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.stepper {
		display: flex;
		align-items: center;
		gap: 0;
		border: 1.5px solid var(--border);
		border-radius: var(--r-md);
		overflow: hidden;
		width: fit-content;
	}

	.stepper button {
		width: 40px;
		height: 40px;
		font-size: 1.2rem;
		font-weight: 300;
		color: var(--text-muted);
		background: var(--bg-muted);
		border: none;
		cursor: pointer;
		transition:
			background 140ms ease,
			color 140ms ease;
	}
	.stepper button:hover {
		background: var(--bg-card);
		color: var(--text);
	}

	.stepper input {
		width: 70px;
		height: 40px;
		text-align: center;
		font-size: 1rem;
		font-weight: 600;
		border: none;
		border-radius: 0;
		border-left: 1.5px solid var(--border);
		border-right: 1.5px solid var(--border);
		min-height: unset;
		background: var(--bg-card);
	}

	.edit-hint {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.save-btn {
		padding: 12px;
		width: 100%;
		background: var(--accent);
		color: var(--text-inv);
		border-radius: var(--r-md);
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		border: none;
		transition: filter 160ms ease;
	}
	.save-btn:hover {
		filter: brightness(1.1);
	}
</style>
