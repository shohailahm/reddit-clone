import "reflect-metadata";
import { MikroORM } from '@mikro-orm/core'
// import { Post } from './entities/Post';
import mikroConfig from './mikro-orm.config'
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/postResolver';
import { UserResolver } from './resolvers/user';
import redis from 'redis';
import session from 'express-session';
import ConnectRedis from 'connect-redis'
import { MyContext } from 'src/types';

 


const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up()
  const app = express();
  const  RedisStore = ConnectRedis(session)
  const  redisClient = redis.createClient()
  app.use(
    session({
    name:'qid',
    store: new RedisStore({ 
    client: redisClient,
    disableTouch:true
    }),
    cookie:{
      maxAge:1000*60*60*24*365*10,
      httpOnly:true,
      sameSite:'lax'
    },
    secret: 'reddit',
    resave: false,
  })
)
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver,PostResolver,UserResolver],
      validate: false,
     
    }),
     context:({req,res}):MyContext=>({em:orm.em,req,res})
  })
  apolloServer.applyMiddleware({app});
  app.listen(4000, () => {
    console.log('server is running on port 4000');
    
  })
  
}

main();
console.log("hello");
