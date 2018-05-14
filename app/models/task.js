export default (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'cannot be empty',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
    },
    statusId: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    creatorId: {
      type: DataTypes.INTEGER,
    },
    assignedToId: {
      type: DataTypes.INTEGER,
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
  Task.associate = (models) => {
    Task.belongsTo(models.User, {
      as: 'creator',
    });
    Task.belongsTo(models.User, {
      as: 'assignedTo',
    });
    Task.belongsTo(models.Status, {
      as: 'status',
    });
    Task.belongsToMany(models.Tag, {
      through: 'TaskTag',
    });
  };
  return Task;
};
