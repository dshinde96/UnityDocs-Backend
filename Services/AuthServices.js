const jwt = require('jsonwebtoken');
const secretKey = "j$eg6#45@&d^dc";     //Always keep in private.txt or in enviornment variables

const generateTocken = (user) => {
    try {
        const authTocken = jwt.sign(user, secretKey);
        return authTocken;
    } catch (error) {
        console.log(error.message);
        return null;
    }
}

//
const validateTocken = (authTocken) => {
    try {
        const payload = jwt.verify(authTocken, secretKey);
        return payload;
    } catch (error) {
        console.log(error.message);
        return null;
    }
};

module.exports = { generateTocken, validateTocken };