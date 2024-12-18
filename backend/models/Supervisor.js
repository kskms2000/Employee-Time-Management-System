const mongoose = require('mongoose');


const supervisorSchema = new mongoose.Schema({
    SupervisorID: { type: String, unique: true },
    FullName: { type: String, required: true },
    Email: { type: String, unique: true, required: true },
    Password: { type: String, required: true },
    IsFirstLogin: { type: Boolean, default: true }, // Field to enforce password change
    Department: { type: String, required: true },
    SSN: { type: String, required: true },
    Address: { type: String, required: true },
    Phone: { type: String },
},{ collection: 'Supervisor' });

module.exports = mongoose.model('Supervisor', supervisorSchema);

