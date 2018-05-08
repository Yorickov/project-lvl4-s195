import db from './models';

export default async () => {
  await db.sequelize.sync({ force: true });
  await db.Status.bulkCreate([
    { name: 'New' },
    { name: 'In progress' },
    { name: 'On testing' },
    { name: 'Done' },
  ]);
};
