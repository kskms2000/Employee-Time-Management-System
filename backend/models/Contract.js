const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema(
    {
        ContractID: { type: String, unique: true },
        EmployeeID: { type: String, required: true },
        ContractType: {
            type: String,
            enum: ['hourly', 'monthly'],
            required: true,
        },
        HourlyRate: {
            type: Number,
            required: function () {
                return this.ContractType === 'hourly';
            },
        },
        PayrollFrequency: {
            type: String,
            enum: ['Bi-Weekly', 'Monthly', 'Weekly'],
            required: function () {
                return this.ContractType === 'hourly';
            },
        },
        MonthlySalary: {
            type: Number,
            required: function () {
                return this.ContractType === 'monthly';
            },
        },
        StartDate: { type: Date, required: true },
        EndDate: { type: Date, required: true },
    },
    { collection: 'Contract' }
);

module.exports = mongoose.model('Contract', contractSchema);
