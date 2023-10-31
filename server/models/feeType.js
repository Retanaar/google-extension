const {DataTypes, Model } = require('sequelize');
class FeeType extends Model {

    static tableName() {
        return 'feetype'
    }

    static fields() {
        return {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            shortName: {
                type: DataTypes.STRING(50),
                field: 'shortdesc', // Use the original column name in snake_case
            },
            longName: {
                type: DataTypes.STRING(100),
                field: 'longdesc', // Use the original column name in snake_case
            },
            multiplier: {
                type: DataTypes.DECIMAL(14, 3),
            }
        }
    }
}

module.exports = FeeType;