require('dotenv').config();

const axios = require('axios');
const $ = require('cheerio');
const Twitter = require('twitter');
const airtmUrl = 'https://rates.airtm.com';
const dolarToday = 'https://s3.amazonaws.com/dolartoday/data.json';

// OCR
const ocrSpaceApi = require('ocr-space-api');

const options = {
    apikey: process.env.OCR_APIKEY,
    language: 'spa',
    imageFormat: 'image/jpg',
    isOverlayRequired: true
};

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
        client.get('statuses/user_timeline', params, async function(
            error,
            tweets,
            response
        ) {
            if (!error) {
                let res = null;
                for (let i = 0; i < tweets.length; i++) {
                    let e = tweets[i];
                    if (!e.retweeted_status) {
                        let match = e.text.match(/[0-9]+.[0-9]+[,|.]+[0-9]+/g);
                        if (match) {
                            res = {
                                img: false,
                                data: e.text,
                                value: match[0]
                            };
                            break;
                        }

                        if (
                            e.entities.media &&
                            e.entities.media.length === 1 &&
                            e.entities.media[0].media_url_https
                        ) {
                            let url = e.entities.media[0].media_url_https;
                            try {
                                const data = await ocrSpaceApi.parseImageFromUrl(
                                    url,
                                    options
                                );
                                let match = data.parsedText.match(
                                    /PROMEDIO Bs.S/gm
                                );

                                if (match) {
                                    let match2 = data.parsedText.match(
                                        /[0-9]+.[0-9]+[,|.]+[0-9]+/g
                                    );

                                    res = {
                                        img: true,
                                        data: url,
                                        value: match2[0]
                                    };
                                    break;
                                }
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    }
                }

                resolve(res);
            }
        });
    });

module.exports = {
    getAirtmRates,
    getDolarToday,
    getMonitor
};
