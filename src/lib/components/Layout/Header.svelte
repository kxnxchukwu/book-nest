<script lang="ts">
	import bookNestLogo from '$assets/app-logo.svg';
	import Button from '$components/Button.svelte';
</script>

<header>
	<a href="/" aria-label="Book Nest logo, click to go to home">
		<img class="logo" src={bookNestLogo} alt="Book Nest logo" />
	</a>
	<nav>
		<ul>
			<Button isMenu href="/register">Create Account</Button>
			<Button isMenu isSecondary href="/login">Login</Button>
		</ul>
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
		display: flex;
		column-gap: 24px;
	}

	.logo {
		height: 72px;
	}
</style>
