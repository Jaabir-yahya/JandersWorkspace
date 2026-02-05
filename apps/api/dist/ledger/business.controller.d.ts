import { BusinessService } from './business.service';
import { CreateSupplyDto, UpdateSupplyDto, SupplyDto, InventoryDto, CreateInvoiceDto, InvoiceDto, CreatePaymentDto, PaymentDto, InventoryContainerDto, CreateInventoryContainerDto, UpdateInventoryContainerDto, InventoryContainerItemDto, AddContainerItemDto } from './dto/business.dto';
export declare class BusinessController {
    private readonly businessService;
    constructor(businessService: BusinessService);
    createSupply(req: any, createSupplyDto: CreateSupplyDto): Promise<SupplyDto>;
    findAllSupplies(req: any): Promise<SupplyDto[]>;
    findOneSupply(req: any, id: string): Promise<SupplyDto>;
    updateSupply(req: any, id: string, updateSupplyDto: UpdateSupplyDto): Promise<SupplyDto>;
    removeSupply(req: any, id: string): Promise<void>;
    getInventory(req: any): Promise<InventoryDto[]>;
    getInventoryItem(req: any, id: string): Promise<InventoryDto>;
    getContainers(req: any, entityId?: string): Promise<InventoryContainerDto[]>;
    getContainer(req: any, id: string): Promise<InventoryContainerDto>;
    createContainer(req: any, dto: CreateInventoryContainerDto): Promise<InventoryContainerDto>;
    updateContainer(req: any, id: string, dto: UpdateInventoryContainerDto): Promise<InventoryContainerDto>;
    deleteContainer(req: any, id: string): Promise<void>;
    getContainerItems(req: any, id: string): Promise<InventoryContainerItemDto[]>;
    addContainerItem(req: any, id: string, dto: AddContainerItemDto): Promise<InventoryContainerItemDto>;
    createInvoice(req: any, createInvoiceDto: CreateInvoiceDto): Promise<InvoiceDto>;
    findAllInvoices(req: any): Promise<InvoiceDto[]>;
    findOneInvoice(req: any, id: string): Promise<InvoiceDto>;
    createPayment(req: any, createPaymentDto: CreatePaymentDto): Promise<PaymentDto>;
    findAllPayments(req: any): Promise<PaymentDto[]>;
    findOnePayment(req: any, id: string): Promise<PaymentDto>;
}
