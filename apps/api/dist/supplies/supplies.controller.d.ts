import { SuppliesService } from './supplies.service';
import type { CreateSupplyDto, SupplyDto } from './supplies.service';
export declare class SuppliesController {
    private readonly suppliesService;
    constructor(suppliesService: SuppliesService);
    createSupply(req: any, createSupplyDto: CreateSupplyDto): Promise<SupplyDto>;
    findAllSupplies(req: any): Promise<SupplyDto[]>;
    findOneSupply(req: any, id: string): Promise<SupplyDto>;
    updateSupplyStatus(req: any, id: string, status: 'PENDING' | 'RECEIVED' | 'PROCESSED'): Promise<SupplyDto>;
    deleteSupply(req: any, id: string): Promise<{
        message: string;
    }>;
}
