interface CanReffil {

    shouldRefill(nbPreviewPieces: number): boolean;
    canRefill(): boolean;
    refill(): void;
}

const canRefill = (generator: any): boolean => "shouldRefill" in generator && "refill" in generator

export { CanReffil, canRefill }