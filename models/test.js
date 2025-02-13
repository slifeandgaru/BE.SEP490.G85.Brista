const mongoose = require("../configs/connectDB")

let testSchema = mongoose.Schema({
    userId: [{
        type: String,
        ref: 'user'
    }]
},{
    collection: 'test'
})

// tạo model
const testModel = mongoose.model("test", testSchema);

// export
module.exports = testModel;