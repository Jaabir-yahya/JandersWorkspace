import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class TransactionsService {
  async create(payload: any) {
    // TODO: validate payload, compute totals, insert transaction + lines
    throw new NotImplementedException('Create transaction not implemented yet');
  }

  async list() {
    // TODO: implement pagination and filtering
    throw new NotImplementedException('List transactions not implemented yet');
  }

  async get(id: string) {
    // TODO: fetch transaction with lines
    throw new NotImplementedException('Get transaction not implemented yet');
  }

  async reverse(id: string, body: any) {
    // TODO: implement reversal logic
    throw new NotImplementedException('Reverse transaction not implemented yet');
  }
}
