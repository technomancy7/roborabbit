
export async function activate(ctx, data, payload){
    console.log("Activating action webhook...")

    data.url = ctx.read_file("webhook_url.txt")
    console.log(data);

    console.log(payload.results)
    return
    await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
}