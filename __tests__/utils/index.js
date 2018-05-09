import faker from 'faker';

export const initFaker = () => {
  const userInit = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };

  const user = { ...userInit, confirmedPassword: userInit.password };
  return (options = {}) => ({ ...user, ...options });
};

export const initTask = () => {
  const taskInit = {
    name: 'Alex',
    description: faker.random.word(),
    statusId: 1,
    assignedToId: 1,
    tags: [''],
  };
  return taskInit;
};

export const getCookieRequest = res =>
  res.headers['set-cookie'][0]
    .split(',')
    .map(item => item.split(';')[0])
    .join(';');
