const express = require("express");
const cors = require("cors");
const dynamodbRoutes = require("./dynamodbManager-api");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use('/dynamodb', dynamodbRoutes);

app.get('/ping', (req, res) => res.send('Server is healthy'));

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
