
export async function activate(ctx, data, payload){
    console.log("Activating action webhook...")

    data.url = ctx.read_file("webhook_url.txt")
    console.log(data);

    //console.log(payload.results)
    for(const entry of payload.results){
        console.log("POSTING")
        console.log(entry)
        console.log(`${data.url} - ${data.method} - ${JSON.stringify(data.headers)} - ${JSON.stringify(data.body)}`)

        let body = JSON.stringify(data.body);
        const tags = body.match(/\{\{(.*?)\}\}/g)
        for(const tag of tags) {
            const name = tag.slice(2, -2);
            console.log(`Tag named ${name} => ${entry[name]}`)

            body = body.replace(tag, entry[name])
        }
        console.log("Finished formatting")
        console.log(body)
        fetch(data.url, {
            method: data.method,
            headers: data.headers,
            body: body,


            }).catch(error => {
            console.log("ERROR")
            console.log(error);
        });

    }

}