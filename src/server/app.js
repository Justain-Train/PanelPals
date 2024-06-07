const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const audioRoutes = require('./routes/audioRoutes');
const textRoutes = require('./routes/textRoutes');


app.use(cors());
app.use(express.json());


app.use('/api', audioRoutes); 
app.use ('/api', textRoutes);  


app.use((err,req,res,next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
})


app.listen(port, () => {
  console.log(`Server running on port ${port}`);

});


module.exports = app;