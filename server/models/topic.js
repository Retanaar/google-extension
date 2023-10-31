const {DataTypes, Model } = require('sequelize');
class Topic extends Model {

    static tableName() {
        return 'slug_topic'
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
            }
        }
    }
}

module.exports = Topic;