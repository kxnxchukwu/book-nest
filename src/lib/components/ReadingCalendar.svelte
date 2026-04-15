<script lang="ts">
	import { getUserState } from '$lib/state/user-state.svelte';

	let userContext = getUserState();
	let readingLogs = $derived(userContext.readingLogs);
	let allBooks = $derived(userContext.allBooks ?? []);

	// Calendar navigation
	let today = new Date();
	let viewYear = $state(today.getFullYear());
	let viewMonth = $state(today.getMonth()); // 0-indexed

	// Log modal state
	let selectedDate = $state<string | null>(null);
	let selectedMinutes = $state(30);
	let isSaving = $state(false);

	const MONTH_NAMES = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];
	const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	// Build calendar grid for current view month
	let calendarDays = $derived.by(() => {
		const firstDay = new Date(viewYear, viewMonth, 1);
		const lastDay = new Date(viewYear, viewMonth + 1, 0);
		const startPad = firstDay.getDay(); // 0=Sun
		const days: Array<{ date: string | null; day: number | null }> = [];

		// Padding before month starts
		for (let i = 0; i < startPad; i++) {
			days.push({ date: null, day: null });
		}

		// Actual days
		for (let d = 1; d <= lastDay.getDate(); d++) {
			const date = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
			days.push({ date, day: d });
		}

		return days;
	});

	// Build a lookup map for logs
	let logMap = $derived(new Map(readingLogs.map((l) => [l.date, l.minutes_read])));

	// Days books were started or finished (for the book dot)
	let bookEventDates = $derived(
		new Set([
			...allBooks
				.filter((b) => b.started_reading_on)
				.map((b) => b.started_reading_on!.split('T')[0]),
			...allBooks
				.filter((b) => b.finished_reading_on)
				.map((b) => b.finished_reading_on!.split('T')[0])
		])
	);

	function getIntensity(date: string | null): 0 | 1 | 2 | 3 | 4 {
		if (!date) return 0;
		const mins = logMap.get(date) ?? 0;
		if (mins === 0) return 0;
		if (mins <= 15) return 1;
		if (mins <= 30) return 2;
		if (mins <= 60) return 3;
		return 4;
	}

	function isToday(date: string | null): boolean {
		if (!date) return false;
		return date === today.toISOString().split('T')[0];
	}

	function isFuture(date: string | null): boolean {
		if (!date) return false;
		return date > today.toISOString().split('T')[0];
	}

	function prevMonth() {
		if (viewMonth === 0) {
			viewMonth = 11;
			viewYear--;
		} else viewMonth--;
	}

	function nextMonth() {
		if (viewMonth === 11) {
			viewMonth = 0;
			viewYear++;
		} else viewMonth++;
	}

	function canGoNext(): boolean {
		return !(viewYear === today.getFullYear() && viewMonth === today.getMonth());
	}

	function openLog(date: string) {
		if (isFuture(date)) return;
		selectedDate = date;
		selectedMinutes = logMap.get(date) ?? 30;
	}

	function closeLog() {
		selectedDate = null;
	}

	async function saveLog() {
		if (!selectedDate) return;
		isSaving = true;
		await userContext.logReadingSession(selectedDate, selectedMinutes);
		isSaving = false;
		closeLog();
	}

	function formatSelectedDate(date: string): string {
		return new Date(date + 'T00:00:00').toLocaleDateString('en-IE', {
			weekday: 'long',
			day: 'numeric',
			month: 'long'
		});
	}

	let currentStreak = $derived(userContext.getCurrentStreak());
	let longestStreak = $derived(userContext.getLongestStreak());

	let monthTotal = $derived(
		calendarDays.reduce((sum, d) => sum + (d.date ? (logMap.get(d.date) ?? 0) : 0), 0)
	);
</script>

<div class="calendar-wrap">
	<!-- Streak stats -->
	<div class="streak-row">
		<div class="streak-chip">
			<span class="streak-num">{currentStreak}</span>
			<span class="streak-label">day streak</span>
		</div>
		<div class="streak-chip">
			<span class="streak-num">{longestStreak}</span>
			<span class="streak-label">best streak</span>
		</div>
		<div class="streak-chip">
			<span class="streak-num">{monthTotal}</span>
			<span class="streak-label">min this month</span>
		</div>
	</div>

	<!-- Month navigation -->
	<div class="cal-header">
		<button class="nav-btn" onclick={prevMonth} aria-label="Previous month">
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
			>
				<polyline points="15 18 9 12 15 6" />
			</svg>
		</button>
		<h4 class="month-title">{MONTH_NAMES[viewMonth]} {viewYear}</h4>
		<button class="nav-btn" onclick={nextMonth} disabled={!canGoNext()} aria-label="Next month">
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
			>
				<polyline points="9 18 15 12 9 6" />
			</svg>
		</button>
	</div>

	<!-- Day name headers -->
	<div class="cal-grid">
		{#each DAY_NAMES as name}
			<div class="day-name">{name}</div>
		{/each}

		<!-- Calendar cells -->
		{#each calendarDays as { date, day }}
			{@const intensity = getIntensity(date)}
			{@const todayCell = isToday(date)}
			{@const futureCell = isFuture(date)}
			{@const hasBookEvent = date ? bookEventDates.has(date) : false}
			{@const logged = intensity > 0}

			<button
				class="day-cell"
				class:today={todayCell}
				class:future={futureCell}
				class:empty={!date}
				class:logged
				class:intensity-1={intensity === 1}
				class:intensity-2={intensity === 2}
				class:intensity-3={intensity === 3}
				class:intensity-4={intensity === 4}
				onclick={() => (date && !futureCell ? openLog(date) : null)}
				disabled={!date || futureCell}
				aria-label={date ? `${date}${logged ? `, ${logMap.get(date)} minutes read` : ''}` : ''}
			>
				{#if day}
					<span class="day-num">{day}</span>
					{#if logged}
						<span class="mins-badge">{logMap.get(date)}m</span>
					{/if}
					{#if hasBookEvent}
						<span class="book-dot" title="Book started or finished"></span>
					{/if}
				{/if}
			</button>
		{/each}
	</div>

	<!-- Legend -->
	<div class="legend">
		<span class="legend-label">Less</span>
		<div class="legend-dot intensity-0"></div>
		<div class="legend-dot intensity-1"></div>
		<div class="legend-dot intensity-2"></div>
		<div class="legend-dot intensity-3"></div>
		<div class="legend-dot intensity-4"></div>
		<span class="legend-label">More</span>
		<span class="legend-sep">·</span>
		<div class="legend-book-dot"></div>
		<span class="legend-label">Book event</span>
	</div>
</div>

<!-- Log modal -->
{#if selectedDate}
	<div
		class="log-backdrop"
		role="button"
		tabindex="-1"
		aria-label="Close"
		onclick={closeLog}
		onkeydown={(e) => e.key === 'Escape' && closeLog()}
	></div>

	<div class="log-modal" role="dialog" aria-label="Log reading session">
		<div class="log-header">
			<div>
				<h4>Log reading</h4>
				<p class="log-date">{formatSelectedDate(selectedDate)}</p>
			</div>
			<button class="close-btn" onclick={closeLog} aria-label="Close">
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

		<div class="log-body">
			<p class="log-question">How many minutes did you read?</p>

			<!-- Quick options -->
			<div class="quick-options">
				{#each [15, 30, 45, 60, 90, 120] as mins}
					<button
						class="quick-btn"
						class:active={selectedMinutes === mins}
						onclick={() => (selectedMinutes = mins)}
					>
						{mins}m
					</button>
				{/each}
			</div>

			<!-- Custom input -->
			<div class="custom-input-wrap">
				<label for="custom-mins" class="custom-label">Custom</label>
				<div class="custom-row">
					<input
						id="custom-mins"
						type="number"
						min="1"
						max="480"
						bind:value={selectedMinutes}
						class="custom-input"
					/>
					<span class="custom-unit">minutes</span>
				</div>
			</div>

			<button class="save-btn" onclick={saveLog} disabled={isSaving || selectedMinutes < 1}>
				{#if isSaving}
					<div class="save-spinner"></div>
				{:else}
					Save
				{/if}
			</button>
		</div>
	</div>
{/if}

<style>
	.calendar-wrap {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--r-lg);
		padding: 20px;
		box-shadow: var(--shadow-sm);
	}

	/* Streak row */
	.streak-row {
		display: flex;
		gap: 8px;
		margin-bottom: 20px;
		flex-wrap: wrap;
	}

	.streak-chip {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 10px 16px;
		background: var(--bg-muted);
		border-radius: var(--r-md);
		min-width: 80px;
		flex: 1;
	}

	.streak-num {
		font-family: 'Fraunces', serif;
		font-size: 1.6rem;
		font-weight: 500;
		line-height: 1;
		color: var(--accent);
	}

	.streak-label {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
		margin-top: 4px;
		white-space: nowrap;
	}

	/* Calendar header */
	.cal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
	}

	.month-title {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--text);
	}

	.nav-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border-radius: var(--r-sm);
		color: var(--text-muted);
		transition:
			background 140ms ease,
			color 140ms ease;
	}

	.nav-btn:hover:not(:disabled) {
		background: var(--bg-muted);
		color: var(--text);
	}
	.nav-btn:disabled {
		opacity: 0.3;
		cursor: default;
	}

	/* Grid */
	.cal-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 3px;
	}

	.day-name {
		font-size: 0.68rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
		text-align: center;
		padding: 4px 0 8px;
	}

	.day-cell {
		position: relative;
		aspect-ratio: 1;
		border-radius: var(--r-sm);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		background: var(--bg-muted);
		transition:
			background 140ms ease,
			transform 100ms ease;
		min-height: 0;
		gap: 1px;
		border: 1.5px solid transparent;
	}

	.day-cell:hover:not(:disabled):not(.empty) {
		transform: scale(1.05);
		border-color: var(--accent);
	}

	.day-cell.empty {
		background: transparent;
		cursor: default;
	}
	.day-cell.future {
		opacity: 0.3;
		cursor: default;
	}

	.day-cell.today {
		border-color: var(--accent);
		background: var(--accent-glow);
	}

	/* Intensity colours */
	.day-cell.intensity-1 {
		background: color-mix(in srgb, var(--accent) 20%, var(--bg-muted));
	}
	.day-cell.intensity-2 {
		background: color-mix(in srgb, var(--accent) 40%, var(--bg-muted));
	}
	.day-cell.intensity-3 {
		background: color-mix(in srgb, var(--accent) 65%, var(--bg-muted));
	}
	.day-cell.intensity-4 {
		background: var(--accent);
	}

	.day-cell.intensity-4 .day-num {
		color: var(--text-inv);
	}

	.day-num {
		font-size: clamp(0.6rem, 1.5vw, 0.78rem);
		font-weight: 500;
		color: var(--text);
		line-height: 1;
	}

	.mins-badge {
		font-size: clamp(0.45rem, 1vw, 0.58rem);
		color: var(--text-muted);
		line-height: 1;
	}

	.day-cell.intensity-4 .mins-badge {
		color: var(--text-inv);
		opacity: 0.8;
	}

	.book-dot {
		position: absolute;
		bottom: 3px;
		right: 3px;
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: #d4a240;
	}

	/* Legend */
	.legend {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-top: 12px;
		flex-wrap: wrap;
	}

	.legend-label {
		font-size: 0.68rem;
		color: var(--text-muted);
	}

	.legend-sep {
		color: var(--border-strong);
		font-size: 0.8rem;
		margin: 0 4px;
	}

	.legend-dot {
		width: 12px;
		height: 12px;
		border-radius: 3px;
	}

	.legend-dot.intensity-0 {
		background: var(--bg-muted);
		border: 1px solid var(--border);
	}
	.legend-dot.intensity-1 {
		background: color-mix(in srgb, var(--accent) 20%, var(--bg-muted));
	}
	.legend-dot.intensity-2 {
		background: color-mix(in srgb, var(--accent) 40%, var(--bg-muted));
	}
	.legend-dot.intensity-3 {
		background: color-mix(in srgb, var(--accent) 65%, var(--bg-muted));
	}
	.legend-dot.intensity-4 {
		background: var(--accent);
	}

	.legend-book-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #d4a240;
	}

	/* Log modal */
	.log-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 200;
		backdrop-filter: blur(2px);
		cursor: pointer;
		border: none;
	}

	.log-modal {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 201;
		background: var(--bg-card);
		border-radius: var(--r-xl) var(--r-xl) 0 0;
		padding: 20px 20px 32px;
		box-shadow: var(--shadow-lg);
		animation: slide-up 220ms cubic-bezier(0.32, 0.72, 0, 1);
	}

	@media (min-width: 540px) {
		.log-modal {
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

	.log-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 20px;
	}

	.log-date {
		font-size: 0.82rem;
		color: var(--text-muted);
		margin-top: 2px;
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

	.log-body {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.log-question {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text);
	}

	.quick-options {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.quick-btn {
		padding: 7px 16px;
		border-radius: 99px;
		font-size: 0.85rem;
		font-weight: 500;
		border: 1.5px solid var(--border);
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
		transition: all 140ms ease;
	}
	.quick-btn:hover {
		border-color: var(--border-strong);
		color: var(--text);
	}
	.quick-btn.active {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--text-inv);
	}

	.custom-input-wrap {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.custom-label {
		font-size: 0.78rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.custom-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.custom-input {
		width: 90px;
		min-height: unset;
		height: 38px;
		text-align: center;
		font-size: 1rem;
		font-weight: 600;
	}

	.custom-unit {
		font-size: 0.875rem;
		color: var(--text-muted);
	}

	.save-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		padding: 12px;
		background: var(--accent);
		color: var(--text-inv);
		border-radius: var(--r-md);
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		border: none;
		transition: filter 160ms ease;
		min-height: 44px;
	}
	.save-btn:hover:not(:disabled) {
		filter: brightness(1.1);
	}
	.save-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.save-spinner {
		width: 18px;
		height: 18px;
		border: 2.5px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
