<!-- ReCaptcha.svelte abstracts some of the complexity away from using Google's ReCaptcha API. The following documentation details how exactly to get this component working

NOTE: This has only really been tested inside of SvelteKit

Setting this component up in the source code:
    1 - install the grecaptcha npm package: (you're probably going to have to reload VS Code for the squigglys to go away)

        npm i --save-dev @types/grecaptcha

    2 - Insert this Component into your HTML Form

    <SvelteRecaptcha SITE_KEY={SITE_KEY} on:captchaTokenRecieved={captchaTokenRecieved}/>

    3 - Create a file in src/types named index.d.ts and paste the following block:
        (From my understanding the recaptcha component from google attaches its events to the window, so this is how we can grab these hooks)

    export {};

    declare global {
        interface Window {
            onDataRecievedHook: (token: string) => Promise<void>;
            onDataExpiredHook: () => void;
            onCaptchaError: () => void;
            resetCaptcha: () => void;
        }
    }

    4 - Go to google's ReCaptcha Page and secure a SITE_KEY & SECRET_KEY for your site.
    5 - Set up your SITE & SECRET KEYS as env variables

Verifying Captcha Responses Client-Side:
    1 - SITE_KEY is for use in the client-side broser: this component uses the SITE_KEY to secure a token from googles catpcha API
    2 - From the parent component you may now use the on:captchaTokenRecieved dispatch to do stuff once the token is recieved (e.g. save that token and/or submit)

    const captchaTokenRecieved = (event: { detail: { token: any; }; }) => {
        formData.token = event.detail.token;
    }

    3 - You may also choose to reset the token in the case of data expiration: in this case dispatch an event from the resetCaptcha callback & reset the parent component's captcha token.

Verifying Captcha Responses Server-Side
    1 - Make sure that you've saved the token from the on:captchaTokenRecieved dispatch
    2 - In your server endpoint, make an API call to google's recaptcha service to verify that the token the server recieved from the client is the same one that google sent to the client's browser. Your endpoint ought to end up looking something like this:

    const SECRET_KEY = [--SECRET KEY env variable--]

    export const POST: RequestHandler = async ({ request }) => {
        const { formData } = await request.json();
        const CaptchaResponse = await verifyCaptcha([--client's captcha validation token--], [--your domain name--]); // Domain name for local host is localhost:[--port--]
        if (!CaptchaResponse) {
            return {
                status: 400,
                body: 'ReCaptcha Failed to authorize on server, please try again'
            }
        }
        // [Captcha is verified, now you may handle the request as normal]
        return {
            status: 200,
            body: 'Captcha Verified, success or what have you'
        }
    }

    /**
     * Calls the captcha API endpoint, returns true if captcha is succesful
     * 
     * @param token ReCaptcha Token from the client
     * @param host URL of the site making the request
     * @returns Promise containing captcha's success status
     */
     async function verifyCaptcha(token: string, host: string): Promise<boolean> {
        const res = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${token}&remoteip=${host}`, { method: 'POST' });
    
        const data: { success: boolean; } = await res.json();
        return data.success;
    }

    3 - If you've done everything correctly, this should be working perfectly. The hooks inside of this component can be edited if you so choose to provide further functionality to the component; however, that is up to you to decide how it is implemented. There is further function documentation inside this component, and if you have any other issues the docs are actually somewhat informative: https://developers.google.com/recaptcha/docs/display
-->

<script lang="ts">
import { goto } from "$app/navigation";

    import { onMount } from "svelte";
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export var SITE_KEY: string;
    let captchaError: string = "";

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
	};

    /**
     * Resets the captcha widget, you may choose to dispatch event here to so that the parent can reset the captcha token.
     */
    const resetCaptcha = () => {
        // dispatch('captchaReset');
        window.grecaptcha.reset();
    };

    /**
     * Attaches the hooks to the window when the component mounts to the DOM
     */
    onMount(() => {
        window.onDataRecievedHook = onDataRecievedHook;
        window.onDataExpiredHook = onDataExpiredHook;
        window.onCaptchaError = onCaptchaError;
        window.resetCaptcha = resetCaptcha;
        grecaptcha.reset();
    });
</script>

<svelte:head>
    <script src="https://www.google.com/recaptcha/api.js" async defer></script>
</svelte:head>

{#if captchaError != ""}
<p>{captchaError}</p>
{:else}
<!-- data-theme: light|dark -->
<!-- data-size: normal|compact -->
<div class="g-recaptcha" 
    data-sitekey={SITE_KEY} 
    data-theme="dark"
    data-size="normal"
    data-callback="onDataRecievedHook"
    data-expired-callback="onDataExpiredHook">
</div>
{/if}