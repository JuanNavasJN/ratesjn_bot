require('dotenv').config();

const axios = require('axios');
const $ = require('cheerio');
const Twitter = require('twitter');
const airtmUrl = 'https://rates.airtm.com';
const dolarToday = 'https://s3.amazonaws.com/dolartoday/data.json';

const getAirtmRates = _ =>
    new Promise(resolve => {
        axios.get(airtmUrl).then(res => {
            let buy = $('.rate--buy', res.data).html();
            let general = $('.rate--general', res.data).html();
            let sell = $('.rate--sell', res.data).html();

            const data = {
                buy,
                general,
                sell
            };

            resolve(data);
        });
    });

const getDolarToday = _ =>
    new Promise(resolve => {
        axios.get(dolarToday).then(res => {
            let usd = res.data.USD;
            let eur = res.data.EUR;
            let newUsd = {},
                newEur = {};
            for (let key in usd) {
                let newKey = key.replace('_', ' ');
                newKey = newKey.charAt(0).toUpperCase() + newKey.slice(1);
                newUsd[newKey] = usd[key];
            }

            for (let key in eur) {
                let newKey = key.replace('_', ' ');
                newKey = newKey.charAt(0).toUpperCase() + newKey.slice(1);
                newEur[newKey] = eur[key];
            }

            resolve({ USD: newUsd, EUR: newEur });
        });
    });

const getMonitor = _ =>
    new Promise(resolve => {
        const client = new Twitter({
            consumer_key: process.env.CONSUMER_KEY,
            consumer_secret: process.env.CONSUMER_SECRET,
            access_token_key: process.env.ACCESS_TOKEN_KEY,
            access_token_secret: process.env.ACCESS_TOKEN_SECRET
        });

        const params = { screen_name: 'monitordolarvzl' };
        client.get('statuses/user_timeline', params, function(
            error,
            tweets,
            response
        ) {
            if (!error) {
                let data = tweets.map(e => {
                    if (
                        !e.retweeted_status &&
                        e.entities.media &&
                        e.entities.media.length === 1
                    ) {
                        return e.entities.media[0].media_url_https;
                    }
                    return null;
                });

                resolve(data.slice(0, 3));
            }
        });
    });

module.exports = {
    getAirtmRates,
    getDolarToday,
    getMonitor
};
