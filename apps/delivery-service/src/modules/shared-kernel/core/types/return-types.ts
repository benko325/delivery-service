export type CommandSucceededWithId = {
    id: string;
};

export type CommandSucceededWithBool = {
    success: boolean;
};

export type PaginatedResult<T> = {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
};

export type Address = {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
};

export type Money = {
    amount: number;
    currency: string;
};
