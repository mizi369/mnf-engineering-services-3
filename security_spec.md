# Security Specification for MNF Engineering Enterprise

## 1. Data Invariants
- `Booking`: Must have a valid date, customer name, and phone. Status must be one of 'Pending', 'Confirmed', 'Completed'.
- `SaleRecord`: Must have a total and valid date.
- `InventoryItem`: Stock cannot be negative.
- `Setting`: Key must be a non-empty string.
- `Customer`: Phone number is the unique identifier in business logic (though ID is random).

## 2. The "Dirty Dozen" Payloads (Deny cases)
1. Creating a `Booking` without a `phone`.
2. Updating `SaleRecord` amount to a non-number.
3. Creating a `Payroll` record with `net` salary less than 0.
4. Updating `InventoryItem` status to 'In Stock' (invalid enum, should be 'Ada').
5. Creating a `Customer` with a 2MB address string (DoS attack).
6. Unauthorized read of `mnf_payroll` without being signed in.
7. Deleting a `Setting` without admin status.
8. Injection of script tags into `ChatMessage.body`.
9. `AppDocument` total set to NaN.
10. `Employee` IC number longer than expected (e.g. 1000 characters).
11. `AiMapping` with invalid priority.
12. `mnf_chat_logs` creation with `senderRole` as 'manager' (invalid enum).

## 3. Test Runner (Conceptual)
All the above payloads should return `PERMISSION_DENIED`.
