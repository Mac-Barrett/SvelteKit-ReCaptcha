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
<script>
    import { ReCaptcha } from '@mac-barrett/svelte-recaptcha';

    let SITE_KEY = // your environment variable goes here
</script>

<ReCaptcha {SITE_KEY} on:captchaTokenRecieved={captchaTokenRecieved}/>
```
# Verifying Captcha Responses Client-Side:
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

<ReCaptcha SITE_KEY={SITE_KEY} on:captchaTokenRecieved={captchaTokenRecieved}/>
```

2. You may also choose to reset the token in the case of data expiration or other Captcha errors. In these cases you can use the `on:captchaReset` dispatch to do so.
```svelte
<ReCaptcha SITE_KEY={SITE_KEY}
    CaptchaStyle={{theme: 'dark', size: 'compact'}}
    on:captchaTokenRecieved={captchaTokenRecieved}
    on:captchaReset={captchaReset}
/>
```
3. Note the CaptchaStyle property, there aren't many ways to style Google's captcha widget but you are able to do so via this property.

# Verifying Captcha Responses Server-Side
1. As shown, make sure to save the captcha token from the captchaTokenRecieved event.
2. Send the captcha token with the body of your HTTP request for the final validation test.
3. In your server endpoint, make an API call to google's recaptcha service to verify that the token the server recieved from the client is the same one that google sent to the client's browser. Your endpoint ought to end up looking something like this:
4. I think sending the host might be optional; however, you might as well send that as well.

```ts
const SECRET_KEY = [--SECRET KEY env variable--]

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
# Component Properties & Events:
```svelte
<ReCaptcha 
    SITE_KEY
    CaptchaStyle
    on:captchaTokenRecieved
    on:captchaReset
/>
```
#### Properties:
```ts
// The SITE_KEY associated with your domain
export var SITE_KEY: string;

// Used to style the widget
export var CaptchaStyle: {
    theme: 'light'|'dark', 
    size: 'normal'|'compact'
}
```
#### Events:
```ts
dispatch('captchaTokenRecieved', { token });
```
Catch this event in the parent component with `on:captchaTokenRecieved`.  
event.detail.token contains the token recieved from the server upon successful completion of the Captcha.
```ts 
dispatch('captchaReset');
```
Catch this event in the parent component with `on:captchaReset`.
Use this event to reset any necessaries values/elements or what have you if you'd like, but isn't necessary

---

That's all there is to know! If there are issues please let me know.