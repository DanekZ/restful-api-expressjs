import supertest from "supertest";
import {web} from "../src/application/web.js"
import { createManyTestAddress, createTestAddress, createTestContact, createTestUser, getTestAddress, getTestContact, removeAllTestAddresses, removeAllTestContacts, removeTestUser } from "./test-util.js"

describe('POST /api/contacts/:contactId/addresses', () => {
   beforeEach(async () => {
      await createTestUser();
      await createTestContact();
   });

   afterEach(async () => {
      await removeAllTestAddresses();
      await removeAllTestContacts();
      await removeTestUser();
   });

   it('should add addresses', async () => {
      const contactTest = await getTestContact();
      const result = await supertest(web)
                           .post(`/api/contacts/${contactTest.id}/addresses`)
                           .set({authorization: "test"})
                           .send({
                              street: "jalan test",
                              city: "kota test",
                              province: "provinsi test",
                              country: "Indonesia",
                              postal_code: "23132"
                           });

      expect(result.status).toBe(200);
      expect(result.body.data.id).toBeDefined();
      expect(result.body.data.street).toBe("jalan test");
      expect(result.body.data.province).toBe("provinsi test");
      expect(result.body.data.country).toBe("Indonesia");
      expect(result.body.data.postal_code).toBe('23132');
   });

   it('should reject because invalid request', async () => {
      const contactTest = await getTestContact();
      const result = await supertest(web)
                           .post(`/api/contacts/${contactTest.id}/addresses`)
                           .set({authorization: "test"})
                           .send({
                              street: "jalan test",
                              city: "kota test",
                              province: "provinsi test",
                              country: "",
                              postal_code: ""
                           });

      expect(result.status).toBe(400);
   });


   it('should reject because contact not found', async () => {
      const contactTest = await getTestContact();
      const result = await supertest(web)
                           .post(`/api/contacts/${contactTest.id + 1}/addresses`)
                           .set({authorization: "test"})
                           .send({
                              street: "jalan test",
                              city: "kota test",
                              province: "provinsi test",
                              country: "Indonesia",
                              postal_code: "234223"
                           });

      expect(result.status).toBe(404);
   });


});

describe('GET /api/contacts/:contactId/addresses/:addressId', () => {
   beforeEach(async () => {
      await createTestUser();
      await createTestContact();
      await createTestAddress();
   });

   afterEach(async () => {
      await removeAllTestAddresses();
      await removeAllTestContacts();
      await removeTestUser();
   });

   it('should get contact ', async () => {
      const contactTest = await getTestContact();
      const addressTest = await getTestAddress();

      const result = await supertest(web)
                     .get(`/api/contacts/${contactTest.id}/addresses/${addressTest.id}`)
                     .set({authorization: "test"});
   
      expect(result.status).toBe(200);
      expect(result.body.data.id).toBeDefined();
      expect(result.body.data.street).toBe("jalan test");
      expect(result.body.data.city).toBe("kota test");
      expect(result.body.data.country).toBe("Indonesia");
      expect(result.body.data.postal_code).toBe("234133");
   });

   it('should reject cause contact not found', async () => {
       const contactTest = await getTestContact();
      const addressTest = await getTestAddress();

      const result = await supertest(web)
                     .get(`/api/contacts/${contactTest.id + 1}/addresses/${addressTest.id}`)
                     .set({authorization: "test"});
   
      expect(result.status).toBe(404);
   });

   it('should reject cause address not found', async () => {
       const contactTest = await getTestContact();
      const addressTest = await getTestAddress();

      const result = await supertest(web)
                     .get(`/api/contacts/${contactTest.id }/addresses/${addressTest.id + 1}`)
                     .set({authorization: "test"});
   
      expect(result.status).toBe(404);
   });
});

describe('PUT /api/contacts/:contactId/addresses/:addressId', () => {
   beforeEach(async () => {
      await createTestUser();
      await createTestContact();
      await createTestAddress();
   });

   afterEach(async () => {
      await removeAllTestAddresses();
      await removeAllTestContacts();
      await removeTestUser();
   });

   it('should update data address', async () => {
      const contactTest = await getTestContact();
      const addressTest = await getTestAddress();

      const result = await supertest(web)
                     .put(`/api/contacts/${contactTest.id}/addresses/${addressTest.id}`)
                     .set({authorization: "test"})
                     .send({
                         street: "pinang bahari",
                         city: "Samarinda",
                         province: "Kalimantan Timur",
                         country: "Indonesia",
                         postal_code: "1111"
                     });
      
      expect(result.body.data.id).toBeDefined();
      expect(result.body.data.street).toBe("pinang bahari");
      expect(result.body.data.city).toBe("Samarinda");
      expect(result.body.data.province).toBe("Kalimantan Timur");
      expect(result.body.data.country).toBe("Indonesia");
      expect(result.body.data.postal_code).toBe("1111");               

   });

   it('should rejected cause invalid request', async () => {
      const contactTest = await getTestContact();
      const addressTest = await getTestAddress();

      const result = await supertest(web)
                     .put(`/api/contacts/${contactTest.id}/addresses/${addressTest.id}`)
                     .set({authorization: "test"})
                     .send({
                         street: "pinang bahari",
                         city: "Samarinda",
                         province: "Kalimantan Timur",
                         country: "",
                         postal_code: ""
                     });
      
      expect(result.status).toBe(400);
   });

   it('should rejected cause not found contact parameter', async () => {
      const contactTest = await getTestContact();
      const addressTest = await getTestAddress();

      const result = await supertest(web)
                     .put(`/api/contacts/${contactTest.id + 1}/addresses/${addressTest.id}`)
                     .set({authorization: "test"})
                     .send({
                         street: "pinang bahari",
                         city: "Samarinda",
                         province: "Kalimantan Timur",
                         country: "",
                         postal_code: ""
                     });
      
      expect(result.status).toBe(404);
   });

   it('should rejected cause not found address parameter ', async () => {
      const contactTest = await getTestContact();
      const addressTest = await getTestAddress();

      const result = await supertest(web)
                     .put(`/api/contacts/${contactTest.id + 1}/addresses/${addressTest.id}`)
                     .set({authorization: "test"})
                     .send({
                         street: "pinang bahari",
                         city: "Samarinda",
                         province: "Kalimantan Timur",
                         country: "",
                         postal_code: ""
                     });
      
      expect(result.status).toBe(404);
   });
});

describe('DELETE /api/contacts/:contactId/addresses/:addressId', () => {
   beforeEach(async () => {
      await createTestUser();
      await createTestContact();
      await createTestAddress();
   });

   afterEach(async () => {
      await removeAllTestAddresses();
      await removeAllTestContacts();
      await removeTestUser();
   });

   it('should remove address', async () => {
      const contactTest = await getTestContact();
      let addressTest = await getTestAddress();

      const result = await supertest(web)
                     .delete(`/api/contacts/${contactTest.id}/addresses/${addressTest.id}`)
                     .set({authorization: "test"});
      
      expect(result.status).toBe(200);
      expect(result.body.data).toBe("ok");

      addressTest = await getTestAddress();
      expect(addressTest).toBeNull();

   });

   it('should fail remove address cause not found contacts', async () => {
      const contactTest = await getTestContact();
      const addressTest = await getTestAddress();

      const result = await supertest(web)
                     .delete(`/api/contacts/${contactTest.id + 1}/addresses/${addressTest.id}`)
                     .set({authorization: "test"});
      
      expect(result.status).toBe(404);
   });

   it('should fail remove address cause not found address', async () => {
      const contactTest = await getTestContact();
      const addressTest = await getTestAddress();

      const result = await supertest(web)
                     .delete(`/api/contacts/${contactTest.id }/addresses/${addressTest.id + 1}`)
                     .set({authorization: "test"});
      
      expect(result.status).toBe(404);
   });
});


describe('GET /api/contacts/:contactId/addresses', () => {
   beforeEach( async ()=> {
      await createTestUser();
      await createTestContact();
      await createManyTestAddress()
   });

   afterEach(async () => {
      await removeAllTestAddresses();
      await removeAllTestContacts();
      await removeTestUser();
   });

   it('should get data address', async () => {
      const testContact = await getTestContact();
      const result = await supertest(web)
                     .get(`/api/contacts/${testContact.id}/addresses`)
                     .set({authorization: "test"})
      
      
      expect(result.status).toBe(200);
      expect(result.body.data.length).toBe(15);
   });

   it('should fail cause contact not found', async () => {
      const testContact = await getTestContact();
      const result = await supertest(web)
                     .get(`/api/contacts/${testContact.id + 1}/addresses`)
                     .set({authorization: "test"})
      
      
      expect(result.status).toBe(404);
   });
});