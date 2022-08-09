<script lang="ts">
    import { ReCaptcha } from "$lib";
    
    let SITE_KEY: string = "";
    
    let formData = {
        token: "",
        name: 'world'
    }
    let name = 'world';
    
    const captchaTokenRecieved = (event: { detail: { token: any; }; }) => {
        formData.token = event.detail.token;
    }

    const captchaReset = () => {
        name = 'world';
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
        if (response.ok) {
            name = formData.name;
        }
    }
</script>

<h1>Hello {name}!</h1>

<form on:submit|preventDefault={onSubmit}>
    <input type="text" bind:value={formData.name}>
    
    <ReCaptcha { SITE_KEY }
        captchaStyle={{theme: 'dark'}}
        on:captchaTokenRecieved={captchaTokenRecieved}
        on:captchaReset={captchaReset}
    />
    <button>Submit</button>
</form>