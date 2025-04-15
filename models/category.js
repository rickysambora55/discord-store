export default (sequelize, DataTypes) => {
    const Category = sequelize.define(
        "Category",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            id_type: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                defaultValue: "",
                allowNull: false,
            },
            globalDiscount: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false,
            },
        },
        {
            timestamps: true,
        }
    );

    Category.associate = (models) => {
        Category.hasMany(models.Product, {
            sourceKey: "id",
            foreignKey: "id_category",
            onDelete: "CASCADE",
        });
        Category.belongsTo(models.Type, {
            foreignKey: "id_type",
            targetKey: "id",
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        });
    };

    return Category;
};
