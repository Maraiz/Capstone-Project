import { Sequelize } from 'sequelize';
import db from '../config/Database.js';
import Users from './userModel.js';

const { DataTypes } = Sequelize;

const WorkoutSessions = db.define('workout_sessions', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Users,
      key: 'id'
    }
  },
  exerciseName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  predictedExercise: {
    type: DataTypes.STRING,
    allowNull: true // Dari ML prediction
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false // dalam detik
  },
  caloriesBurned: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  bmr: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  exerciseImage: {
    type: DataTypes.TEXT, // Base64 atau URL gambar
    allowNull: true
  },
  workoutDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  workoutTime: {
    type: DataTypes.TIME,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('completed', 'saved', 'analyzing'),
    defaultValue: 'saved'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Metadata dari backend calculation
  userWeight: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  userHeight: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  userAge: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  userGender: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  freezeTableName: true,
  timestamps: true
});

// Associations
WorkoutSessions.belongsTo(Users, { 
  foreignKey: 'userId',
  as: 'user'
});

Users.hasMany(WorkoutSessions, {
  foreignKey: 'userId', 
  as: 'workoutSessions'
});

export default WorkoutSessions;