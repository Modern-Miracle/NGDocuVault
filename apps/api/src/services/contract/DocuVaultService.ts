import { Contract } from 'ethers';
import { DocuVaultABI } from '../../constants';
import { config } from '../../config/blockchain.config';
import { signer } from '../../helpers/get-signer';

export class DocuVaultService {
  private contract: Contract;

  constructor() {
    this.contract = new Contract(
      config.docuVaultContractAddress,
      DocuVaultABI,
      signer
    );
  }

  async checkAccess(cid: string, address: string): Promise<boolean> {
    return this.contract.checkAccess(cid, address);
  }
}
