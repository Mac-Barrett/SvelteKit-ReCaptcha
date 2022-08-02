<script lang="ts">
    import { onMount } from "svelte";
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    /** SITE_KEY From google */
    export var SITE_KEY: string;

    /** Style Props: { theme: 'light' or 'dark', size: 'normal' or 'compact' } */
    export var CaptchaStyle = {
        theme: 'light',
        size: 'normal'
    }
    let captchaError: string = "";

    /** Attaches the hooks to the window when the component mounts to the DOM */
     onMount(() => {
        window.onDataRecievedHook = onDataRecievedHook;
        window.onDataExpiredHook = onDataExpiredHook;
        window.onCaptchaError = onCaptchaError;
        window.resetCaptcha = resetCaptcha;
        grecaptcha.reset();
    });

    /**
     * Fired when the captcha returns with a good response from the API. Dispatches the captchaTokenRecieved signal. 
     * @param token Token from the reCaptcha API
     */
    const onDataRecievedHook = async (token: string) => {
        dispatch('captchaTokenRecieved', { token });
    };

    /**
     * Fires when the captcha's data expires and the user needs to be re-validated
     */
    const onDataExpiredHook = () => {
        resetCaptcha();
    }

    /**
     * Fires when the captcha encounters an error--typically network connectivity.
     */
    const onCaptchaError = () => {
        captchaError = 'Recaptcha error. Please reload the page';
        dispatch('captchaReset');
	};

    /**
     * Resets the captcha widget, you may choose to use the dispatch here to so that the parent can reset the captcha token.
     */
    const resetCaptcha = () => {
        window.grecaptcha.reset();
        dispatch('captchaReset');
    };
</script>

<svelte:head>
    <script src="https://www.google.com/recaptcha/api.js" async defer></script>
</svelte:head>

{#if captchaError != ""}
<p>{captchaError}</p>
{:else}
<div class="g-recaptcha" 
    data-sitekey={SITE_KEY} 
    data-theme={CaptchaStyle.theme}
    data-size={CaptchaStyle.size}
    data-callback="onDataRecievedHook"
    data-expired-callback="onDataExpiredHook">
</div>
{/if}