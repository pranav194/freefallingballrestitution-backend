const express = require('express');
const CoordinateRouter = require('./Routes/CoordinateRoute');
const app = express();

app.use('/api/getCordinates',CoordinateRouter);

const PORT = process.env.PORT||3000;
app.listen(PORT,console.log("Server running on Port "+PORT));