## Notes: 
- This has only really been tested inside of SvelteKit
- This component uses reCaptcha v2, which is the checkbox widget
- Please follow the tutorial steps for client & server validation below, it will explain how to use this component in pretty good detail.

## Initial setup:
1. Install the npm package:
```bash
npm i @mac-barrett/svelte-recaptcha
```

2. Go to Google's captcha service and grab a SITE_KEY & a SECRET_KEY for use in the ReCaptcha widget. You can do so here: http://www.google.com/recaptcha/admin
3. Set these keys up as .env variables so you're not hosting them anywhere malicous users can see them. The site key is for your browser pages while the secret key is for your server or endpoint to validate the captcha token.
4. Import the ReCaptcha component & insert it into your HTML body:

```svelte
<script>
    import { ReCaptcha } from '@mac-barrett/svelte-recaptcha';

    let SITE_KEY = // your environment variable goes here
</script>

<SvelteRecaptcha SITE_KEY={SITE_KEY} on:captchaTokenRecieved={captchaTokenRecieved}/>
```

## Verifying Captcha Responses Client-Side:
1. Once the Captcha test is successfully completed, the component will dispatch the captchaTokenRecieved method which the parent can use to save the token as follows:

```svelte
<script>
    import { ReCaptcha } from '@mac-barrett/svelte-recaptcha';

    let SITE_KEY = [your environment variable goes here]

    let captchaToken: string|null = null;
    const captchaTokenRecieved = (event: { detail: { token: any; }; }) => {
        captchaToken = event.detail.token;
    }
</script>
```

3. You may also choose to reset the token in the case of data expiration or other Captcha errors. In these cases you can use the on:captchaReset dispatch to do so.

## Verifying Captcha Responses Server-Side
1. As shown, make sure to save the captcha token from the captchaTokenRecieved event.
2. Send the captcha token with the body of your HTTP request for the final validation test.
3. In your server endpoint, make an API call to google's recaptcha service to verify that the token the server recieved from the client is the same one that google sent to the client's browser. Your endpoint ought to end up looking something like this:

```ts
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
    // Captcha is verified, now you may handle the request as you normally would


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
```

## All Props & Events
Props:
```ts
// Pass your environment variable SITE_KEY into the component here
export var SITE_KEY: string;

// Optional CaptchaStyle props
export var CaptchaStyle = {
    theme: "light" or "dark",
    size: "normal" or "compact"
}
```
Events:
```ts
on:captchaTokenRecieved 
// event.detail.token contains the captcha token recieved from Google's captcha service
// make sure to save this token and send it with the HTTP request

on:captchaReset 
// use this event to reset your controls or your token if you don't want people to be able to advance without completing the captcha.
// it doesn't really need to be done however, as if you make a request with a bad token your server shouldn't proceed.
```
That's all there is to know! If there are issues please let me know.
