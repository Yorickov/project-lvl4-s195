export default (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    name: {
      type: DataTypes.STRING,
      unique: true,
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
  Tag.associate = (models) => {
    Tag.belongsToMany(models.Task, {
      through: 'TaskTag',
    });
  };
  return Tag;
};
