const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema({
    PayrollID: {
        type: String,
        required: true,
        unique: true
    },
    EmployeeID: {
        type: String,
        required: true,
        ref: 'Employee'
    },
    ContractID: {
        type: String,
        required: true,
        ref: 'Contract'
    },
    PayPeriod: {
        type: String, // Example: "2024-10-15 to 2024-10-31"
        required: true
    },
    TotalHoursWorked: {
        type: Number,
        required: true
    },
    OvertimeHours: {
        type: Number,
        default: 0
    },
    GrossPay: {
        type: Number,
        required: true
    },
    NetPay: {
        type: Number,
        required: true
    },
    PaymentDate: {
        type: Date,
        required: true
    },
    Status: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    }
},{collection:'Payroll'});

const Payroll = mongoose.model('Payroll', PayrollSchema);

module.exports = Payroll;
