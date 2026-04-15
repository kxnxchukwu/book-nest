<script>
	import { SideNavigation } from '$components';
	let { children } = $props();
</script>

<div class="app-shell">
	<SideNavigation />
	<main class="main-area">
		{@render children()}
	</main>
</div>

<style>
	.app-shell {
		display: flex;
		min-height: calc(100vh - 64px);
	}

	.main-area {
		flex: 1;
		min-width: 0;
		padding: clamp(24px, 4vw, 48px) clamp(16px, 4vw, 48px);
		padding-bottom: calc(clamp(24px, 4vw, 48px) + env(safe-area-inset-bottom));
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	/* Constrain all direct children to a readable max-width */
	.main-area > :global(*) {
		width: 100%;
		max-width: 1100px;
	}

	@media (max-width: 767px) {
		.main-area {
			padding-bottom: calc(80px + env(safe-area-inset-bottom));
		}
	}
</style>
