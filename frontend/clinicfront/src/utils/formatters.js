// A standard currency formatter for positive numbers
const formatCurrency = (num) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2, // <-- FIX: Always show 2 decimal places
    maximumFractionDigits: 2, // <-- FIX: Never show more than 2
  }).format(num);

/**
 * Formats the pending amount. If negative, shows it as an excess payment.
 * @param {number} amount The pending amount.
 * @returns {{main: string, detail: string|null, isNegative: boolean}}
 */
export const formatPendingAmount = (amount) => {
  // Use a guard to ensure amount is a number, default to 0 if not.
  const numericAmount = Number(amount) || 0;

  if (numericAmount < 0) {
    const excessAmount = Math.abs(numericAmount);
    return {
      main: "₹0.00", // Display zero with decimals for consistency
      detail: `(${formatCurrency(excessAmount)} paid in excess)`,
      isNegative: true,
    };
  }

  // This will now correctly format the amount with two decimal places.
  return {
    main: formatCurrency(numericAmount),
    detail: null,
    isNegative: false,
  };
};

/**
 * Formats total earnings. If negative, shows it as an amount to be paid.
 * @param {number} amount The total earnings.
 * @returns {{main: string, detail: string|null, isNegative: boolean}}
 */
export const formatEarnings = (amount) => {
  const numericAmount = Number(amount) || 0;

  if (numericAmount < 0) {
    const toBePaid = Math.abs(numericAmount);
    return {
      main: `₹${toBePaid.toFixed(2)}`, // Using toFixed(2) directly here is also fine
      detail: `(To be paid to specialist/lab)`,
      isNegative: true,
    };
  }

  // No need for a separate "Pending" detail here, just show the earnings.
  // The formatCurrency function already handles the formatting correctly.
  return {
    main: formatCurrency(numericAmount),
    detail: null,
    isNegative: false,
  };
};
