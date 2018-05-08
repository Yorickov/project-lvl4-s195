export default (sequelize, DataTypes) => {
  const TaskTag = sequelize.define('TaskTag', {
    // taskId: {
    //   type: DataTypes.INTEGER,
    //   references: {
    //     model: 'Status',
    //     key: 'id',
    //   },
    // },
    // tagId: {
    //   type: DataTypes.INTEGER,
    //   references: {
    //     model: 'Tag',
    //     key: 'id',
    //   },
    // },
  }, {
    freezeTableName: true,
  });
  return TaskTag;
};
