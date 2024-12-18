const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    TransactionID: { type: String, required: true, unique: true },
    EmployeeID: { type: String, required: true },
    ShiftDate: { type: Date, required: true },
    ClockInTime: { type: Date },
    ClockOutTime: { type: Date },
    ShiftStatus: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
    SupervisorComments: { type: String }
},{collection:'Transaction'});

module.exports = mongoose.model('Transaction', transactionSchema);
