export default (sequelize, DataTypes) => {
  const Status = sequelize.define('Status', {
    name: {
      type: DataTypes.STRING,
      unique: true,
      defaultValue: 'New',
      validate: {
        notEmpty: {
          args: true,
          msg: 'cannot be empty',
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
