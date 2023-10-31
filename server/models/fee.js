const {DataTypes, Model } = require('sequelize');
class Fee extends Model {

    static tableName() {
        return 'fee'
    }

    static fields() {
        return {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            campaignId: {
                type: DataTypes.INTEGER,
                field: 'campaignid', // Use the original column name in snake_case
            },
            fee: {
                type: DataTypes.DECIMAL(14, 3),
            },
            feeTypeId: {
                type: DataTypes.INTEGER,
                field: 'feetypeid', // Use the original column name in snake_case
            },
            onPage: {
                type: DataTypes.STRING(10),
                field: 'onpage', // Use the original column name in snake_case
            },
            active: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },
            inactive: {
                type: DataTypes.DATE,
            },
        }
    }
}

module.exports = Fee;