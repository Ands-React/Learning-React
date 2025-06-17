import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
const uri = process.env.DATABASE_NAME;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function deleteArticlesFromDB(selectedID) {
  try {
    await client.connect();
    const database = client.db("profile");
    const collection = database.collection("articles");

    const result = await collection.updateOne(
      {
        id: selectedID,
      },
      {
        $set : {isShow: false},
        $currentDate: {lastModified: true}
      }
    );
    if (result.acknowledged) {
      return "文章已刪除成功";
    } else {
      throw new Error("文章更新失敗，請稍後再試");
    }
  } catch (err) {
    throw err;
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

// 更新(編輯) mongoDB中的資料
async function editArticleToDB(id, article) {
  try {
    await client.connect();
    const database = client.db("profile");
    const collection = database.collection("articles");

    const result = await collection.updateOne(
      {
        id: id,
      },
      {
        $set : article,
        $currentDate: {lastModified: true}
      }
    );
    if (result.acknowledged) {
      return "文章更新成功";
    } else {
      throw new Error("文章更新失敗，請稍後再試");
    }
  } catch (err) {
    throw err;
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

// 插入資料到mongoDB
async function insertArticleToDB(article) {
  try {
    await client.connect();
    const database = client.db("profile");
    const collection = database.collection("articles");

    const result = await collection.insertOne(article);
    if (result.acknowledged) {
      return "文章新增成功";
    } else {
      throw new Error("文章新增失敗，請稍後再試");
    }
  } catch (err) {
    throw err;
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
async function getArticlesByDB() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const database = client.db("profile");
    const collection = database.collection("articles");

    const query = { isShow: true };
    const sortFields = { id: -1 };
    const projectFields = { _id: 0 };
    const articlesByDB = collection
      .find(query)
      .sort(sortFields)
      .project(projectFields);

    let articles = {};
    let articleOrder = [];
    for await (const doc of articlesByDB) {
      articleOrder.push(doc.id);
      articles[doc.id] = doc;
    }
    if (!articleOrder.length) {
      throw new Error("目前沒有文章，請先新增文章");
    } else {
      return { articles, articleOrder };
    }
  } catch (err) {
    throw err;
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

export { getArticlesByDB, insertArticleToDB, editArticleToDB, deleteArticlesFromDB };
