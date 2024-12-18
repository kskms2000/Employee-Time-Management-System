// resolvers.js
const Admin = require('../models/Admin');
const Supervisor = require('../models/Supervisor');
const Employee = require('../models/Employee');  // Ensure this line is present
const Transaction = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');
const Contract = require('../models/Contract');
const Payroll = require('../models/Payroll')
const calculateAndUpdatePayroll = require('../calculatePayroll');
const moment = require('moment-timezone');
const bcrypt = require('bcryptjs');

const resolvers = {
    Query: {
        getPayroll: async (_, { employeeID }) => {
            console.log('getPayroll Resolver Called'); // Log resolver call
            console.log('Provided EmployeeID:', employeeID); // Log provided EmployeeID
        
            try {
                if (!employeeID) {
                    throw new Error('EmployeeID is required');
                }
        
                // Fetch payroll records
                console.log('Fetching payroll records for EmployeeID:', employeeID);
                const payrollRecords = await Payroll.find({ EmployeeID: employeeID });
        
                if (!payrollRecords || payrollRecords.length === 0) {
                    throw new Error('No payroll records found');
                }
        
                // Sort by the end date of PayPeriod in descending order
                const sortedPayrollRecords = payrollRecords.sort((a, b) => {
                    const endDateA = new Date(a.PayPeriod.split(' to ')[1]);
                    const endDateB = new Date(b.PayPeriod.split(' to ')[1]);
                    return endDateB - endDateA; // Descending order
                });
        
                console.log('Sorted Payroll Records:', sortedPayrollRecords);
                return sortedPayrollRecords;
            } catch (error) {
                console.error('Error in getPayroll resolver:', error.message);
                throw new Error('Failed to fetch payroll');
            }
        },
        login : async (_, { email, password, userType }) => {
            try {
                // Fetch the user based on userType
                console.log("Hi");
                let user;
                if (userType === 'employee') {
                    user = await Employee.findOne({ Email: email });
                } else if (userType === 'supervisor') {
                    user = await Supervisor.findOne({ Email: email });
                } else if (userType === 'admin') {
                    user = await Admin.findOne({ Email: email });
                } else {
                    throw new Error('Invalid user type provided.');
                }
        
                // If user is not found
                if (!user) {
                    throw new Error('Invalid email or password.');
                }
        
                // Validate password for employees and supervisors
                if (userType === 'employee' || userType === 'supervisor') {
                    const isValidPassword = await bcrypt.compare(password, user.Password);
                    if (!isValidPassword) {
                        throw new Error('Invalid email or password.');
                    }
                }
        
                // Validate password for admin (not encrypted)
                if (userType === 'admin' && user.Password !== password) {
                    throw new Error('Invalid email or password.');
                }
        
                // Prepare the response object
                const response = {
                    message: 'Login successful',
                    userType,
                    fullName: user.FullName,
                    email: user.Email,
                    employeeType: userType === 'employee' ? user.EmployeeType : null,
                    hireDate: userType === 'employee' ? user.HireDate : null,
                    contractID: userType === 'employee' ? user.ContractID : null,
                    status: user.Status || null,
                    employeeID: userType === 'employee' ? user.EmployeeID : null,
                    supervisorID: userType === 'supervisor' ? user.SupervisorID : null,
                    adminID: userType === 'admin' ? user.AdminID : null,
                    isFirstLogin: userType === 'employee' ? user.isFirstLogin : null,
                    IsFirstLogin: userType === 'supervisor' ? user.IsFirstLogin : null, // Explicitly add the IsFirstLogin field
                };
                console.log("Hi");
                console.log(user);
        
                return response;
            } catch (error) {
                console.error(`Login error for userType: ${userType}, email: ${email}`, error.message);
                throw new Error('Login failed. Please check your credentials and try again.');
            }
        },
        getLatestTransaction: async (_, { employeeID }) => {
            console.log('Resolver Called with EmployeeID:', employeeID); // Log when resolver is called
        
            try {
                const transaction = await Transaction.findOne({
                    EmployeeID: employeeID // Ensure we fetch only incomplete transactions
                }).sort({ ShiftDate: -1 }); // Sort by most recent
        
                console.log('Fetched Latest Transaction:', transaction); // Log the fetched transaction
        
                return transaction;
            } catch (error) {
                console.error('Error fetching latest transaction:', error); // Log any errors
                throw new Error('Failed to fetch latest transaction');
            }
        },
        getEmployeeTransactions: async (_, { employeeID }) => {
            const transactions = await Transaction.find({ EmployeeID: employeeID }).sort({ ShiftDate: -1 });
        
            // Validate all transactions
            const validatedTransactions = transactions.map((transaction) => ({
                ...transaction._doc,
                ShiftDate: transaction.ShiftDate ? new Date(transaction.ShiftDate).toISOString() : null,
                ClockInTime: transaction.ClockInTime ? new Date(transaction.ClockInTime).toISOString() : null,
                ClockOutTime: transaction.ClockOutTime ? new Date(transaction.ClockOutTime).toISOString() : null,
            }));
        
            return validatedTransactions;
        },
        getEmployeeContract: async (_, { employeeID }) => {
            try {
                console.log('Query:', { EmployeeID: employeeID });
        
                // Fetch the contract using the correct field names from the database
                const contract = await Contract.findOne({ EmployeeID: employeeID });
        
                if (!contract) {
                    throw new Error(`No contract found for EmployeeID: ${employeeID}`);
                }
        
                console.log('Fetched Contract:', contract);
        
                // Map database fields to GraphQL schema fields explicitly
                return {
                    ContractID: contract.ContractID,
                    EmployeeID: contract.EmployeeID,
                    ContractType: contract.ContractType,
                    HourlyRate: contract.HourlyRate || null,
                    PayrollFrequency: contract.PayrollFrequency || null,
                    MonthlySalary: contract.MonthlySalary || null,
                    StartDate: contract.StartDate ? contract.StartDate.toISOString() : null,
                    EndDate: contract.EndDate ? contract.EndDate.toISOString() : null,
                };
            } catch (error) {
                console.error(`Error fetching contract for EmployeeID ${employeeID}:`, error.message);
                throw new Error('Failed to fetch contract details');
            }
        },
        getTransactions: async (_, { employeeID, date }) => {
            try {
                console.log(`Fetching transactions for EmployeeID: ${employeeID} on Date: ${date}`);

                // Parse the provided date in CST
                const startOfDay = moment.tz(date, 'YYYY-MM-DD', 'America/Chicago').startOf('day').toDate();
                const endOfDay = moment.tz(date, 'YYYY-MM-DD', 'America/Chicago').endOf('day').toDate();

                console.log('Start of Day (CST):', startOfDay);
                console.log('End of Day (CST):', endOfDay);

                // Query transactions within the start and end of the day
                const transactions = await Transaction.find({
                    EmployeeID: employeeID,
                    ShiftDate: {
                        $gte: startOfDay,
                        $lte: endOfDay,
                    },
                });

                console.log('Fetched Transactions:', transactions);
                return transactions;
            } catch (error) {
                console.error('Error fetching transactions:', error.message);
                throw new Error('Failed to fetch transactions');
            }
        },
        
        getLateReport: async () => {
            try {
                console.log("Starting Late Report Fetch...");
        
                // Aggregation pipeline
                const transactions = await Transaction.aggregate([
                    // Convert ShiftDate to Chicago timezone
                    {
                        $addFields: {
                            ShiftDateChicago: {
                                $dateToString: {
                                    format: "%Y-%m-%dT%H:%M:%S.%LZ",
                                    date: "$ShiftDate",
                                    timezone: "America/Chicago",
                                },
                            },
                        },
                    },
                    // Extract only the date part
                    {
                        $addFields: {
                            ShiftDateOnly: {
                                $substr: ["$ShiftDateChicago", 0, 10], // Extract YYYY-MM-DD
                            },
                        },
                    },
                    {
                        $sort: { ClockInTime: 1 }, // Sort transactions by ClockInTime
                    },
                    // Group by EmployeeID and ShiftDate
                    {
                        $group: {
                            _id: { EmployeeID: "$EmployeeID", ShiftDateOnly: "$ShiftDateOnly" },
                            earliestTransaction: { $first: "$$ROOT" },
                        },
                    },
                    {
                        $replaceRoot: { newRoot: "$earliestTransaction" },
                    },
                    // Add 8:00 AM and 9:00 AM timestamps in Chicago time
                    {
                        $addFields: {
                            EightAMISO: {
                                $dateFromString: {
                                    dateString: {
                                        $concat: ["$ShiftDateOnly", "T08:00:00.000"],
                                    },
                                    timezone: "America/Chicago",
                                },
                            },
                            NineAMISO: {
                                $dateFromString: {
                                    dateString: {
                                        $concat: ["$ShiftDateOnly", "T09:00:00.000"],
                                    },
                                    timezone: "America/Chicago",
                                },
                            },
                        },
                    },
                    // Filter transactions outside the 8:00–9:00 AM window
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    // { $lt: ["$ClockInTime", "$EightAMISO"] },
                                    { $gt: ["$ClockInTime", "$NineAMISO"] },
                                ],
                            },
                        },
                    },
                ]);
        
                // Log intermediate results for debugging
                console.log("Final Transactions:", transactions);
        
                return transactions.map((transaction) => ({
                    transactionID: transaction.TransactionID,
                    employeeID: transaction.EmployeeID,
                    clockInTime: transaction.ClockInTime
                        ? new Date(transaction.ClockInTime).toISOString()
                        : null,
                    shiftDate: transaction.ShiftDate
                        ? new Date(transaction.ShiftDate).toISOString()
                        : null,
                    shiftStatus: transaction.ShiftStatus,
                }));
            } catch (error) {
                console.error("Error fetching late transactions:", error.message);
                throw new Error("Failed to fetch late report");
            }
        },
        getNextSupervisorID: async () => {
            const lastSupervisor = await Supervisor.findOne().sort({ SupervisorID: -1 });
            const nextID = lastSupervisor
                ? `S${String(parseInt(lastSupervisor.SupervisorID.slice(1)) + 1).padStart(3, '0')}`
                : 'S001';
            return nextID;
        },
        checkEmail: async (_, { email }) => {
            const supervisor = await Supervisor.findOne({ Email: email });
            const employee = await Employee.findOne({ Email: email });
            return !!(supervisor || employee);
        },
        getNextEmployeeID: async () => {
            try {
                const lastEmployee = await Employee.findOne().sort({ EmployeeID: -1 });
                const nextID = lastEmployee
                    ? `E${String(parseInt(lastEmployee.EmployeeID.slice(1)) + 1).padStart(3, '0')}`
                    : 'E001';
                return nextID;
            } catch (error) {
                throw new Error('Failed to generate next Employee ID.');
            }
        },
        getNextContractID: async () => {
            try {
                const lastContract = await Contract.findOne().sort({ ContractID: -1 });
                const nextID = lastContract
                    ? `C${String(parseInt(lastContract.ContractID.slice(1)) + 1).padStart(3, '0')}`
                    : 'C001';
                return nextID;
            } catch (error) {
                throw new Error('Failed to generate next Contract ID.');
            }
        },                                                                                 
             
        
        
        
        
    },
    Mutation: {
        clockIn: async (_, { employeeID }) => {
            console.log('Received Clock In Request for Employee ID:', employeeID); // Log input

            if (!employeeID) {
                console.error('Clock In Error: Missing Employee ID'); // Log error
                throw new Error('Employee ID is required');
            }

            const currentDate = new Date();
            const newTransaction = new Transaction({
                TransactionID: uuidv4(),
                EmployeeID: employeeID,
                ShiftDate: currentDate,
                ClockInTime: currentDate,
                ShiftStatus: 'Pending'
            });

            try {
                const savedTransaction = await newTransaction.save();
                console.log('Transaction Saved:', savedTransaction); // Log saved transaction
                await calculateAndUpdatePayroll(employeeID);
                return savedTransaction;
            } catch (error) {
                console.error('Error Saving Transaction:', error); // Log database error
                throw new Error('Failed to save transaction');
            }
        },
        clockOut: async (_, { employeeID }) => {
            console.log('Received Clock Out Request for Employee ID:', employeeID); // Log input
        
            const transaction = await Transaction.findOne({
                EmployeeID: employeeID,
                ClockOutTime: null
            }).sort({ ShiftDate: -1 }); // Find the most recent clock-in transaction
        
            if (!transaction) {
                console.error('Clock Out Error: No Active Clock-In Transaction Found'); // Log error
                throw new Error('No active clock-in transaction found');
            }
        
            const clockOutTime = new Date();
            const clockInTime = new Date(transaction.ClockInTime);
            const hoursWorked = (clockOutTime - clockInTime) / (1000 * 60 * 60); // Calculate hours
        
            transaction.ClockOutTime = clockOutTime;
        
            // Check if the hours worked exceed 10 hours
            if (hoursWorked > 10) {
                transaction.ShiftStatus = 'Pending';
                transaction.SupervisorComments = 'Contact supervisor';
            } else {
                transaction.ShiftStatus = 'Completed';
            }
        
            try {
                const updatedTransaction = await transaction.save();
                console.log('Transaction Updated:', updatedTransaction); // Log updated transaction
                await calculateAndUpdatePayroll(employeeID);
                return updatedTransaction;
            } catch (error) {
                console.error('Error Updating Transaction:', error); // Log database error
                throw new Error('Failed to update transaction');
            }
        },
        updateTransaction: async (_, { transactionID, clockInTime, clockOutTime, shiftStatus, supervisorComments }) => {
            console.log('Updating transaction:', transactionID);

            try {
                const existingTransaction = await Transaction.findOne({ TransactionID: transactionID });

        if (!existingTransaction) {
            throw new Error('Transaction not found');
        }

        const employeeID = existingTransaction.EmployeeID;
        
                const updatedTransaction = await Transaction.findOneAndUpdate(
                    { TransactionID: transactionID },
                    {
                        ...(clockInTime && { ClockInTime: clockInTime }),
                        ...(clockOutTime && { ClockOutTime: clockOutTime }),
                        ...(shiftStatus && { ShiftStatus: shiftStatus }),
                        ...(supervisorComments && { SupervisorComments: supervisorComments }),
                    },
                    { new: true } // Return the updated document
                );

                if (!updatedTransaction) {
                    throw new Error('Transaction not found');
                }

                console.log('Transaction Updated:', updatedTransaction);
                await calculateAndUpdatePayroll(employeeID);
                return {
                    message: 'Transaction updated successfully',
                    success: true,
                };
            } catch (error) {
                console.error('Error updating transaction:', error.message);
                return {
                    message: 'Failed to update transaction',
                    success: false,
                };
            }
        },
        addEmployee: async (_, { employeeInput }) => {
            try {
                const {
                    employeeID,
                    fullName,
                    email,
                    password,
                    employeeType,
                    ssn,
                    address,
                    phone,
                    bankDetails,
                    hireDate,
                    isFirstLogin,
                } = employeeInput;
        
                console.log('Employee Input:', employeeInput);
        
                // Ensure all required fields are included
                if (!bankDetails.accountHolderName || !bankDetails.bankName || !bankDetails.routingNumber || !bankDetails.accountNumber) {
                    throw new Error('All BankDetails fields are required.');
                }
        
                if (!fullName || !email || !password || !employeeType || !ssn || !address) {
                    throw new Error('Required employee fields are missing.');
                }
        
                // Check if the email already exists
                const existingEmployee = await Employee.findOne({ Email: email });
                if (existingEmployee) {
                    throw new Error('Email already exists. Please use another email.');
                }
        
                // Encrypt the password
                const hashedPassword = await bcrypt.hash(password, 10);
        
                // Create the employee
                const newEmployee = new Employee({
                    EmployeeID: employeeID,
                    FullName: fullName,
                    Email: email,
                    Password: hashedPassword,
                    EmployeeType: employeeType,
                    SSN: ssn,
                    Address: address,
                    Phone: phone,
                    BankDetails: {
                        AccountHolderName: bankDetails.accountHolderName,
                        BankName: bankDetails.bankName,
                        RoutingNumber: bankDetails.routingNumber,
                        AccountNumber: bankDetails.accountNumber,
                    },
                    HireDate: hireDate,
                    isFirstLogin: isFirstLogin,
                });
        
                const savedEmployee = await newEmployee.save();
                return savedEmployee;
            } catch (error) {
                throw new Error(error.message);
            }
        },
        addContract: async (_, { contractInput }) => {
            try {
                const {
                    contractID,
                    employeeID,
                    contractType,
                    hourlyRate,
                    payrollFrequency,
                    monthlySalary,
                    startDate,
                    endDate,
                } = contractInput;
        
                // Ensure Employee exists before creating the contract
                const employeeExists = await Employee.findOne({ EmployeeID: employeeID });
                if (!employeeExists) {
                    throw new Error('Employee does not exist. Cannot create contract.');
                }

                console.log('Contract Input:', contractInput);
        
                // Create the contract
                const newContract = new Contract({
                    ContractID: contractID,
                    EmployeeID: employeeID,
                    ContractType: contractType,
                    HourlyRate: hourlyRate,
                    PayrollFrequency: payrollFrequency,
                    MonthlySalary: monthlySalary,
                    StartDate: startDate,
                    EndDate: endDate,
                });
        
                const savedContract = await newContract.save();
                return savedContract;
            } catch (error) {
                throw new Error(error.message);
            }
        },        
        addSupervisor: async (_, { supervisorID, fullName, email, password, department, address, ssn }) => {
            try {
                // Encrypt the password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Create and save the new supervisor
                const newSupervisor = new Supervisor({
                    SupervisorID: supervisorID,
                    FullName: fullName,
                    Email: email,
                    Password: hashedPassword,
                    Department: department,
                    Address: address,
                    SSN: ssn,
                    IsFirstLogin: true, // Indicating the user needs to change the password on first login
                });

                const savedSupervisor = await newSupervisor.save();
                return savedSupervisor;
            } catch (error) {
                console.error('Error adding supervisor:', error.message);
                throw new Error('Failed to add supervisor');
            }
        },

        updatePassword: async (_, { userID, newPassword, userType }) => {
            try {
                // Hash the new password
                const hashedPassword = await bcrypt.hash(newPassword, 10);

                if (userType === 'employee') {
                    // Find and update the employee's password and set `isFirstLogin` to false
                    const employee = await Employee.findOneAndUpdate(
                        { EmployeeID: userID },
                        { Password: hashedPassword, isFirstLogin: false },
                        { new: true }
                    );
                    if (!employee) throw new Error('Employee not found.');

                } else if (userType === 'supervisor') {
                    // Find and update the supervisor's password and set `IsFirstLogin` to false
                    const supervisor = await Supervisor.findOneAndUpdate(
                        { SupervisorID: userID },
                        { Password: hashedPassword, IsFirstLogin: false },
                        { new: true }
                    );
                    if (!supervisor) throw new Error('Supervisor not found.');

                } else {
                    throw new Error('Invalid user type.');
                }

                return {
                    message: 'Password updated successfully.',
                    success: true,
                };
            } catch (error) {
                return {
                    message: error.message,
                    success: false,
                };
            }
        },

        updateTransaction1: async (_, { transactionID, comment, status }) => {
            try {
                console.log('Received Input:', { transactionID, comment, status });
        
                const updatedTransaction = await Transaction.findOneAndUpdate(
                    { TransactionID: transactionID },
                    { $set: { SupervisorComments: comment, ShiftStatus: status } },
                    { new: true }
                );
        
                if (!updatedTransaction) {
                    throw new Error('Transaction not found');
                }
        
                console.log('Updated Transaction:', updatedTransaction);
        
                return {
                    success: true,
                    message: 'Transaction updated successfully',
                };
            } catch (error) {
                console.error('Update Transaction Error:', error.message);
                return {
                    success: false,
                    message: 'Failed to update transaction',
                };
            }
        },
       
    }
};

module.exports = resolvers;
