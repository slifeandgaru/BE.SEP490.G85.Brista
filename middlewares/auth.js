const jwt = require('jsonwebtoken');

exports.checkLogin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        // console.log(token)
        if(!token) return res.status(400).json({message: 'token not found'});

        const data = jwt.verify(token, process.env.JWT);
        req.user = data;
        next();
        
    } catch (error) {
        res.status(500).json({message: 'server error', error});
    }
}

// exports.checkShop = async (req, res, next) => {
//     if(!req.user.shop) return res.status(400).json({message: 'please login to shop page'});

//     next();
// }

exports.checkAdmin = async (req, res, next) => {
    if(req.user.role !== 'admin') return res.status(400).json({message: 'only admin accepted'});

    next();
}