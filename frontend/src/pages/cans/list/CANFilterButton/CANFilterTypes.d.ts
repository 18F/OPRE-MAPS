export type FilterOption = {
    id: number;
    title: string;
};

export type Filters = {
    activePeriod?: FilterOption[];
    transfer?: FilterOption[];
    portfolio?: FilterOption[];
    // Add other filter types here
};
