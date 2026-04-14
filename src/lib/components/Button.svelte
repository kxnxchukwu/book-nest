<script lang="ts">
	import type { Snippet } from 'svelte';

	interface BaseProps {
		children: Snippet;
		isSecondary?: boolean;
		isDanger?: boolean;
		isMenu?: boolean;
		isOutline?: boolean;
		fullWidth?: boolean;
	}
	interface ButtonProps extends BaseProps {
		onclick?: (event: MouseEvent) => void;
		href?: never;
		type?: 'submit' | 'button';
	}
	interface LinkProps extends BaseProps {
		href: string;
		onclick?: never;
		type?: never;
	}
	type ComponentProps = ButtonProps | LinkProps;

	let {
		children,
		isDanger = false,
		isSecondary = false,
		isMenu = false,
		fullWidth = false,
		isOutline = false,
		href,
		onclick,
		type = 'button',
		...rest
	}: ComponentProps = $props();

	// Build class string manually to avoid Svelte scoping issues with spread
	let classes = $derived(
		[
			'btn',
			isSecondary ? 'btn-secondary' : '',
			isDanger ? 'btn-danger' : '',
			isMenu ? 'btn-menu' : '',
			fullWidth ? 'full-width' : '',
			isOutline ? 'btn-outline' : ''
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

{#if href != null}
	<!-- Link variant — never pass type or onclick to <a> -->
	<a {href} class={classes}>
		{@render children()}
	</a>
{:else}
	<!-- Button variant -->
	<button {type} {onclick} class={classes} {...rest}>
		{@render children()}
	</button>
{/if}

<style>
	a {
		text-decoration: none !important;
		display: inline-flex;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 11px 24px;
		min-width: 100px;
		border-radius: var(--r-md, 10px);
		font-family: 'DM Sans', sans-serif;
		font-size: 0.9rem;
		font-weight: 500;
		letter-spacing: 0.01em;
		cursor: pointer;
		border: 1.5px solid transparent;
		transition:
			background 160ms ease,
			color 160ms ease,
			border-color 160ms ease,
			box-shadow 160ms ease,
			transform 100ms ease;
		white-space: nowrap;
		text-decoration: none;

		/* Primary default */
		background: var(--accent);
		color: var(--text-inv);
		border-color: var(--accent);
	}

	.btn:hover {
		filter: brightness(1.12);
		box-shadow: var(--shadow-sm);
		transform: translateY(-1px);
	}

	.btn:active {
		transform: translateY(0);
		filter: brightness(0.97);
	}

	/* Secondary */
	.btn-secondary {
		background: var(--bg-card);
		color: var(--text);
		border-color: var(--border-strong);
	}
	.btn-secondary:hover {
		background: var(--bg-muted);
		filter: none;
		transform: translateY(-1px);
	}

	/* Danger */
	.btn-danger {
		background: var(--danger);
		color: #fff;
		border-color: var(--danger);
	}
	.btn-danger:hover {
		background: var(--danger-hover);
		filter: none;
		transform: translateY(-1px);
	}

	/* Outline */
	.btn-outline {
		background: transparent;
		color: var(--text);
		border-color: var(--border-strong);
	}
	.btn-outline:hover {
		background: var(--bg-muted);
		filter: none;
	}

	/* Menu (compact header size) */
	.btn-menu {
		min-width: 0;
		padding: 7px 16px;
		font-size: 0.85rem;
	}

	.full-width {
		width: 100%;
	}
</style>
