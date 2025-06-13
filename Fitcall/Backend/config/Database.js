import { Sequelize } from "sequelize";

const db = new Sequelize('capstone_project', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',   
});

export default db;