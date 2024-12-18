// schema.js
const { gql } = require('apollo-server');

const typeDefs = gql`
    type LoginResult {
        message: String
        userType: String
        fullName: String
        email: String
        employeeType: String
        hireDate: String
        contractID: String
        employeeID:String
        status: String
        supervisorID: String
        adminID: String
        isFirstLogin: Boolean
        IsFirstLogin:Boolean

    }



    type Supervisor {
        SupervisorID: String!
        FullName: String!
        Email: String!
        Department: String!
        Address: String!
        SSN: String!
        IsFirstLogin: Boolean!
    }

    
    type Employee {
    EmployeeID: String!
    FullName: String!
    Email: String!
    EmployeeType: String!
    SSN: String!
    Address: String!
    Phone: String
    HireDate: String
    BankDetails: BankDetail
    isFirstLogin: Boolean!
    } 


    input EmployeeInput {
        employeeID: String!
        fullName: String!
        email: String!
        password: String!
        employeeType: String!
        ssn: String!
        address: String!
        phone: String
        bankDetails: BankDetailInput
        isFirstLogin: Boolean!
        hireDate: String!
    }

    type BankDetail {
        accountHolderName: String
        accountNumber: String
        bankName: String
        routingNumber: String
    }

    input BankDetailInput {
        accountHolderName: String
        accountNumber: String
        bankName: String
        routingNumber: String
    }

    type UpdatePasswordResponse {
        message: String!
        success: Boolean!
    }




    type Contract {
        ContractID: String!
        EmployeeID: String!
        ContractType: String!
        HourlyRate: Float
        PayrollFrequency: String
        MonthlySalary: Float
        StartDate: String!
        EndDate: String!
    }

    input ContractInput {
        contractID: String!
        employeeID: String!
        contractType: String!
        hourlyRate: Float
        payrollFrequency: String
        monthlySalary: Float
        startDate: String!
        endDate: String!
    }


    
    type Payroll {
    PayrollID: String
    EmployeeID: String
    ContractID: String
    PayPeriod: String
    TotalHoursWorked: Float
    OvertimeHours: Float
    GrossPay: Float
    NetPay: Float
    PaymentDate: String
    Status: String
    }

    type LateTransaction {
    transactionID: String
    employeeID: String
    clockInTime: String
    shiftDate: String
    shiftStatus: String
}

    type UpdateTransactionResponse {
    success: Boolean!
    message: String!
}




    type Query {
        login(email: String!, password: String!, userType: String!): LoginResult
        getLatestTransaction(employeeID: String!): Transaction
        getEmployeeTransactions(employeeID: String!): [Transaction]
        getEmployeeContract(employeeID: String!): Contract
        getPayroll(employeeID: String!): [Payroll]
        getTransactions(employeeID: String!, date: String!): [Transaction]
        getLateReport: [LateTransaction]
        getNextSupervisorID: String!
        checkEmail(email: String!): Boolean!
        getNextEmployeeID: String!
        getNextContractID: String!
    }
    
    type Transaction {
        TransactionID: String
        EmployeeID: String
        ShiftDate: String
        ClockInTime: String
        ClockOutTime: String
        ShiftStatus: String
        SupervisorComments: String
    }

    
    type TransactionUpdateResponse {
    message: String
    success: Boolean
}

    type Mutation {
        clockIn(employeeID: String!): Transaction
        clockOut(employeeID: String!): Transaction

        updateTransaction(
        transactionID: String!
        clockInTime: String
        clockOutTime: String
        shiftStatus: String
        supervisorComments: String
    ): TransactionUpdateResponse


    addSupervisor(
            supervisorID: String!
            fullName: String!
            email: String!
            password: String!
            department: String!
            address: String!
            ssn: String!
        ): Supervisor!
        
    addEmployee(employeeInput: EmployeeInput!): Employee!
    addContract(contractInput: ContractInput!): Contract

    updatePassword(userID: String!, newPassword: String!, userType: String!): UpdatePasswordResponse!
    updateTransaction1(transactionID: String!, comment: String!, status: String!): UpdateTransactionResponse!

    }
`;


module.exports = typeDefs;
