<script lang="ts">
    import { ReCaptcha } from "$lib";
    
    let SITE_KEY: string = "";
    let Captcha: ReCaptcha;
    
    let formData = {
        token: "",
        name: 'world'
    }
    let name = 'world';

    const onSubmit = async () => {
        formData.token = Captcha.getRecaptchaResponse();
        if (formData.token.length === 0) {
            return;
        }
        
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
    <label for="name">Name: </label>
    <input id="name" type="text" bind:value={formData.name}>
    <br><br>
    <ReCaptcha bind:this={Captcha} { SITE_KEY } captchaStyle={{theme: 'dark', size: 'compact'}}/>
    <hr>
    <input type="submit" value="Submit">
    <input type="button" value="Test Captcha Response Function" on:click={() => {console.log(Captcha.getRecaptchaResponse())}}>
</form>