# Svelte Kit ReCaptcha Component: 
- This component uses Google's v2 Captcha widget, which sends the user an 'I am not a robot' challenge.

## Things to note 
- This has only really been tested inside of SvelteKit, I'm not sure if this works outside of that Framework
- Please follow the tutorial steps for client & server validation below, it will explain how to use this component in pretty good detail.

# Initial setup:
1. Install the npm package:
```bash
npm i @mac-barrett/svelte-recaptcha
```
2. Go to Google's captcha service and grab a SITE_KEY & a SECRET_KEY for use in the ReCaptcha widget. You can do so here: http://www.google.com/recaptcha/admin
    - Note that these keys are associated with your domain name, so if you want to use this on multiple sites you must acquire more keys.
3. Set these keys up as .env variables so you're not hosting them anywhere malicous users can see them. The site key is for your browser pages while the secret key is for your server or endpoint to validate the captcha token.
4. Import the ReCaptcha component & insert it into your HTML body:

```svelte
<script lang="ts">
    import { ReCaptcha } from '@mac-barrett/svelte-recaptcha';

    let SITE_KEY = // your environment variable goes here
    let Captcha: ReCaptcha;
</script>

<ReCaptcha bind:this={Captcha} { SITE_KEY } captchaStyle={{theme: 'dark', size: 'compact'}}/>
```
# Verifying Captcha Responses Client-Side:
1. Bind the Captcha Element to a variable in your script tag & pass the SITE_KEY variable into the component as well as shown above.
2. After completing the Captcha, you can get the token from the captcha widget by using the exported function `getRecaptchaResponse()`.

```ts
formData.token = Captcha.getRecaptchaResponse();
if (formData.token.length === 0) {
    return;
}
```

# Verifying Captcha Responses Server-Side
1. Make sure to send the token from `Captcha.getRecaptchaResponse()` along with any other formData you're sending to your server.
2. In your server endpoint, make an API call to google's recaptcha service to verify that the token the server recieved from the client is the same one that google sent to the client's browser. Your endpoint ought to end up looking something like this:

```ts
const SECRET_KEY = // your environment variable goes here

export const POST: RequestHandler = async ({ request }) => {
    const { formData } = await request.json();

    // First arg is token from the captcha, second arg is your site's URL
    // Yes you may use localhost
    const CaptchaResponse = await verifyCaptcha(formData.token, 'localhost:8080');
    if (!CaptchaResponse) {
        return {
            status: 400,
            body: 'ReCaptcha Failed to authorize on server, please try again'
        }
    }
    /* Captcha is verified, now you may handle the request as you normally would
        Do stuff
        Do other stuff...
    */
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
# Component Properties & Events:
```svelte
<ReCaptcha SITE_KEY captchaStyle/>
```
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
- Bind the component to a variable in your script tag to use exported methods.
```ts
/** Returns the captcha's token if it has one. If no response it returns an empty string */
export function getRecaptchaResponse(): string {
    return grecaptcha.getResponse();
}
```

---

That's all there is to know! If there are issues please let me know.