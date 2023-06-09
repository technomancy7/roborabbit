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
        entry.subreddit = data.subreddit;
        while(entry.title.includes('"')) entry.title = entry.title.replace('"', "")
        const regex = /https?:\/\/[^\s"]+"/g;
        entry.url = url;
        for (const url of entry.content.match(regex)) {
            if(url.includes("comments")){ entry.url = url.slice(0, -2); }
        }
        
        if(entry.author == undefined) entry.author = "None";
        else {
            entry.author = entry.author.name;
        }
        
        entry.content_clean = entry.content.replace(/(<([^>]+)>)/gi, '');
        entry.content_clean = entry.content_clean.replace(/&#(\d+);/g, (_match, dec) => {
            return String.fromCharCode(dec);
        });

        entry.content_clean = entry.content_clean.replace("[comments]", "");
        entry.content_clean = entry.content_clean.replace("[link]", ``);
        entry.content_clean = entry.content_clean.replace("submitted by", ``);
        entry.content_clean = entry.content_clean.replace('"', ``);
        //console.log(entry)
        if(entry.author != undefined && entry.author.name != undefined){
            entry.content_clean = entry.content_clean.replace(entry.author.name, ``);
        }
        entry.content_clean = entry.content_clean.trim();
        console.log("LENGTH")
        console.log(entry.content_clean.length)
        if(entry.content_clean.length > 1000) entry.content_clean = entry.content_clean.slice(0, 950)+"(...)"
        entries.push(entry);
    }
    //jObj.content_clean = jObj.content.replace(/(<([^>]+)>)/gi, '');
    
    ctx.write_cache(cache);
    return {"triggered": entries.length > 0, "results": entries}

}