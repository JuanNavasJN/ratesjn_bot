const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { getAirtmRates } = require("./data");

const app = express();

process.env.PORT = 9080;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/airtm", async (req, res) => {
    const data = await getAirtmRates();
    res.json(data);
});

app.get("/airtm/sell", async (req, res) => {
    const data = await getAirtmRates();
    res.json(data.sell);
});

app.get("/airtm/general", async (req, res) => {
    const data = await getAirtmRates();
    res.json(data.general);
});

app.get("/airtm/buy", async (req, res) => {
    const data = await getAirtmRates();
    res.json(data.buy);
});

app.listen(process.env.PORT, "0.0.0.0", function() {
    console.log("Web Server listening on port " + process.env.PORT);
});
