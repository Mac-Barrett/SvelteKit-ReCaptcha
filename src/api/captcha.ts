import type { RequestHandler } from "@sveltejs/kit";

const SECRET_KEY = "";

export const POST: RequestHandler = async ({ request }) => {
    const { formData } = await request.json();
    // Verify Captcha
    const CaptchaResponse = await verifyCaptcha(formData.token, '127.0.0.1:5173');
    if (!CaptchaResponse) {
        return {
            status: 401,
            body: 'ReCaptcha Failed to authorize on server, please try again'
        }
    }
    return {
        status: 200,
        body: 'Good Job :)'
    }
}

async function verifyCaptcha(token: string, host: string): Promise<boolean> {
    const res = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${token}&remoteip=${host}`, { method: 'POST' });

    const data: { success: boolean; } = await res.json();
    return data.success;
}