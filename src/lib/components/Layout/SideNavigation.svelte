<script lang="ts">
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';
</script>

<!-- Desktop sidebar -->
<nav class="side-nav">
	<ul>
		<li>
			<a href="/private/dashboard" class="nav-link" aria-label="Library">
				<Icon icon="ion:library-outline" width="22" />
				<span class="nav-label">Library</span>
			</a>
		</li>
		<li>
			<a href="/private/scan-shelf" class="nav-link" aria-label="Scan">
				<Icon icon="solar:eye-scan-linear" width="22" />
				<span class="nav-label">Scan</span>
			</a>
		</li>
		<li>
			<a href="/private/settings" class="nav-link" aria-label="Settings">
				<Icon icon="ion:settings-outline" width="22" />
				<span class="nav-label">Settings</span>
			</a>
		</li>
	</ul>
</nav>

<!-- Mobile bottom bar -->
<nav class="bottom-nav" aria-label="Main navigation">
	<a href="/private/dashboard" class="bottom-link" aria-label="Library">
		<Icon icon="ion:library-outline" width="24" />
		<span>Library</span>
	</a>
	<a href="/private/scan-shelf" class="bottom-link" aria-label="Scan">
		<Icon icon="solar:eye-scan-linear" width="24" />
		<span>Scan</span>
	</a>
	<a href="/private/settings" class="bottom-link" aria-label="Settings">
		<Icon icon="ion:settings-outline" width="24" />
		<span>Settings</span>
	</a>
</nav>

<style>
	/* ── Sidebar (tablet+) ─────────────────── */
	.side-nav {
		display: none;
		width: 72px;
		flex-shrink: 0;
		height: calc(100vh - 64px);
		position: sticky;
		top: 64px;
		border-right: 1px solid var(--border);
		padding: 24px 0;
		background: var(--bg);
		transition: background-color 160ms ease;
		overflow: hidden;
	}

	@media (min-width: 768px) {
		.side-nav {
			display: flex;
			flex-direction: column;
		}
	}

	@media (min-width: 1024px) {
		.side-nav {
			width: 200px;
		}
	}

	.side-nav ul {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 0 8px;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 12px;
		border-radius: var(--r-md, 10px);
		color: var(--text-muted);
		font-size: 0.9rem;
		font-weight: 500;
		transition:
			background 160ms ease,
			color 160ms ease;
		white-space: nowrap;
	}

	.nav-link:hover {
		background: var(--bg-muted);
		color: var(--text);
	}

	.nav-label {
		display: none;
	}

	@media (min-width: 1024px) {
		.nav-label {
			display: block;
		}
	}

	/* ── Bottom bar (mobile) ───────────────── */
	.bottom-nav {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: space-around;
		background: var(--bg-card);
		border-top: 1px solid var(--border);
		z-index: 99;
		padding-bottom: env(safe-area-inset-bottom);
		transition: background-color 160ms ease;
	}

	@media (min-width: 768px) {
		.bottom-nav {
			display: none;
		}
	}

	.bottom-link {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		color: var(--text-muted);
		font-size: 0.68rem;
		font-weight: 500;
		padding: 6px 16px;
		border-radius: var(--r-md, 10px);
		transition: color 160ms ease;
		text-decoration: none;
	}

	.bottom-link:hover {
		color: var(--text);
	}
</style>
