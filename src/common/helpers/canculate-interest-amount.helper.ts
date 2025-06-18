export function calculateInterestAmount(debt: number, interestRate: number, days: number): number {
    return (debt * (interestRate / 100) * days) / 365;
}
