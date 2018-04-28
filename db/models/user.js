import { encrypt } from '../../app/lib/secure';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [2, 20],
          msg: 'Must be from 2 to 20 symbols',
        },
      },
    },
    lastName: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [2, 20],
          msg: 'Must be from 2 to 20 symbols',
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
          args: [2, 50],
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
  });
  return User;
};

