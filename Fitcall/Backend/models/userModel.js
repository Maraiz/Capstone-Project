import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Users = db.define('users', {
    // Basic Info (Step 1)
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 50]
        }
    },
    
    // Personal Info (Step 2)  
    country: {
        type: DataTypes.STRING,
        allowNull: true
    },
    gender: {
        type: DataTypes.ENUM('male', 'female'),
        allowNull: true
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 13,
            max: 100
        }
    },
    
    // Physical Info (Step 3)
    height: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
            min: 100,
            max: 250
        }
    },
    currentWeight: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
            min: 30,
            max: 300
        }
    },
    targetWeight: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
            min: 30,
            max: 200
        }
    },
    
    // Goals (Step 4)
    weeklyTarget: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true
    },
    targetDeadline: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    
    // Activity (Step 5)
    activityLevel: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true
    },
    
    // Calculated Results (Step 6)
    targetCalories: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    
    // Account Info (Step 7)
    username: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
            len: [3, 20]
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 255]
        }
    },
    
    // Auth
    refresh_token: {
        type: DataTypes.TEXT,
        allowNull: true
    }
},{
    freezeTableName: true
});

export default Users;