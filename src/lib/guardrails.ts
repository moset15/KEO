export function civicRedirect(query:string):boolean{
 return [
 /(?:why|convince|persuade|promote).{0,70}(?:candidate|vote for|politic|party)/i,
 /(?:candidate|party).{0,40}(?:best|superior|deserves your vote)/i,
 /(?:ethnic|tribe|religio|psychographic).{0,70}(?:support|target|vote|profile)/i,
 /(?:track|dox|stalk|surveil).{0,70}(?:person|private|voter|political activity)/i,
 /(?:suppress|intimidate|discourage).{0,40}(?:voter|voting)/i,
 /(?:scrape|infiltrate).{0,40}(?:private|whatsapp)/i,
 /(?:identify|recognise|recognize).{0,40}(?:crowd|faces|protesters)/i,
 /(?:how to|help me).{0,40}(?:rig|interfere|tamper).{0,30}(?:election|ballot|vote)/i
 ].some(pattern=>pattern.test(query));
}
export function redactIdentifiers(text:string):string{
 return text.replace(/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/gi,'[email removed]').replace(/(?:\+?254|0)[\s-]?[17](?:[\s-]?\d){8}\b/g,'[phone removed]');
}
