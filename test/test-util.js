import {prismaClient} from '../src/application/database.js'
import bcrypt from 'bcrypt';

export const removeTestUser = async () => {
   await prismaClient.user.deleteMany({
         where: {
            username: "test"
         }
      })
}

export const createTestUser = async () => {
   await prismaClient.user.create({
      data: {
         username: "test",
         password: await bcrypt.hash('rahasia', 10),
         name: "test",
         token: "test"
      }
   })
}

export const getTestUser = async () => {
   return await prismaClient.user.findUnique({
      where: {
         username: "test"
      }  
   })
}

export const removeAllTestContacts = async () => {
   return prismaClient.contact.deleteMany({
      where: {
         username: "test"
      }
   })
}

export const createTestContact = async () => {
   return prismaClient.contact.create({
      data: {
         username: "test",
         firstName: "test",
         lastName: "test",
         email: "test@mc.com",
         phone: "0895000000"
      }
   })
}

export const createManyTestContacts = async () => {
   for(let i = 1 ; i <= 15 ; i++){
      await prismaClient.contact.create({
         data: {
            username: "test",
            firstName: `test-${i}`,
            lastName: `test-${i}`,
            email: `test${i}@mc.com`,
            phone: `0896484948294${i}`
         }
      })
   }
};

export const createManyTestAddress = async () => {
   const contact = await getTestContact();
   for(let i = 1 ; i <= 15 ; i++){
      await prismaClient.address.create({
         data: {
            street: `jalan test ${i}`,
            city: `kota test ${i}`,
            province: `provinsi test ${i}`,
            country: `Indonesia ${i}`,
            postal_code: `1234${i}`,
            contact_id: contact.id
         }
      })
   }
}

export const getTestContact = async () => {
   return prismaClient.contact.findFirst({
      where: {
         username: "test"
      }
   })
}

export const removeAllTestAddresses = async () => {
   await prismaClient.address.deleteMany({
      where: {
         contact: {
            username: "test"
         }
      }
   })
}

export const createTestAddress = async () => {
   const contactTest = await getTestContact();
   await prismaClient.address.create({
      data: {
         street: "jalan test",
         city: "kota test",
         province: "provinsi test",
         country: "Indonesia",
         postal_code: "234133",
         contact_id: contactTest.id
      }
   })
}

export const getTestAddress = async () => {
   return prismaClient.address.findFirst({
      where: {
         contact: {
            username: "test"
         }
      }
   })
}