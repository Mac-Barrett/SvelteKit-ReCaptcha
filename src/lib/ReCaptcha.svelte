<script lang="ts">
    import { onMount } from "svelte";

    /** SITE_KEY From google */
    export let SITE_KEY: string;
    /** Styles the captcha widget */
    export let captchaStyle: {theme?: 'light'|'dark', size?:'normal'|'compact'} = {
        theme: 'light',
        size: 'normal'
    }
    /** Returns the capthca's token if it has one. If no response it returns an empty string */
    export const getRecaptchaResponse = (): string => {
        return grecaptcha.getResponse();
    }

    let captchaError: string = "";

    /** Mounts captcha I guess? */
     onMount(() => {
        grecaptcha.reset();
    });
</script>

<svelte:head>
    <script src="https://www.google.com/recaptcha/api.js" async defer></script>
</svelte:head>

{#if captchaError != ""}
<p>
    Captcha error... {captchaError}
</p>
{:else}
<div class="g-recaptcha" 
    data-sitekey={SITE_KEY} 
    data-theme={captchaStyle.theme}
    data-size={captchaStyle.size}>
</div>
{/if}

