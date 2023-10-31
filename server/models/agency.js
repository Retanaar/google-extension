const {DataTypes, Model } = require('sequelize');
class Agency extends Model {

    static tableName() {
        return 'slug_agency'
    }

    static fields() {
        return {
            name: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false,
                unique: true,
                field: 'longname'
            },
            code: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                field: 'slugname'
            },
            agencyId: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'agencyid'
            }
        }
    }
}

module.exports = Agency;