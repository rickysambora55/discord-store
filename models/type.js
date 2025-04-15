export default (sequelize, DataTypes) => {
    const Type = sequelize.define(
        "Type",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            timestamps: true,
        }
    );

    Type.associate = (models) => {
        Type.hasMany(models.Category, {
            sourceKey: "id",
            foreignKey: "id_type",
            onDelete: "CASCADE",
        });
    };

    return Type;
};
