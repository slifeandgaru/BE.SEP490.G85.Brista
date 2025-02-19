const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://truongnxhe141509:Truong0989@cluster0.3qe2h.mongodb.net/QRista?retryWrites=true&w=majority')
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Connection error:', err));
 
module.exports = mongoose

