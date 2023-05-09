
export async function activate(ctx, data, payload){
    console.log("Activating action webhook...")

    data.url = ctx.read_file("webhook_url.txt")
    console.log(data);

    console.log(payload.results)
    await fetch(webhookUrl, {
        method: data.method,
        headers: data.headers,
        body: JSON.stringify(data.body),
      });
}