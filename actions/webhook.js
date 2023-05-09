
export async function activate(ctx,data, payload){
    console.log("Activating action webhook...")

    //console.log(data);

    console.log(payload.results)
    return
    fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
}