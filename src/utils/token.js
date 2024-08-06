const { v4: uuidv4 } = require('uuid');


const generateResetCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit code
};



module.exports = generateResetCode 
