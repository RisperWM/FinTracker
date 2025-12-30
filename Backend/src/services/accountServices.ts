
const Account = require("../models/Acount")

const createDefaultAccounts = async (userId: string) => {
    const defaultAccounts = [
        { userId, name: "Bank", type: "bank", balance: 0 },
        { userId, name: "Savings", type: "savings", balance: 0 },
        { userId, name: "Loans", type: "loan", balance: 0 },
        { userId, name: "Debt", type: "debt", balance: 0 },
    ];

    // Insert all accounts at once
    await Account.insertMany(defaultAccounts);
};
module.exports = createDefaultAccounts;