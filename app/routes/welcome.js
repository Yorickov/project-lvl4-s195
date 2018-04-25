import buildFormObj from '../lib/formObjectBuilder';
import { User } from '../../db/models';

export default (router) => {
  router.get('root', '/', (ctx) => {
    const user = User.build();
    ctx.render('welcome/index', { formElement: buildFormObj(user) });
  });
};
