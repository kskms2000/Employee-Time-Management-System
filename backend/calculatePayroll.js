const moment = require('moment');
const Transaction = require('./models/Transaction');
const Contract = require('./models/Contract');
const Payroll = require('./models/Payroll');
const { v4: uuidv4 } = require('uuid');

// Generate a unique PayrollID
const newPayrollID = uuidv4();

async function calculateAndUpdatePayroll(employeeID) {
    try {
        // Fetch contract details
        const contract = await Contract.findOne({ EmployeeID: employeeID });
        if (!contract) {
            throw new Error('Contract not found for this employee');
        }

        // Determine pay period based on payroll frequency
        const currentDate = moment(); // Current date
        let startDate, endDate;

        if (contract.PayrollFrequency === 'Bi-Weekly') {
            // Fixed bi-weekly cycle starting January 1
            const fixedStartDate = moment(currentDate.year() + '-01-01');
            startDate = fixedStartDate.clone();
            endDate = fixedStartDate.clone().add(13, 'days');

            while (endDate.isBefore(currentDate)) {
                startDate = startDate.add(14, 'days');
                endDate = endDate.add(14, 'days');
            }
        } else if (contract.PayrollFrequency === 'Monthly') {
            // Monthly pay period
            startDate = moment(currentDate).startOf('month');
            endDate = moment(currentDate).endOf('month');
        } else if (contract.PayrollFrequency === 'Weekly') {
            // Weekly pay period starting Monday
            startDate = moment(currentDate).startOf('isoWeek'); // Monday of the current week
            endDate = moment(currentDate).endOf('isoWeek'); // Sunday of the current week
        } else {
            throw new Error(`Unsupported payroll frequency: ${contract.PayrollFrequency}`);
        }

        // Fetch completed transactions within the pay range
        const transactions = await Transaction.find({
            EmployeeID: employeeID,
            ShiftDate: { $gte: startDate.toDate(), $lte: endDate.toDate() },
            ShiftStatus: 'Completed' // Ensure only completed transactions are used
        });

        // Calculate total hours, overtime hours, and gross pay
        let totalHours = 0;
        let overtimeHours = 0;
        const regularPayRate = contract.HourlyRate;
        let grossPay = 0;

        transactions.forEach((transaction) => {
            const clockIn = new Date(transaction.ClockInTime);
            const clockOut = new Date(transaction.ClockOutTime);
            const hoursWorked = (clockOut - clockIn) / (1000 * 60 * 60); // Convert ms to hours

            totalHours += hoursWorked;

            if (hoursWorked > 9) {
                overtimeHours += hoursWorked - 9;
                grossPay += 9 * regularPayRate; // Regular pay for 9 hours
                grossPay += (hoursWorked - 9) * (2 * regularPayRate); // Double pay for overtime
            } else {
                grossPay += hoursWorked * regularPayRate; // Regular pay
            }
        });

        const regularHours = totalHours - overtimeHours;
        const netPay = grossPay * 0.83; // Assuming 17% tax deduction

        // Format pay period
        const payPeriod = `${startDate.format('YYYY-MM-DD')} to ${endDate.format('YYYY-MM-DD')}`;

        // Update or create payroll record
        const payroll = await Payroll.findOneAndUpdate(
            { EmployeeID: employeeID, PayPeriod: payPeriod },
            {
                PayrollID: uuidv4(),
                EmployeeID: employeeID,
                ContractID: contract.ContractID,
                PayPeriod: payPeriod,
                TotalHoursWorked: totalHours,
                OvertimeHours: overtimeHours,
                GrossPay: grossPay,
                NetPay: netPay,
                PaymentDate: endDate.toDate(),
                Status: 'Pending'
            },
            { upsert: true, new: true }
        );

        console.log('Updated Payroll:', payroll);
        return payroll;
    } catch (error) {
        console.error('Error calculating payroll:', error.message);
        throw new Error('Failed to calculate payroll');
    }
}

module.exports = calculateAndUpdatePayroll;
