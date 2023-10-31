const {DataTypes, Model } = require('sequelize');
class Slug extends Model {

    static tableName() {
        return 'slug'
    }

    static fields() {
        return {
            id: {
                type: DataTypes.STRING(100),
                allowNull: false,
                primaryKey: true,
                field: 'slug', // Use the original column name in snake_case
            },
            client: {
                type: DataTypes.STRING(10),
                field: 'client', // Use the original column name in snake_case
            },
            pageType: {
                type: DataTypes.STRING(10),
                field: 'pagetype', // Use the original column name in snake_case
            },
            agency: {
                type: DataTypes.STRING(10),
                field: 'agency', // Use the original column name in snake_case
            },
            source: {
                type: DataTypes.STRING(10),
                field: 'source', // Use the original column name in snake_case
            },
            campaign: {
                type: DataTypes.STRING(50),
                field: 'campaign', // Use the original column name in snake_case
            },
            topic: {
                type: DataTypes.STRING(50),
                field: 'topic', // Use the original column name in snake_case
            },
            medium: {
                type: DataTypes.STRING(10),
                field: 'medium', // Use the original column name in snake_case
            },
            dateSlug: {
                type: DataTypes.STRING(20),
                field: 'dateslug', // Use the original column name in snake_case
            },
            created: {
                type: DataTypes.DATE,
                field: 'created', // Use the original column name in snake_case
                defaultValue: DataTypes.NOW
            },
            sourceCode: {
                type: DataTypes.STRING(250),
                field: 'sourcecode', // Use the original column name in snake_case
            },
            pageName: {
                type: DataTypes.STRING(250),
                field: 'pagename', // Use the original column name in snake_case
            },
            conduitoid: {
                type: DataTypes.STRING(50),
                field: 'conduitoid', // Use the original column name in snake_case
            },
        }
    }
}

module.exports = Slug;