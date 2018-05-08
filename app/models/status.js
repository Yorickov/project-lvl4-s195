export default (sequelize, DataTypes) => {
  const Status = sequelize.define('Status', {
    name: {
      type: DataTypes.STRING,
      unique: true,
      defaultValue: 'New',
      validate: {
        len: {
          args: [2, 15],
          msg: 'Must be from 2 to 15 symbols',
        },
      },
    },
  }, {
    freezeTableName: true,
  });
  Status.associate = (models) => {
    Status.hasMany(models.Task, {
      foreignKey: 'statusId',
      as: 'status',
    });
  };
  return Status;
};
