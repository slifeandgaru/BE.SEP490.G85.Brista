async function generateAccessToken() {
    const response = await axios({
        url: `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
        method: 'post',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
            username: process.env.PAYPAL_CLIENT_ID,
            password: process.env.PAYPAL_CLIENT_SECRET,
        },
        data: 'grant_type=client_credentials',
    });

    return response.data.access_token;
}