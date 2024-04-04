import express from "express";
import createRouter, { router } from "express-file-routing";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

await createRouter(app);

app.listen(2000, () => {
  console.log("Server is running on port 2000");
});
