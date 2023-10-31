const db = require("../modules/db");
const feesService = require("./fees/fees.service");

class CampaignController {
    _transaction;
    async addFeeToCampaign(campaign) {
        const fees = await feesService.getCampaignFees(campaign.id);
        delete campaign.id;
        if (fees) {
            campaign.fees = fees;
        }
        return campaign;
    }
    async openTransaction() {
        this._transaction = await db.newTransaction();
    }
    async commitTransaction() {
        if (this._transaction) {
            await this._transaction.commit();
            this._transaction = null;
        }
    }
    async rollbackTransaction() {
        if (this._transaction) {
            await this._transaction.rollback();
            this._transaction = null;
        }
    }
}

module.exports = CampaignController;