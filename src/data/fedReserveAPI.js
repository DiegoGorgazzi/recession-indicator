//Since the Federal Reserve has a Private API, I can't use it publicly here
// I tried to use firebase cloud functions. However,
//besides the fact that I need to use Node, which I still haven't figured out
//the free plan does NOT support outbound networking.
//Therefore, with the API key I got from the Fed, I downloaded
// the json files into my dropbox and I'm going to host them from there.
// When I figure out Node I'll come back to this so I don't have to
//manually update the json files...

export const  tenYearYield = "https://dl.dropbox.com/s/th6ixv6pnu04atg/ten-yr-yields-04-2019.json?dl=0";
export const threeMonthYield = "https://dl.dropbox.com/s/hca5fkk9uecbs7u/three-mo-yields-04-2019.json?dl=0";
export const nberUSrecess = "https://dl.dropbox.com/s/v0kerqq5od6sgla/nber-us-reces-04-2019.json?dl=0";
export const willshire5000 = "https://dl.dropbox.com/s/mcuwzgf6a9mg35d/will500-prch-05-20-2019.json?dl=0";
export const vix = "https://dl.dropbox.com/s/c1w70ipq5iuaiag/vix-05-20-2019.json?dl=0";
