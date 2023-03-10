const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();

app.use(cors());
app.use(express.json());

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
        const ordersCollections = client.db("pizza").collection("orders");

        // receive products and store in db
        app.post("/products", async (req, res) => {
            const productData = req.body;
            const result = await productsCollections.insertOne(productData);
            res.send(result);
        });

        // fetch all products
        app.get("/products", async (req, res) => {
            const result = await productsCollections
                .find()
                .sort({ _id: -1 })
                .toArray();
            res.send(result);
        });

        // fetch product by id
        app.get("/productDetails/:id", async (req, res) => {
            const id = req.params.id;
            // console.log(typeof id);
            const query = { _id: ObjectId(id) };
            const result = await productsCollections.findOne(query);
            res.send(result);
        });

        // fetch products by ids
        app.get("/cartItems", async (req, res) => {
            let ids = req.query.ids;
            if (!ids) {
                return "no routes";
            }
            ids = ids?.split(",");

            const query = { _id: { $in: ids?.map((id) => ObjectId(id)) } };
            const result = await productsCollections.find(query).toArray();
            res.send(result);
        });

        // delete product

        app.delete("/delete/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await productsCollections.deleteOne(query);
            res.send(result);
        });

        // update product

        app.put("/update/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const updatedProduct = req.body;
            console.log(updatedProduct);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updatedProduct.productName,
                    price: updatedProduct.price,
                    quantity: updatedProduct.quantity,
                    desc: updatedProduct.desc,
                },
            };

            const result = await productsCollections.updateOne(
                filter,
                updateDoc,
                options
            );

            res.send(result);
        });
        // store orders
        app.post("/orders", async (req, res) => {
            console.log("hello");
            const orders = req.body;
            console.log(orders);
            const result = await ordersCollections.insertOne(orders);
            res.send(result);
        });

        // get orders
        app.get("/orders", async (req, res) => {
            const result = await ordersCollections
                .find()
                .sort({ _id: -1 })
                .toArray();
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
