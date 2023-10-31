const {DataTypes, Model } = require('sequelize');
class PageType extends Model {

    static tableName() {
        return 'slug_pagetype'
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

module.exports = PageType;