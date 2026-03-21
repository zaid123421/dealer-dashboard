import GeneralRequest from "./GeneralRequest";

interface PaginationRequest extends GeneralRequest{
    page?: number;
    limit?: number;
    search?: string;
    direction?: string;
    sort?: string;
}
export default PaginationRequest;
