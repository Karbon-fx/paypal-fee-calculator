# **App Name**: PayPal Fee Calculator

## Core Features:

- Input Fields: User input for payment amount, currency selection, and PayPal fee rate using accessible numeric inputs and dropdowns.
- Real-time Input Validation: The system validates user inputs in real-time, disabling the 'Calculate' button until all validations pass.
- Calculation Engine: Includes all calculations for: PayPal percentage fee (based on the tier selected), Fixed fee (based on currency), Currency conversion fee (4% markup on the exchange rate), Final INR amount and a comparison to Karbon payout
- Contextual Help (tooltips): Tooltips provide contextual help and clear explanations for input/output fields
- Output Display: Presents the fee breakdown and final amount to be received. Displays inline error messages if applicable, as input changes.
- Reset Functionality: A reset button to clear all inputs and errors, enabling the user to quickly begin a fresh calculation.

## Style Guidelines:

- Primary color: A vibrant blue (#2962FF) to represent trust and reliability in financial calculations.
- Background color: A very light blue (#F0F5FF), to visually harmonize with the primary blue, creating a calm, professional, unobtrusive feeling.
- Accent color: A vivid yellow-orange (#FFAB40) as an accent to draw the eye to important callouts like final calculations or key tooltips. It creates good contrast and draws attention to important details.
- Body and headline font: 'Inter', a grotesque-style sans-serif, to impart a modern, machined, objective, neutral, precise look appropriate to financial matters
- Consistent use of simple, clear icons for currencies, tooltips and actions like 'Calculate' and 'Reset'. Use the same icon family as shown in the attached wireframes, and visually distinguish them from the text. Icons should use the primary blue.
- Figma designs (imported or linked) to auto-generate page layouts, field groupings, and user flows.
- Use subtle, non-distracting transitions to indicate the state of an input field. A brief, unobtrusive highlight of the final amount after pressing 'Calculate'.