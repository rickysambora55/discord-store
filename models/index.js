import { readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Sequelize, { DataTypes } from "sequelize";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const db = {};

let sequelize;
if (env === "development") {
    sequelize = new Sequelize({
        dialect: "sqlite",
        storage: "database/shop.dev.sqlite",
        logging: console.log,
    });
} else {
    sequelize = new Sequelize({
        dialect: "sqlite",
        storage: "database/shop.sqlite",
        logging: false,
    });
}
async function loadModels() {
    const files = readdirSync(__dirname).filter((file) => {
        return (
            file.indexOf(".") !== 0 &&
            file !== basename &&
            file.slice(-3) === ".js" &&
            file.indexOf(".test.js") === -1
        );
    });

    for (const file of files) {
        const modelModule = await import(`./${file}`);
        const model = modelModule.default(sequelize, DataTypes);
        db[model.name] = model;
    }

    // Set up associations
    Object.keys(db).forEach((modelName) => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;
}

await loadModels().catch((error) => console.error(error));

export default db;
