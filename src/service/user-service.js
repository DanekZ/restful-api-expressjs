import { validate } from "../validation/validation.js"
import { registerUserValidation, loginUserValidation, getUserValidation, updateUserValidation } from "../validation/user-validation.js"
import { prismaClient } from "../application/database.js"
import { ResponseError } from "../error/response-error.js"
import bcrypt from 'bcrypt';
import {v4 as uuid} from 'uuid';

const register = async (request) => {

   const user = validate(registerUserValidation, request);

   const countUser = await prismaClient.user.count({
      where: {
         username: user.value.username
      }
   })

   if(countUser === 1) {
      throw new ResponseError(400, "Username Already Exist");
   } 

   user.value.password = await bcrypt.hash(user.value.password, 10)

   const result = await prismaClient.user.create({
      data: user.value,
      select: {
         username: true,
         name: true
      }
   })
   return result;
}

const login = async (request) => {
   const loginRequest = validate(loginUserValidation, request);

   const user = await prismaClient.user.findUnique({
      where: {
         username: loginRequest.value.username
      },
      select: {
         username: true,
         password: true
      }
   })

   if(!user) throw new ResponseError(401, "username or password wrong!");

   const isPasswordValid = await bcrypt.compare(loginRequest.value.password, user.password);

   if(!isPasswordValid) throw new ResponseError(401, "username or password wrong")

   const token = uuid().toString();
   return await prismaClient.user.update({
      data: {
         token
      },
      where: {
         username: user.username
      },
      select: {
         token: true
      }
   })
}

const get  = async(username) => {
   username = validate(getUserValidation, username);

   const user = await prismaClient.user.findUnique({
      where: {
         username: username.value
      },
      select: {
         name: true, 
         username: true
      }
   })

   if(!user) throw new ResponseError(404, "user is not found");

   return user;
}

const update = async(request) => {
   const user = validate(updateUserValidation, request);

   const countUser = await prismaClient.user.count({
      where: {
         username: user.value.username
      }
   })

   if(countUser == 0) throw new Error(401, "user not found");

   const data = {};

   if(user.value.name){
      data.name = user.value.name;
   }

   if(user.value.password){
      data.password = await bcrypt.hash(user.value.password, 10);
   }

   return prismaClient.user.update({
      where: {
         username: user.value.username
      },
      data: data,
      select: {
         username: true,
         name: true
      }
   })

 
}

const logout = async(username) => {
   username = await validate(getUserValidation, username);

   const user = await prismaClient.user.findUnique({
      where: {
         username: username.value
      }
   });
   
   if(!user) throw new ResponseError(401, "user is not found");

   return prismaClient.user.update({
      where: {
         username: user.username
      },
      data: {
         token: null
      },
       select: {
         username: true
       }
   })
}

export default {register, login, get, update, logout}