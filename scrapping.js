const axios = require("axios");
const $ = require("cheerio");

const airtmUrl = "https://rates.airtm.com";
const dolarToday = "https://dolartoday.com/";

const getAirtmRates = _ =>
    new Promise(resolve => {
        axios.get(airtmUrl).then(res => {
            let buy = $(".rate--buy", res.data).html();
            let general = $(".rate--general", res.data).html();
            let sell = $(".rate--sell", res.data).html();

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
            let imgs = $("img", res.data);
            for (let img in imgs) {
                if (typeof imgs[img].attribs === "object") {
                    if (
                        imgs[img].attribs.alt === "Dolar paralelo en Venezuela"
                    ) {
                        resolve(imgs[img].attribs.src);
                    }
                }
            }
        });
    });

module.exports = {
    getAirtmRates,
    getDolarToday
};
