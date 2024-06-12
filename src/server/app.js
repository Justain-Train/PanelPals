const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const audioRoutes = require('./routes/audioRoutes');
const textRoutes = require('./routes/textRoutes');


app.use(cors());
app.use(express.json({ limit: '50mb', type: 'application/json' })); // Increase the limit as per your requirement
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 100000 })); // Increase the limit as per your requirement
app.use(express.text({limit: '50mb'}));


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