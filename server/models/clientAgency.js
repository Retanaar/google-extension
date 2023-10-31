const {DataTypes, Model } = require('sequelize');
class ClientAgency extends Model {
    static tableName() {
        return 'agency_client'
    }
    static fields() {
        return {
            oid: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false,
                unique: true,
                field: 'oid'
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                field: 'organizationname'
            },
            onpage: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'onpage'
            },
            fee: {
                type: DataTypes.DECIMAL(14,3),
                allowNull: true,
                field: 'fee1'
            },
            feeType: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'feetype1'
            },
            fee2: {
                type: DataTypes.DECIMAL(14,3),
                allowNull: true,
                field: 'fee2'
            },
            fee2Type: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'feetype2'
            },
        }
    }
}

module.exports = ClientAgency;