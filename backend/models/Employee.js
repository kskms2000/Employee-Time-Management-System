const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    EmployeeID: { type: String, unique: true },
    FullName: { type: String, required: true },
    Email: { type: String, unique: true, required: true },
    Password: { type: String, required: true },
    EmployeeType: { type: String, enum: ['hourly', 'monthly'], required: true },
    SSN: { type: String, required: true },
    Address: { type: String, required: true },
    Phone: { type: String },
    HireDate: { type: Date, required: true },
    BankDetails: {
        AccountHolderName: { type: String, required: true },
        BankName: { type: String, required: true },
        RoutingNumber: { type: String, required: true },
        AccountNumber: { type: String, required: true },
    },
    isFirstLogin: { type: Boolean, default: true },
}, { collection: 'Employee' });

module.exports = mongoose.model('Employee', employeeSchema);
