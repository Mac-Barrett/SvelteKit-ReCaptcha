## About 
NOTE: This has only really been tested inside of SvelteKit
NOTE: This uses reCaptcha v2, which is the checkbox

## Initial setup:
0. The easiest way to setup this for your project is to simply copy & paste the Code for the Captcha component from this project, so do that first...
1. Install the grecaptcha npm package: (you're probably going to have to reload VS Code for the squigglys to go away)


```bash
npm i --save-dev @types/grecaptcha
```


2. Insert this Component into your HTML Form


```svelte
<SvelteRecaptcha SITE_KEY={SITE_KEY} on:captchaTokenRecieved={captchaTokenRecieved}/>
```


3. Create a file in src/types named index.d.ts and paste the following block: (From my understanding the recaptcha component from google attaches it's events to the window, so this is how we can grab these hooks)


```ts
export {};

declare global {
    interface Window {
        onDataRecievedHook: (token: string) => Promise<void>;
        onDataExpiredHook: () => void;
        onCaptchaError: () => void;
        resetCaptcha: () => void;
    }
}
```


4. Go to google's ReCaptcha Page and secure a SITE_KEY & SECRET_KEY for your site & set them up as environment variables.
5. Finally, bind the SITE_KEY for the ReCaptcha component to your environment variable in your script

## Verifying Captcha Responses Client-Side:
1. SITE_KEY is for use in the client-side broser: this component uses the SITE_KEY to secure a token from googles catpcha API
2. From the parent component you may now use the on:captchaTokenRecieved dispatch to do stuff once the token is recieved (e.g. save that token and/or submit)

```ts
const captchaTokenRecieved = (event: { detail: { token: any; }; }) => {
    formData.token = event.detail.token;
}
```

3. You may also choose to reset the token in the case of data expiration: in this case dispatch an event from the resetCaptcha callback & reset the parent component's captcha token.

## Verifying Captcha Responses Server-Side
1. Make sure that you've saved the token from the on:captchaTokenRecieved dispatch
2. Remember to bind the SECRET_KEY env variable you set up earlier to something on your endpoint so you can use it here.
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
```


If you've done everything correctly, the reCaptcha widget should now be working. The hooks inside of this component can be edited if you so choose to provide further functionality to the component; however, that is up to you to decide how it is implemented. There is further function documentation inside this component, and if you have any other issues the docs are actually somewhat informative: https://developers.google.com/recaptcha/docs/display


## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
