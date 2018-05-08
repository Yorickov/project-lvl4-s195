export default (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [2, 20],
          msg: 'Must be from 2 to 20 symbols',
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
      allowNull: false,
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
