<script lang="ts">
	import { getUserState } from '$lib/state/user-state.svelte';
	import { browser } from '$app/environment';
	import Icon from '@iconify/svelte';

	let userContext = getUserState();

	let goals = $derived(userContext.readingGoals);
	let booksThisYear = $derived(userContext.getBooksFinishedThisYear());
	let minutesThisWeek = $derived(userContext.getMinutesThisWeek());
	let currentStreak = $derived(userContext.getCurrentStreak());

	let isEditing = $state(false);
	let editBooksPerYear = $state(12);
	let editMinutesPerWeek = $state(60);
	let editStreakGoal = $state(7);

	$effect(() => {
		if (browser) userContext.loadGoals();
	});

	function openEdit() {
		editBooksPerYear = goals.booksPerYear;
		editMinutesPerWeek = goals.minutesPerWeek;
		editStreakGoal = goals.streakGoal;
		isEditing = true;
	}

	function saveEdit() {
		userContext.saveGoals({
			booksPerYear: Math.max(1, editBooksPerYear),
			minutesPerWeek: Math.max(1, editMinutesPerWeek),
			streakGoal: Math.max(1, editStreakGoal)
		});
		isEditing = false;
	}

	// Progress percentages clamped to 100%
	let booksPct = $derived(Math.min(100, Math.round((booksThisYear / goals.booksPerYear) * 100)));
	let minutesPct = $derived(
		Math.min(100, Math.round((minutesThisWeek / goals.minutesPerWeek) * 100))
	);
	let streakPct = $derived(Math.min(100, Math.round((currentStreak / goals.streakGoal) * 100)));

	let booksOnTrack = $derived(booksThisYear >= goals.booksPerYear);
	let minutesOnTrack = $derived(minutesThisWeek >= goals.minutesPerWeek);
	let streakOnTrack = $derived(currentStreak >= goals.streakGoal);

	// Pace label for books
	let currentMonth = $derived(new Date().getMonth() + 1);
	let monthsLeft = $derived(13 - currentMonth);
	let booksNeeded = $derived(Math.max(0, goals.booksPerYear - booksThisYear));
	let paceLabel = $derived(
		booksOnTrack
			? 'Goal reached!'
			: monthsLeft > 0
				? `~${Math.ceil(booksNeeded / monthsLeft)} book${Math.ceil(booksNeeded / monthsLeft) !== 1 ? 's' : ''}/month to stay on track`
				: `${booksNeeded} book${booksNeeded !== 1 ? 's' : ''} to go`
	);
</script>

<div class="goals-card">
	<div class="goals-header">
		<h5>Your goals</h5>
		<button class="edit-btn" onclick={openEdit} aria-label="Edit goals">
			<Icon icon="ion:pencil-outline" width="13" />
			Edit
		</button>
	</div>

	<!-- Books per year -->
	<div class="goal-item">
		<div class="goal-top">
			<div class="goal-icon" class:done={booksOnTrack}>
				<Icon icon="ion:book-outline" width="18" />
			</div>
			<div class="goal-info">
				<span class="goal-title">Books this year</span>
				<span class="goal-sub">{new Date().getFullYear()} · {booksPct}%</span>
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
			<div class="goal-icon" class:done={minutesOnTrack}>
				<Icon icon="ion:timer-outline" width="18" />
			</div>
			<div class="goal-info">
				<span class="goal-title">Minutes this week</span>
				<span class="goal-sub">Weekly target · {minutesPct}%</span>
			</div>
			<span class="goal-fraction" class:done={minutesOnTrack}>
				{minutesThisWeek}<span class="goal-total">/{goals.minutesPerWeek}m</span>
			</span>
		</div>
		<div class="progress-track">
			<div class="progress-fill" class:complete={minutesOnTrack} style="width: {minutesPct}%"></div>
		</div>
		<p class="pace-label">
			{minutesOnTrack
				? 'Weekly goal reached!'
				: `${goals.minutesPerWeek - minutesThisWeek}m to go this week`}
		</p>
	</div>

	<!-- Streak goal -->
	<div class="goal-item">
		<div class="goal-top">
			<div class="goal-icon" class:done={streakOnTrack}>
				<Icon icon="ion:flame-outline" width="18" />
			</div>
			<div class="goal-info">
				<span class="goal-title">Reading streak</span>
				<span class="goal-sub">Consecutive days · {streakPct}%</span>
			</div>
			<span class="goal-fraction" class:done={streakOnTrack}>
				{currentStreak}<span class="goal-total">/{goals.streakGoal}d</span>
			</span>
		</div>
		<div class="progress-track">
			<div class="progress-fill" class:complete={streakOnTrack} style="width: {streakPct}%"></div>
		</div>
		<p class="pace-label">
			{streakOnTrack
				? 'Streak goal reached!'
				: currentStreak === 0
					? 'Log today to start your streak'
					: `${goals.streakGoal - currentStreak} more day${goals.streakGoal - currentStreak !== 1 ? 's' : ''} to reach your goal`}
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
				<Icon icon="ion:close" width="18" />
			</button>
		</div>

		<div class="edit-body">
			<div class="edit-field">
				<label for="books-goal">
					<Icon icon="ion:book-outline" width="14" />
					Books per year
				</label>
				<div class="stepper">
					<button onclick={() => (editBooksPerYear = Math.max(1, editBooksPerYear - 1))}>−</button>
					<input id="books-goal" type="number" min="1" max="365" bind:value={editBooksPerYear} />
					<button onclick={() => (editBooksPerYear = editBooksPerYear + 1)}>+</button>
				</div>
				<p class="edit-hint">~{(editBooksPerYear / 12).toFixed(1)} books per month</p>
			</div>

			<div class="edit-field">
				<label for="minutes-goal">
					<Icon icon="ion:timer-outline" width="14" />
					Minutes per week
				</label>
				<div class="stepper">
					<button onclick={() => (editMinutesPerWeek = Math.max(1, editMinutesPerWeek - 15))}
						>−</button
					>
					<input
						id="minutes-goal"
						type="number"
						min="1"
						max="1440"
						bind:value={editMinutesPerWeek}
					/>
					<button onclick={() => (editMinutesPerWeek = editMinutesPerWeek + 15)}>+</button>
				</div>
				<p class="edit-hint">~{Math.round(editMinutesPerWeek / 7)} minutes per day</p>
			</div>

			<div class="edit-field">
				<label for="streak-goal">
					<Icon icon="ion:flame-outline" width="14" />
					Streak goal (days)
				</label>
				<div class="stepper">
					<button onclick={() => (editStreakGoal = Math.max(1, editStreakGoal - 1))}>−</button>
					<input id="streak-goal" type="number" min="1" max="365" bind:value={editStreakGoal} />
					<button onclick={() => (editStreakGoal = editStreakGoal + 1)}>+</button>
				</div>
				<p class="edit-hint">
					{editStreakGoal < 7
						? 'A few days to build the habit'
						: editStreakGoal < 30
							? 'Building a solid routine'
							: 'An impressive commitment'}
				</p>
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
		width: 34px;
		height: 34px;
		border-radius: var(--r-md);
		background: var(--bg-muted);
		border: 1px solid var(--border);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-muted);
		flex-shrink: 0;
		transition:
			background 160ms ease,
			color 160ms ease,
			border-color 160ms ease;
	}
	.goal-icon.done {
		background: var(--accent-glow);
		color: var(--accent);
		border-color: var(--accent-light);
	}

	.goal-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1px;
		min-width: 0;
	}

	.goal-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text);
	}
	.goal-sub {
		font-size: 0.7rem;
		color: var(--text-muted);
	}

	.goal-fraction {
		font-family: 'Fraunces', serif;
		font-size: 1.2rem;
		font-weight: 500;
		color: var(--text);
		white-space: nowrap;
		flex-shrink: 0;
	}
	.goal-fraction.done {
		color: var(--accent);
	}
	.goal-total {
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	/* Progress bar */
	.progress-track {
		height: 5px;
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
		background: color-mix(in srgb, var(--accent) 80%, #2d6a4f);
	}

	.pace-label {
		font-size: 0.73rem;
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
			width: min(400px, 95vw);
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
		gap: 18px;
	}

	.edit-field {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.edit-field label {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.stepper {
		display: flex;
		align-items: center;
		border: 1.5px solid var(--border);
		border-radius: var(--r-md);
		overflow: hidden;
		width: fit-content;
	}

	.stepper button {
		width: 40px;
		height: 40px;
		font-size: 1.1rem;
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
		font-size: 0.73rem;
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
