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
	}

	type ComponentProps = ButtonProps | LinkProps;

	let {
		children,
		isDanger,
		isSecondary,
		isMenu,
		fullWidth,
		isOutline,
		href,
		onclick,
		...rest
	}: ComponentProps = $props();
</script>

{#if href}
	<a
		{href}
		{...rest}
		class="btn"
		class:btn-secondary={isSecondary}
		class:btn-danger={isDanger}
		class:btn-menu={isMenu}
	>
		{@render children()}
	</a>
{:else}
	<button
		{...rest}
		{onclick}
		class="btn"
		class:btn-secondary={isSecondary}
		class:btn-danger={isDanger}
		class:btn-menu={isMenu}
		class:full-width={fullWidth}
		class:btn-outline={isOutline}
	>
		{@render children()}
	</button>
{/if}

<style>
	a {
		text-decoration: none;
		display: block;
	}

	a:hover {
		text-decoration: none;
	}

	.btn {
		padding: 12px 24px;
		min-width: 230px;
		text-align: center;
		background-color: black;
		border-radius: 12px;
		color: white;
		border: 1px solid white;
		font-weight: normal;
		font-size: 22px;
	}

	.btn-secondary {
		background-color: white;
		color: black;
		border: 1px solid black;
	}

	.btn-danger {
		background-color: rgb(136, 4, 4);
	}

	.btn-menu {
		min-width: 150px;
		padding: 8px 20px;
	}

	.full-width {
		width: 100%;
	}

	.btn-outline {
		background: transparent;
		border: 1px solid currentColor;
		color: inherit;
	}
</style>
