import {validate} from "../validation/validation.js";
import {getContactValidation} from "../validation/contact-validation.js"
import {prismaClient} from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import {createAddressValidation, getAddressValidation, updateAddressValidation} from "../validation/address-validation.js";
import { request } from "express";

const checkContactMustExist = async (user, contactId) => {
   contactId =  validate(getContactValidation, contactId);

   const countContact = await prismaClient.contact.count({
      where: {
         id: contactId.value,
         username: user.username
      }
   });

   if(countContact !== 1){
      throw new ResponseError(404, "contact not found");
   };

   return contactId
   
}

const create = async (user, contactId, request) => {
   contactId =  await checkContactMustExist(user, contactId);

   const address = validate(createAddressValidation, request);
   address.value.contact_id = contactId.value


   return prismaClient.address.create({
      data: address.value,
      select: {
         id: true,
         street: true,
         city : true,
         province: true,
         country: true,
         postal_code: true
      }
   })
};

const get = async(user, contactId, request) => {
   contactId = await checkContactMustExist(user, contactId);

   const addressId = validate(getAddressValidation, request);

   const address = await prismaClient.address.findFirst({
      where: {
         id: addressId.value,
         contact_id: contactId.value
      },
      select: {
         id: true,
         street: true,
         city : true,
         province: true,
         country: true,
         postal_code: true
      }
   });

   if(!address) throw new ResponseError(404, "address not found");

   return address;
}

const update = async(user, contactId, request) => {
   contactId = await checkContactMustExist(user, contactId);
   const address = validate(updateAddressValidation, request);

   const countAddress = await prismaClient.address.count({
      where: {
         id: address.value.id,
         contact_id: contactId.value.id
      }
   })

   if(countAddress !== 1) throw new ResponseError(404, "address not found");

   return prismaClient.address.update({
      where: {
         id: address.value.id
      }, 
      data: {
         street: address.value.street,
         city: address.value.city,
         province: address.value.province,
         country: address.value.country,
         postal_code: address.value.postal_code,
      },
      select: {
         id: true,
         street: true,
         city: true,
         province: true,
         country: true,
         postal_code: true,
      }
   })
}

const remove = async (user, contactId, adressesId) => {
   contactId = await checkContactMustExist(user, contactId);
   const addressId = validate(getAddressValidation, adressesId);

   const countAddress = await prismaClient.address.count({
      where: {
         id: addressId.value,
         contact_id: contactId.value
      }
   });

   if(countAddress !== 1) throw new ResponseError(404, "address not found");

   return prismaClient.address.delete({
      where: {
         id: addressId.value
      }
   });
}

const list = async(user, contactId) => {
   contactId = await checkContactMustExist(user, contactId);
   
   return prismaClient.address.findMany({
      where: {
         contact_id: contactId.value
      },
      select: {
         id: true,
         street: true,
         city: true,
         province: true,
         country: true,
         postal_code: true,
      }
   })
}

export default {create, get, update, remove, list}