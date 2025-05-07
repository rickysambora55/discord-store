export default (sequelize, DataTypes) => {
    const Buy = sequelize.define(
        "Buy",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            id_product: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false,
            },
            id_user: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            id_transaction: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            id_message: {
                type: DataTypes.STRING,
                defaultValue: "",
                allowNull: false,
            },
            status: {
                type: DataTypes.STRING,
                defaultValue: "pending",
                allowNull: false,
            },
        },
        {
            timestamps: true,
        }
    );

    Buy.associate = (models) => {
        Buy.belongsTo(models.Product, {
            foreignKey: "id_product",
            targetKey: "id",
        });
    };

    return Buy;
};
