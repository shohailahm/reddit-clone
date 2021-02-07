import { Query, Resolver,Mutation, Arg, InputType, Field, Ctx,ObjectType } from "type-graphql";
import { MyContext } from 'src/types';
import { User } from './../entities/User';
import * as argon2 from "argon2";

@ObjectType()
class userResponse{
  @Field(() =>[FieldError],{nullable:true})
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
class FieldError{
  @Field()
  field: string
  
  @Field()
  message:string
}

@InputType()
class userNamePasswordInfo{
  @Field()
  username: string
  @Field()
  password:string
  }

@Resolver()
export class UserResolver {
  @Mutation(()=>userResponse)
  async register(
    @Arg('options') options: userNamePasswordInfo,
    @Ctx() {em}:MyContext
  ) {
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, { username: options.username, password: hashedPassword })
    try {
       await em.persistAndFlush(user);
       
    } catch (error) {
      console.log(error.code);
      
      if (error.code == "23505") {
        return {
          errors: [{
            field: 'username',
            message: 'username is already taken'
          }]
        }
        
      }
    }
   return {user};
  }

   @Query(()=>userResponse)
  async login(
    @Arg('options') options: userNamePasswordInfo,
    @Ctx() {em,req}:MyContext
   ) : Promise<userResponse> {
     const user = await em.findOne(User, { username: options.username })
     if (!user) {
       return {
         errors: [{
           field: 'Username',
           message:'could not find the username'
         }]
       }
     }
     const valid = await argon2.verify(user.password, options.password)
     if (!valid) {
         return {
         errors: [{
           field: 'Password',
           message:"Password doesn't match"
         }]
       }
     }
     req.session.userId=user.id
    // const hashedPassword = await argon2.hash(options.password);
    // const user = em.create(User, { username: options.username,password:hashedPassword })
    // await em.persistAndFlush(user);
     return { user };
  }

}