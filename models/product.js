export default (sequelize, DataTypes) => {
    const Product = sequelize.define(
        "Product",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            id_category: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            price: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false,
            },
            discount: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false,
            },
            picture: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            buyable: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
        },
        {
            timestamps: true,
        }
    );

    Product.associate = (models) => {
        Product.belongsTo(models.Category, {
            foreignKey: "id_category",
            targetKey: "id",
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        });
    };

    return Product;
};
