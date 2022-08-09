<script lang="ts">
    import { onMount } from "svelte";

    /** SITE_KEY From google */
    export var SITE_KEY: string;
    /** Styles the captcha widget */
    export var captchaStyle: {theme?: 'light'|'dark', size?:'normal'|'compact'} = {
        theme: 'light',
        size: 'normal'
    }
    /** Returns the status of this captcha Component */
    export function getRecaptchaResponse(): string {
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

<!-- @component
A ReCaptcha widget Svelte component.  
Bind this element to a variable and use it's getRecaptchaResponse method to grab the Captcha token.
#### Properties:
```ts
// The SITE_KEY associated with your domain
export var SITE_KEY: string;

// Used to style the widget
export var captchaStyle: {theme?: 'light'|'dark', size?:'normal'|'compact'} = {
    theme: 'light',
    size: 'normal'
}
```
#### Functions:
```ts
/** Returns the capthca's token if it has one. If no response it returns an empty string */
export function getRecaptchaResponse(): string {
    return grecaptcha.getResponse();
}
``` 
-->