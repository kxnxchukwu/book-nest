<script lang="ts">
	import { toasts, removeToast } from '$lib/utils/toasts.svelte';
</script>

<div class="toast-container">
	{#each toasts as toast (toast.id)}
		<div class="toast toast-{toast.type}" role="alert">
			<span class="toast-icon">
				{#if toast.type === 'success'}
					<svg
						width="15"
						height="15"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg
					>
				{:else if toast.type === 'error'}
					<svg
						width="15"
						height="15"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line
							x1="12"
							y1="16"
							x2="12.01"
							y2="16"
						/></svg
					>
				{:else}
					<svg
						width="15"
						height="15"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line
							x1="12"
							y1="16"
							x2="12.01"
							y2="16"
						/></svg
					>
				{/if}
			</span>
			<p class="toast-message">{toast.message}</p>
			<button class="toast-close" onclick={() => removeToast(toast.id)} aria-label="Dismiss">
				<svg
					width="13"
					height="13"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg
				>
			</button>
		</div>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		bottom: 80px;
		right: 16px;
		z-index: 500;
		display: flex;
		flex-direction: column;
		gap: 8px;
		pointer-events: none;
	}

	@media (min-width: 768px) {
		.toast-container {
			bottom: 24px;
		}
	}

	.toast {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 11px 14px;
		border-radius: var(--r-lg);
		font-size: 0.875rem;
		font-weight: 500;
		box-shadow: var(--shadow-lg);
		pointer-events: all;
		max-width: 320px;
		animation: toast-in 200ms cubic-bezier(0.32, 0.72, 0, 1);
		background: var(--bg-card);
		border: 1px solid var(--border);
		color: var(--text);
	}

	@keyframes toast-in {
		from {
			opacity: 0;
			transform: translateX(16px) scale(0.96);
		}
		to {
			opacity: 1;
			transform: translateX(0) scale(1);
		}
	}

	.toast-success .toast-icon {
		color: #2d6a4f;
	}
	.toast-error .toast-icon {
		color: var(--danger);
	}
	.toast-info .toast-icon {
		color: var(--accent);
	}

	.toast-message {
		flex: 1;
		margin: 0;
	}

	.toast-close {
		flex-shrink: 0;
		color: var(--text-muted);
		display: flex;
		align-items: center;
		transition: color 140ms ease;
	}
	.toast-close:hover {
		color: var(--text);
	}
</style>
