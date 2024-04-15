
const { validateTocken } = require('../Services/AuthServices');

//Authenticate Socket connection
const AuthenticateUser = (socket, next) => {
    try {
        const authTocken = socket.handshake.auth.token;
        if (!authTocken) {
            return next(new Error('Authentication error'));
        }
        const user = validateTocken(authTocken);
        socket.user = user;
        next();
    } catch (error) {
        console.log(error.message);
        return;
    }
}

//Authenticate HTTP Connection
const AuthenticateUserforHTTPReq = (req,res, next) => {
    try {
        const authTocken = req.header('authTocken');
        if (!authTocken) {
            return res.status(401).json({msg:"Access Denied"});
        }
        const user = validateTocken(authTocken);
        if(user==null)
        return res.status(401).json({msg:"Access denied"});
        req.user = user;
        next();
    } catch (error) {
        console.log(error.message);
        return res.status(501).json({msg:"Internal Server Error"});
    }
}


module.exports = { AuthenticateUser, AuthenticateUserforHTTPReq };