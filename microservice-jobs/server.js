import "./utils/loadEnv.js" 
import "./utils/dbConnect.js"
import app from "./app.js";
const port = process.env.PORT || 3001;

app.listen(port, ()=>{
    console.log(`server started at ${port}`);
})