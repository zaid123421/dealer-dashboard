import GeneralResponse from "./GeneralResponse";

export interface Pagination<ItemT> {
    limit: number,
    page: number,
    pages: number,
    totalItems: number,
    items: ItemT[]
}

interface PaginationResponse<ItemT> extends GeneralResponse<ItemT> {
    pagination: Pagination<ItemT>
}
export default PaginationResponse;
