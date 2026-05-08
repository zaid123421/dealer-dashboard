import axios from "axios";

/**
 * Axios instance for public (unauthenticated) API calls.
 * No Authorization header and no global 401 redirect.
 */
const publicApi = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_BACKEND_URL_FOR_SERVER_REQUESTS ||
    "https://api.treadx.uqarsoft.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default publicApi;
