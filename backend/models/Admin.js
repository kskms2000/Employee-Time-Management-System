const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    AdminID: { type: String, unique: true },
    FullName: { type: String, required: true },
    Email: { type: String, unique: true, required: true },
    Password: { type: String, required: true },
    SSN: { type: String, required: true },
    Address: { type: String, required: true },
    Phone: { type: String },
},{ collection: 'Admin' });

module.exports = mongoose.model('Admin', adminSchema);
