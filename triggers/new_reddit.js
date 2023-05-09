const { XMLParser} = require("fast-xml-parser");
const fs = require("fs");

export async function isTriggered(ctx, data){
    const url = `https://www.reddit.com/r/${data.subreddit}/new/.rss`;

    const response = await fetch(url)

    const body = await response.text();

    const parser = new XMLParser();
    const jObj = parser.parse(body);
    const entries_raw = jObj.feed.entry;

    const entries = [];
    const cache = ctx.read_cache()
    if(cache.new_reddit == undefined) cache.new_reddit = []
    console.log(cache);
    for (const entry of entries_raw) {
        if(cache.new_reddit.includes(entry.id)) {

            continue;
        }
        console.log(`NEW: ${entry.id}`)
        cache.new_reddit.push(entry.id);
        
        const regex = /https?:\/\/[^\s"]+"/g;
        entry.url = undefined;
        for (const url of entry.content.match(regex)) {
            if(url.includes("comments")){ entry.url = url.slice(0, -2); }
        }

        entry.content_clean = entry.content.replace(/(<([^>]+)>)/gi, '');
        entry.content_clean = entry.content_clean.replace(/&#(\d+);/g, (_match, dec) => {
            return String.fromCharCode(dec);
        });

        entry.content_clean = entry.content_clean.replace("[comments]", "");
        entry.content_clean = entry.content_clean.replace("[link]", ``);
        entry.content_clean = entry.content_clean.replace("submitted by", ``);
        //console.log(entry)
        if(entry.author != undefined && entry.author.name != undefined){
            entry.content_clean = entry.content_clean.replace(entry.author.name, ``);
        }
        entry.content_clean = entry.content_clean.trim();
        entries.push(entry);
    }
    //jObj.content_clean = jObj.content.replace(/(<([^>]+)>)/gi, '');
    
    ctx.write_cache(cache);
    return {"triggered": false, "results": entries}

}