<script lang="ts">
	import bookNestLogo from '$assets/app-logo.svg';
	import Button from '$components/Button.svelte';
	import { getUserState } from '$lib/state/user-state.svelte';

	let userContext = getUserState();

	let { user, userName } = $derived(userContext);
</script>

<header>
	<a href={user ? '/private/dashboard' : '/'} aria-label="Book Nest logo, click to go to home">
		<img class="logo" src={bookNestLogo} alt="Book Nest logo" />
	</a>
	<nav>
		{#if !user}
			<ul>
				<Button isMenu href="/register">Create Account</Button>
				<Button isMenu isSecondary href="/login">Login</Button>
			</ul>
		{:else}
			<ul>
				<li>{userName}</li>
				<li><Button isMenu onclick={() => userContext.logout()}>Logout</Button></li>
			</ul>
		{/if}
	</nav>
</header>

<style>
	header {
		align-items: center;
		display: flex;
		justify-content: space-between;
		padding: 12px 4vw;
	}

	ul {
		align-items: center;
		column-gap: 24px;
		display: flex;
	}

	.logo {
		height: 72px;
	}
</style>
