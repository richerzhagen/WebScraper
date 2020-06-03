const puppeteer = require('puppeteer');

const BASE_URL = 'https://twitter.com/';
const USERNAME_URL = (username) => `https://twitter.com/${username}`;

let browser = null;
let page = null;

const twitter = {

    initialize: async() => {
        browser = await puppeteer.launch({headless: true});
        page = await browser.newPage();
    },

    getUser: async(username) => {
        var pages = await browser.pages();
        debugger;
        let url = await page.url();

        if(url != USERNAME_URL(username)){
            await page.goto(USERNAME_URL(username));
        }

        //--> wait for username to load
        await page.waitFor('div[class="css-1dbjc4n r-15d164r r-1g94qm0"] span[class="css-901oao css-16my406 r-1qd0xha r-ad9z0x r-bcqeeo r-qvutc0"');

        //--> get username
        let user = await page.evaluate(() => {
            return document.querySelector('div[class="css-1dbjc4n r-15d164r r-1g94qm0"] span[class="css-901oao css-16my406 r-1qd0xha r-ad9z0x r-bcqeeo r-qvutc0"').innerText;
        })

        return user;
    },

    getTweets: async(username, count = 5) => {
        let url = await page.url();
        var pages = await browser.pages();
    
        page = pages[1];

        if(url != USERNAME_URL(username)){
            await page.goto(USERNAME_URL(username));
        }

        //--> get real name
        await page.waitFor('div[class="css-1dbjc4n r-15d164r r-1g94qm0"] span[class="css-901oao css-16my406 r-1qd0xha r-ad9z0x r-bcqeeo r-qvutc0"');
        let user = await page.evaluate(() => {
            return document.querySelector('div[class="css-1dbjc4n r-15d164r r-1g94qm0"] span[class="css-901oao css-16my406 r-1qd0xha r-ad9z0x r-bcqeeo r-qvutc0"').innerText;
        })

        //--> wait for timeline
        await page.waitFor(`div[aria-label="Timeline: ${user}’s Tweets"]`);
        await page.waitFor(3000);

        let tweetsArray = await page.$$(`div[aria-label="Timeline: ${user}’s Tweets"] div[data-testid="tweet"]`);
        let tweets = [];
    
        //--> while < count for testing purposes
        while(tweets.length < count){

            let tweetsArray = await page.$$(`div[aria-label="Timeline: ${user}’s Tweets"] div[data-testid="tweet"]`);
            // debugger;
            for(let tweetElement of tweetsArray){
                try {
                    //TODO: different types of tweets / retweets / sorting when posted on same time / filter on keywords
                    let tweet = await tweetElement.$eval('div[class="css-901oao r-hkyrab r-1qd0xha r-a023e6 r-16dba41 r-ad9z0x r-bcqeeo r-bnwqim r-qvutc0"] span', element => element.innerText);
                    let date = await tweetElement.$eval('time', element => element.getAttribute('dateTime'));
                    // let interaction = await tweetElement.$eval('div[class="css-1dbjc4n r-18u37iz r-1wtj0ep r-156q2ks r-1mdbhws"]');
                    // let commentCount = await interaction.$eval('div[data-testid="reply"] span span', element => element.innerText);
                    // let retweetCount = await interaction.$eval('div[data-testid="retweet"] span span', element => element.innerText);
                    // let favoriteCount = await interaction.$eval('div[data-testid="like"] span span', element => element.innerText);

                    let interaction = await tweetElement.$$('div[class="css-1dbjc4n r-1iusvr4 r-18u37iz r-16y2uox r-1h0z5md"');
                    let commentCount = await interaction[0].$eval('span[class="css-901oao css-16my406 r-1qd0xha r-ad9z0x r-bcqeeo r-qvutc0"]', element => element.innerText);
                    let retweetCount = await interaction[1].$eval('span[class="css-901oao css-16my406 r-1qd0xha r-ad9z0x r-bcqeeo r-qvutc0"]', element => element.innerText);
                    let favoriteCount = await interaction[2].$eval('span[class="css-901oao css-16my406 r-1qd0xha r-ad9z0x r-bcqeeo r-qvutc0"]', element => element.innerText);
                //    debugger;
                    tweets.push({date, tweet, commentCount, retweetCount, favoriteCount});

                } catch (error) {
                    // send mail
                }
            }

            await page.evaluate(`window.scrollTo(0, document.body.scrollHeight)`);
            await page.waitFor(2000);
        }
        // debugger;
        return tweets;
    }
};

module.exports = twitter;