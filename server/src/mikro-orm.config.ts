import { Post } from './entities/Post';
import { MikroORM } from '@mikro-orm/core'
import path from 'path';
import { User } from './entities/User';
export default {

  migrations: {
    path: path.join(__dirname,'./migrations'), // path to folder with migration files
    pattern: /^[\w-]+\d+\.[tj]s$/,},
   entities:[Post,User],
    dbName: 'lireddit',
    user: 'postgres',
    password: 'postgres',
    debug: true,
    type:'postgresql'// one of `mongo` | `mysql` | `mariadb` | `postgresql` | `sqlite`
} as Parameters<typeof MikroORM.init>[0];


