const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();

app.use(cors());

const PORT = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yhct952.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

async function run() {
    try {
        const productsCollections = client.db("pizza").collection("products");

        app.get("/products", async (req, res) => {
            const result = await productsCollections.find().toArray();
            res.send(result);
        });

        // details api
        app.get("/productDetails/:id", async (req, res) => {
            const id = req.params.id;
            // console.log(typeof id);
            const query = { _id: ObjectId(id) };
            const result = await productsCollections.findOne(query);
            res.send(result);
        });

        app.get("/cartItems", async (req, res) => {
            let ids = req.query.ids;
            if (!ids) {
                return "no routes";
            }
            ids = ids?.split(",");

            console.log(ids);
            const query = { _id: { $in: ids?.map((id) => ObjectId(id)) } };
            const result = await productsCollections.find(query).toArray();
            res.send(result);
        });
    } finally {
    }
}

run().catch((e) => console.log(e));

app.get("/", (req, res) => {
    res.send("pizza server is running...");
});

app.listen(PORT, (req, res) => console.log(`pizza server running on ${PORT}`));
