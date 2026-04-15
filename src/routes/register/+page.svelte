<script>
	import { AuthForm } from '$components/index.svelte';
	let { form } = $props();
</script>

<AuthForm isRegistration={true} {form} />
