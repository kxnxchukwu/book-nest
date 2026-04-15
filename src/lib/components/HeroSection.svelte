<script lang="ts">
	import heroImage from '$assets/hero.png';
	import { Button } from '$components/index.svelte';
</script>

<section class="hero">
	<div class="hero-text">
		<p class="hero-eyebrow">Your personal book library</p>
		<h1 class="hero-title">Every book you<br /><em>own, read & love.</em></h1>
		<p class="hero-body">
			Book Nest is a beautifully designed digital library. Track what you've read, discover what you
			love, and keep every book close.
		</p>
		<div class="hero-cta">
			<Button href="/register">Get started — it's free</Button>
			<Button isSecondary href="/login">Sign in</Button>
		</div>
	</div>

	<div class="hero-image-wrap">
		<img src={heroImage} alt="Desk with lamp and stacked books" />
		<div class="hero-image-glow"></div>
	</div>
</section>

<style>
	.hero {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 40px;
		padding: clamp(48px, 8vw, 96px) clamp(1rem, 6vw, 5rem);
		max-width: 1280px;
		margin: 0 auto;
	}

	.hero-text {
		flex: 1;
		min-width: 0;
		max-width: 580px;
	}

	.hero-eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 0.78rem;
		font-weight: 600;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		color: var(--accent-mid);
		margin-bottom: 20px;
	}

	.hero-eyebrow::before {
		content: '';
		display: block;
		width: 24px;
		height: 1.5px;
		background: var(--accent-mid);
	}

	.hero-title {
		font-size: clamp(2.4rem, 5.5vw, 4.2rem);
		line-height: 1.1;
		margin-bottom: 24px;
		letter-spacing: -0.02em;
	}

	.hero-title em {
		font-style: italic;
		color: var(--accent-mid);
	}

	.hero-body {
		font-size: 1.05rem;
		color: var(--text-muted);
		line-height: 1.7;
		max-width: 440px;
		margin-bottom: 36px;
	}

	.hero-cta {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		align-items: center;
	}

	.hero-image-wrap {
		position: relative;
		flex: 0 0 auto;
		width: clamp(260px, 38%, 480px);
	}

	.hero-image-wrap img {
		width: 100%;
		border-radius: var(--r-xl, 28px);
		box-shadow: var(--shadow-lg);
		object-fit: cover;
		aspect-ratio: 4/5;
	}

	.hero-image-glow {
		position: absolute;
		inset: -20px;
		background: radial-gradient(ellipse at center, var(--accent-glow) 0%, transparent 70%);
		z-index: -1;
		border-radius: 50%;
		filter: blur(20px);
	}

	/* Stack on mobile */
	@media (max-width: 767px) {
		.hero {
			flex-direction: column-reverse;
			text-align: center;
			padding-top: 32px;
		}

		.hero-eyebrow {
			justify-content: center;
		}
		.hero-body {
			margin: 0 auto 28px;
		}
		.hero-cta {
			justify-content: center;
		}
		.hero-image-wrap {
			width: min(320px, 90%);
		}
	}
</style>
