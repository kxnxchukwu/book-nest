<script lang="ts">
	import { Button } from '$components';

	interface AuthActionData {
		success?: boolean;
		errors?: string[];
		email?: string;
		password?: string;
		name?: string;
		passwordConfirmation?: string;
	}

	interface ComponentProps {
		isRegistration: boolean;
		form: AuthActionData | null | undefined;
	}

	let { isRegistration, form }: ComponentProps = $props();
</script>

<div class="auth-wrapper">
	<div class="auth-header">
		<p class="app-label">Book Nest</p>
		<h1>{isRegistration ? 'Create an account' : 'Welcome back'}</h1>
		<p class="subtitle">
			{isRegistration ? 'Sign up to get started' : 'Sign in to your account to continue'}
		</p>
	</div>

	<form class="auth-form" method="POST" action={isRegistration ? '' : '?/signInWithPassword'}>
		{#if form?.errors?.length}
			<div class="errors">
				{#each form.errors as error, index (index)}
					<div class="auth-error"><p>{error}</p></div>
				{/each}
			</div>
		{/if}

		{#if isRegistration}
			<div class="field">
				<label for="name">Name</label>
				<input id="name" type="text" name="name" placeholder="Jane Doe" value={form?.name || ''} />
			</div>
		{/if}

		<div class="field">
			<label for="email">Email</label>
			<input
				id="email"
				type="email"
				name="email"
				placeholder="you@example.com"
				value={form?.email || ''}
			/>
		</div>

		<div class="field">
			{#if isRegistration}
				<label for="password">Password</label>
			{:else}
				<div class="field-header">
					<label for="password">Password</label>
				</div>
			{/if}
			<input
				id="password"
				type="password"
				name="password"
				placeholder="••••••••"
				value={form?.password || ''}
			/>
		</div>

		{#if isRegistration}
			<div class="field">
				<label for="passwordConfirmation">Confirm password</label>
				<input
					id="passwordConfirmation"
					type="password"
					name="passwordConfirmation"
					placeholder="••••••••"
					value={form?.passwordConfirmation || ''}
				/>
			</div>
		{/if}

		<Button type="submit">{isRegistration ? 'Create account' : 'Sign in'}</Button>
	</form>

	<div class="divider"><span>or</span></div>

	<form method="POST" action={isRegistration ? '/login/?/googleLogin' : '?/googleLogin'}>
		<Button type="submit" isOutline fullWidth>Continue with Google</Button>
	</form>

	<p class="auth-hint">
		{#if isRegistration}
			Already have an account? <a href="/login">Sign in</a>
		{:else}
			Don't have an account? <a href="/register">Register</a>
		{/if}
	</p>
</div>

<style>
	.auth-wrapper {
		max-width: 420px;
		margin: 80px auto 0;
		padding: 0 1rem;
	}

	.auth-header {
		margin-bottom: 2.5rem;
	}

	.app-label {
		font-size: 13px;
		font-weight: 500;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: grey;
		margin: 0 0 8px;
	}

	h1 {
		font-size: 28px;
		font-weight: 500;
		margin: 0 0 6px;
		line-height: 1.2;
	}

	.subtitle {
		font-size: 14px;
		color: grey;
		margin: 0;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 1.5rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.field-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	label {
		font-size: 13px;
		color: grey;
	}

	input {
		width: 100%;
		box-sizing: border-box;
	}

	.errors {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 4px;
	}

	.auth-error {
		background-color: rgb(122, 35, 35);
		color: white;
		font-size: 14px;
		border-radius: 8px;
		padding: 10px 12px;
	}

	.auth-error p {
		margin: 0;
	}

	.divider {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 1rem 0;
		color: grey;
		font-size: 12px;
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: #e5e5e5;
	}

	.auth-hint {
		font-size: 13px;
		color: grey;
		text-align: center;
		margin-top: 1.5rem;
	}

	.auth-hint a {
		color: inherit;
		border-bottom: 1px solid currentColor;
		text-decoration: none;
	}
</style>
