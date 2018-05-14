import { encrypt } from '../lib/secure';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'cannot be empty',
        },
      },
    },
    lastName: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'cannot be empty',
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: {
          args: true,
          msg: 'Must have valid format',
        },
      },
    },
    passwordDigest: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.VIRTUAL,
      set: function (value) { // eslint-disable-line
        this.setDataValue('passwordDigest', encrypt(value));
        this.setDataValue('password', value);
        return value;
      },
      validate: {
        len: {
          args: [2, 20],
          msg: 'Must be from 2 to 20 symbols',
        },
      },
    },
  }, {
    getterMethods: {
      fullName() {
        return `${this.firstName} ${this.lastName}`;
      },
    },
    freezeTableName: true,
  });

  User.associate = (models) => {
    User.hasMany(models.Task, {
      foreignKey: 'assignedToId',
      as: 'assignedTo',
    });
    User.hasMany(models.Task, {
      foreignKey: 'creatorId',
      as: 'creator',
    });
  };

  return User;
};
