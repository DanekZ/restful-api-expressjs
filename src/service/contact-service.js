import { createContactValidation, getContactValidation, searchContactValidation, updateContactValidation } from "../validation/contact-validation.js";
import { validate } from "../validation/validation.js";
import { prismaClient } from "../application/database.js"
import { ResponseError } from "../error/response-error.js";

const create = async (user, request) => {

   const contact = await validate(createContactValidation, request);

   contact.value.username = user.username;

   return prismaClient.contact.create({
      data: contact.value,
      select: {
         id: true,
         firstName: true,
         lastName: true,
         email: true,
         phone: true
      }
   })
};

const get = async (user, contactId) => {
   contactId = validate(getContactValidation, contactId);

   const contact = await prismaClient.contact.findFirst({
      where: {
         username: user.username,
         id: contactId.value
      },
      select: {
         id: true,
         firstName: true,
         lastName: true,
         email : true,
         phone: true
      }
   });

   if(!contact) throw new ResponseError(404, "contact is not found");

   return contact;
}

const update = async (user, request) => {
   const contact = await validate(updateContactValidation, request);

   const countContactInDatabase = await prismaClient.contact.count({
      where: {
         username: user.username,
         id: contact.value.id
      }
   })

   if(countContactInDatabase == 0) throw new ResponseError(404, "contact is not found");

   return prismaClient.contact.update({
      where: {
         id: contact.value.id,
      },
      data: {
         firstName: contact.value.firstName,
         lastName: contact.value.lastName,
         email: contact.value.email,
         phone: contact.value.phone
      },
      select: {
         firstName: true,
         lastName: true,
         id: true,
         email: true,
         phone: true
      }
   })
}

const remove = async (user, contactId) => {
   contactId = validate(getContactValidation, contactId);

   const countContact = await prismaClient.contact.count({
      where: {
         username: user.username,
         id: contactId.value
      }
   });

   if(countContact == 0) throw new ResponseError(404, "contact not found");

   return prismaClient.contact.delete({
      where: {
         id: contactId.value
      }
   })
}

const search = async (user, request) => {
   request = validate(searchContactValidation, request);
   // 1 ((page - 1) * size = 0)
   // 2 ((page - 1) * size = 10)
   const skip = (request.value.page - 1) * request.value.size;

   const filter = [];

   filter.push({
      username: user.username
   })

   if(request.value.name){
      filter.push( {
         OR: [
               {
                  firstName: {
                  contains: request.value.name.firstName
                  }
               },
               {
                  lastName: {
                  contains: request.value.name.lastName
                     }
               }
            ]
         })
   };

   if(request.value.email){
      filter.push(
         {
            email: {
               contains: request.value.email
            }
         }
      )
   }

   if(request.value.phone){
      filter.push(
         {
            phone: {
               contains: request.value.phone
            }
         }
      )
   }

   const contacts = await prismaClient.contact.findMany({
      where: {
         AND : filter
      },
      take: request.value.size,
      skip: skip
   });

   const totalItems = await prismaClient.contact.count({
      where: {
         AND: filter
      }
   });

   return {
      contacts: contacts,
      paging: {
         page: request.value.page,
         totalItems: totalItems,
         totalPage: Math.ceil(totalItems / request.value.size)
      }
   }
}

export default {create, get, update, remove, search}