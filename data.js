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
    isOverlayRequired: true,
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
                sell,
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

const getMonitor = _ => axios.get('https://rates.juannavas.dev/monitor');

module.exports = {
    getAirtmRates,
    getDolarToday,
    getMonitor,
};
