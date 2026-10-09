// Values of the `permission` enum on the Users table.
export const PERMISSIONS = ["approved", "pending", "rejected"] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const ADMIN_ROLE = "admin";
