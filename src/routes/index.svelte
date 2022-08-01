<script lang="ts">
    import SvelteRecaptcha from "./ReCaptcha.svelte";
    let name = 'world';

    let SITE_KEY: string = "";
    let formData = {
        token: "",
        name: ""
    }

    const captchaTokenRecieved = (event: { detail: { token: any; }; }) => {
        formData.token = event.detail.token;
    }

    const onSubmit = async () => {
        if (formData.token === "")
            return;
        
        let response = await fetch('./api/captcha' , {
            method: 'POST',
            body: JSON.stringify({formData}),
            headers: { 'Content-Type': 'application/json' }
        });
        console.log(response);
    }
</script>

<h1>Hello {name}!</h1>

<form on:submit|preventDefault={onSubmit}>
    <input type="text" bind:value={formData.name}>
    <SvelteRecaptcha SITE_KEY={SITE_KEY} on:captchaTokenRecieved={captchaTokenRecieved}/>
    <button>Submit</button>
</form>