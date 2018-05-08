export default (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    name: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        len: {
          args: [2, 10],
          msg: 'Must be from 2 to 10 symbols',
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
