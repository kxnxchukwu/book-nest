<script lang="ts">
	import bookNestLogo from '$assets/app-logo.svg';
	import { Button } from '$components';
	import { getUserState } from '$lib/state/user-state.svelte';
	import { browser } from '$app/environment';

	let userContext = getUserState();

	// Access reactive class properties directly — never destructure Svelte 5 reactive classes
	let user = $derived(userContext.user);
	let userName = $derived(userContext.userName);

	// Dark mode — read saved preference on mount
	let isDark = $state(false);

	$effect(() => {
		if (!browser) return;
		const saved = localStorage.getItem('theme');
		isDark = saved === 'dark';
		document.documentElement.setAttribute('data-theme', isDark ? 'dark' : '');
	});

	function toggleTheme() {
		isDark = !isDark;
		if (browser) {
			document.documentElement.setAttribute('data-theme', isDark ? 'dark' : '');
			localStorage.setItem('theme', isDark ? 'dark' : 'light');
		}
	}
</script>

<header>
	<a class="logo-link" href={user ? '/private/dashboard' : '/'} aria-label="Book Nest home">
		<img class="logo" src={bookNestLogo} alt="Book Nest logo" />
		<span class="logo-text">Book Nest</span>
	</a>

	<div class="header-right">
		<button
			class="theme-toggle"
			onclick={toggleTheme}
			aria-label="Toggle dark mode"
			title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
		>
			{#if isDark}
				<!-- Sun icon -->
				<svg
					width="17"
					height="17"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="5" />
					<line x1="12" y1="1" x2="12" y2="3" />
					<line x1="12" y1="21" x2="12" y2="23" />
					<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
					<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
					<line x1="1" y1="12" x2="3" y2="12" />
					<line x1="21" y1="12" x2="23" y2="12" />
					<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
					<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
				</svg>
			{:else}
				<!-- Moon icon -->
				<svg
					width="17"
					height="17"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
				</svg>
			{/if}
		</button>

		<nav>
			{#if !user}
				<ul>
					<li><Button isMenu href="/register">Sign up</Button></li>
					<li><Button isMenu isSecondary href="/login">Login</Button></li>
				</ul>
			{:else}
				<ul>
					{#if userName}
						<li class="user-name">{userName}</li>
					{/if}
					<li>
						<Button isMenu isSecondary onclick={() => userContext.logout()}>Logout</Button>
					</li>
				</ul>
			{/if}
		</nav>
	</div>
</header>

<style>
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 clamp(1rem, 4vw, 2.5rem);
		height: 64px;
		background: var(--bg);
		border-bottom: 1px solid var(--border);
		position: sticky;
		top: 0;
		z-index: 100;
		transition:
			background-color 160ms ease,
			border-color 160ms ease;
	}

	.logo-link {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
	}

	.logo {
		height: 36px;
		width: auto;
	}

	.logo-text {
		font-family: 'Fraunces', serif;
		font-size: 1.15rem;
		font-weight: 500;
		color: var(--text);
		display: none;
	}

	@media (min-width: 480px) {
		.logo-text {
			display: block;
		}
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.theme-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: var(--r-md, 10px);
		color: var(--text-muted);
		background: var(--bg-subtle);
		border: 1.5px solid var(--border);
		cursor: pointer;
		transition:
			color 160ms ease,
			background 160ms ease,
			border-color 160ms ease;
		flex-shrink: 0;
	}

	.theme-toggle:hover {
		color: var(--text);
		background: var(--bg-muted);
		border-color: var(--border-strong);
	}

	nav ul {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.user-name {
		font-size: 0.875rem;
		color: var(--text-muted);
		font-weight: 500;
		display: none;
		padding: 0 4px;
	}

	@media (min-width: 560px) {
		.user-name {
			display: block;
		}
	}
</style>
