import express from "express";
import http from "http";
import cors from "cors";
import MongoClient from "mongodb";
import pkg from "bson";
import cookieParser from 'cookie-parser'


/**
 * mongodb url
 */
const uri = "mongodb://localhost:27017";
const { ObjectId } = pkg;

var _db;

/**
 * function to connect to mongodb
 */
const MongoUtil = {
  // create connection to mongodb
  connectToServer: function (callback) {
    MongoClient.connect(
      uri,
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      },
      function (err, client) {
        //   db name
        _db = client.db("shop");
        return callback(err);
      }
    );
  },
  // get connected db
  getDb: function () {
    return _db;
  },
};

// port to start server
const PORT = 3001;

/**
 * function to execute mongo connection and start server
 */
MongoUtil.connectToServer(function (err) {
  const app = express();
  app.use(express.json());
  // to enable bodyparser to get request.body from POST/PUT request
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  // to fix cross origin request
  app.use(cors({}));

  // get db connection and db.collection
  const db = MongoUtil.getDb();
  const collection = db.collection("product");

  /**
   * CRUD - create read update delete methods
   */

  /**
   * execute api route for fetching product data from db
   */
  app.get("/product", (req, res) => {
    collection.find().toArray(function (err, result) {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      }
      res.send(result);
    });
  });

  /**
   * execute api route for inserting product data into db
   */
  app.post("/product", (req, res) => {
      console.log("tag1", req.body)
    collection.insertOne(req.body).then((result, err) => {
      if (err) {
        res.status(500).json(err);
      }
      res.send(result);
    });
  });

  /**
   * execute api route for deleting product data from db
   */
  app.delete("/product", (req, res) => {
    collection
      .deleteOne({ _id: ObjectId(req.query._id) })
      .then((result, err) => {
        if (err) {
          res.status(500).send(err);
        }
        res.send(result);
      });
  });

  /**
   * execute api route for updating product data into  db
   */
  app.put("/product", (req, res) => {
    collection.updateOne({}, { $set: { " name": 1 } }).then((result, err) => {
      if (err) {
        res.status(500).send(err);
      }
      res.send(result);
    });
  });

  

  /**
   * execute api route for /server to display welcome message
   */
  app.use("/server", (req, res) => {
    res.status(200).send("Server is Running for Shop Microservice");
  });

  /**
   * execute api route for / to display welcome message
   */
   app.use("/*", (req, res) => {
    res.status(404).send("API not found for Shop Microservice");
  });

  /**
   * to start server using http module
   */
  http.createServer(app).listen(PORT, () => {
    console.log("server started", PORT);
  });
});
