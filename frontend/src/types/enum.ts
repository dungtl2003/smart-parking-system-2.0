enum Role {
  STAFF = "STAFF",
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER",
}

enum SlotStatus {
  AVAILABLE = "AVAILABLE",
  UNAVAILABLE = "UNAVAILABLE",
}

enum SchemaResponse {
  REQUIRED = "Cannot be blank",
  INVALID = "invalid",
  EMAIL_INVALID = "Invalidate email address",
  PASSWORD_INVALID = "Type at least 6 characters",
}

enum CardScanningType {
  CHECKIN = "CHECKIN",
  CHECKOUT = "CHECKOUT",
}

export { Role, SlotStatus, SchemaResponse, CardScanningType };
