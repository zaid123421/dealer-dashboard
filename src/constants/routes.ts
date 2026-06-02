export const ROUTES = {
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    ACTIVATE_ACCOUNT: "/activate-account",
  },

  DASHBOARD: {
    ROOT: "/dashboard",
    PROFILE: "/dashboard/profile",
    DELIVERY_CART: "/dashboard/delivery-cart",
    PICKUP_CART: "/dashboard/pickup-cart",
    PICKUP_ORDERS: "/dashboard/pickup-orders",
    CUSTOMERS: "/dashboard/customers",
    CUSTOMERS_ADD: "/dashboard/customers/add",
    CUSTOMER_EDIT: (customerId: string) =>
      `/dashboard/customers/${customerId}/edit`,
    CUSTOMER_ADD_VEHICLE: (customerId: string) =>
      `/dashboard/customers/${customerId}/add-vehicle`,
    STAFF: "/dashboard/staff",
    EMAIL_INBOX: "/dashboard/email-inbox",
    REPORTS: "/dashboard/reports",
    PRODUCTS: {
      LIST: "/dashboard/products",
      ADD: "/dashboard/products/add",
      DETAILS: (id: string | number) => `/dashboard/products/${id}`,
    },
    ORDERS: {
      LIST: "/dashboard/orders",
      DETAILS: (id: string | number) => `/dashboard/orders/${id}`,
    },
    SESSIONS: "/dashboard/sessions",
    INVENTORY: "/dashboard/inventory",
    STOCK: "/dashboard/stock",
  },

  ERRORS: {
    NOT_FOUND: "/404",
    FORBIDDEN: "/403",
  }
} as const;

export type AppRoutes = typeof ROUTES;