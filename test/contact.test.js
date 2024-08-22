import supertest from "supertest";
import {web} from "../src/application/web.js"
import {createManyTestContacts, createTestContact, createTestUser, getTestContact, removeAllTestContacts, removeTestUser} from "./test-util.js";

describe('POST api/contacts', () => {

   beforeEach(async () => {
      await createTestUser();
   })

   afterEach(async () => {
      await removeAllTestContacts();
      await removeTestUser();
   })

   it('should success create contact', async () => {
      const result = await supertest(web).post('/api/contacts').set({
         authorization: "test"
      }).send({
          firstName: "test",
          lastName: "test",
          email: "test@mc.com",
          phone: "089484837484938"
      });

      expect(result.status).toBe(200);
      expect(result.body.data.id).toBeDefined();
      expect(result.body.data.firstName).toBe("test");
      expect(result.body.data.lastName).toBe("test");
      expect(result.body.data.email).toBe("test@mc.com");
      expect(result.body.data.phone).toBe("089484837484938");
   });

   it("should fail create contact causes invalid request", async() => {
      const result = await supertest(web).post("/api/contacts").set({
         authorization: "test"
      }).send({
          firstName: "",
          lastName: "",
          email: "test",
          phone: "08948483748493823232323445342342352342342352342342323"
      });

      expect(result.status).toBe(400);
      expect(result.body.errors).toBeDefined();
   })
});

describe('Get api/contact/contactId', () => {
   beforeEach(async () => {
      await createTestUser();
      await createTestContact();
   });

   afterEach(async () => {
      await removeAllTestContacts();
      await removeTestUser();
   });

   it('should can get data contact by id', async () => {
      const contact = await getTestContact();
      const result = await supertest(web).get(`/api/contacts/${contact.id}`)
                     .set({authorization: "test"});

      expect(result.status).toBe(200);
      expect(result.body.data.id).toBe(contact.id);
      expect(result.body.data.firstName).toBe(contact.firstName);
      expect(result.body.data.lastName).toBe(contact.lastName);
      expect(result.body.data.email).toBe(contact.email);
      expect(result.body.data.phone).toBe(contact.phone);
   });

   it('should failed causes contact id was wrong', async () => {
      const contact = await getTestContact();
      const result = await supertest(web)
                     .get("/api/contacts/" + contact.id + 1)
                     .set({authorization: "test"});
      
      expect(result.status).toBe(404);
   });
});

describe('Put api/contact/:contactId', () => {

   beforeEach( async () => {
      await createTestUser();
      await createTestContact();
   });

   afterEach( async () => {
      await removeAllTestContacts();
      await removeTestUser();
   })

   it('should can update contact', async () => {
      const contactTest = await getTestContact();
      const result = await supertest(web)
                     .put(`/api/contacts/${contactTest.id}`)
                     .set({authorization: "test"})
                     .send({
                        firstName: "zidane",
                        lastName: "mallaniung",
                        phone: "089384938498392",
                        email: "danezidane@gmail.com"
                     });
      
      expect(result.status).toBe(200);
      expect(result.body.data.id).toBe(contactTest.id);
      expect(result.body.data.firstName).toBe("zidane");
      expect(result.body.data.lastName).toBe("mallaniung");
      expect(result.body.data.phone).toBe("089384938498392");
      expect(result.body.data.email).toBe('danezidane@gmail.com');
   });

   it('should rejected causes invalid request', async () => {
      const contactTest = await getTestContact();
      const result = await supertest(web)
                     .put(`/api/contacts/${contactTest.id}`)
                     .set({authorization: "test"})
                     .send({
                        firstName: "",
                        lastName: "mallaniung",
                        phone: "089384938498392233242234542352345234532",
                        email: "danezidane"
                     });
      
      expect(result.status).toBe(400);
   });

   it('should rejected cause id contact not found', async () => {
      const contactTest = await getTestContact();
      const result = await supertest(web)
                     .put(`/api/contacts/${contactTest.id + 1}`)
                     .set({authorization: "test"})
                     .send({
                        firstName: "zidane",
                        lastName: "mallaniung",
                        phone: "089384938498392",
                        email: "danezidane@gmail.com"
                     });

      expect(result.status).toBe(404);
   });
});

describe('Delete api/contact/:contactId', () => {
   beforeEach(async () => {
      await createTestUser();
      await createTestContact();
   });

   afterEach(async () => {
      await removeAllTestContacts();
      await removeTestUser();
   });

   it('should remove contact', async () => {
      let contactTest = await getTestContact();
      const result = await supertest(web)
                     .delete("/api/contacts/" + contactTest.id )
                     .set({authorization: "test"});

      expect(result.status).toBe(200);
      expect(result.body.data).toBe("ok");

      contactTest = await getTestContact();
      expect(contactTest).toBeNull();
   });

   it('should reject remove contact', async () => {
      const contactTest = await getTestContact();
      const result = await supertest(web)
                     .delete(`/api/contacts/${contactTest.id + 1}`)
                     .set({authorization: "test"});
      
      expect(result.status).toBe(404);

   });
});

describe('Get api/contacts', () => {
   beforeEach(async () => {
      await createTestUser();
      await createManyTestContacts();
   });

   afterEach(async () => {
      await removeAllTestContacts();
      await removeTestUser();
   });

   it('should search without parameter', async () => {
      const result = await supertest(web)
                     .get('/api/contacts')
                     .set({authorization: "test"});

      expect(result.status).toBe(200);
      expect(result.body.data.length).toBe(10);
      expect(result.body.paging.page).toBe(1);
      expect(result.body.paging.totalPage).toBe(2);
      expect(result.body.paging.totalItems).toBe(15);
   });

   it('should search with parameter page 2', async () => {
      const result = await supertest(web)
                     .get('/api/contacts')
                     .query({
                        page: 2
                     })
                     .set({authorization: "test"});

      expect(result.status).toBe(200);
      expect(result.body.data.length).toBe(5);
      expect(result.body.paging.page).toBe(2);
      expect(result.body.paging.totalPage).toBe(2);
      expect(result.body.paging.totalItems).toBe(15);
   });

   it('should search with parameter name', async () => {
      const result = await supertest(web)
                     .get('/api/contacts')
                     .query({
                        name: {
                           firstName: "test-1",
                           lastName: "test-1"
                        }
                     })
                     .set({authorization: "test"});

      expect(result.status).toBe(200);
      expect(result.body.data.length).toBe(7);
      expect(result.body.paging.page).toBe(1);
      expect(result.body.paging.totalPage).toBe(1);
      expect(result.body.paging.totalItems).toBe(7);
   });

   it('should search with parameter email', async () => {
      const result = await supertest(web)
                     .get('/api/contacts')
                     .query({
                        email: "test1@mc.com"
                     })
                     .set({authorization: "test"});

      expect(result.status).toBe(200);
      expect(result.body.data.length).toBe(1);
      expect(result.body.paging.page).toBe(1);
      expect(result.body.paging.totalPage).toBe(1);
      expect(result.body.paging.totalItems).toBe(1);
   });

   it('should search with parameter phone', async () => {
      const result = await supertest(web)
                     .get('/api/contacts')
                     .query({
                        phone: "08964849482941"
                     })
                     .set({authorization: "test"});

      expect(result.status).toBe(200);
      expect(result.body.data.length).toBe(7);
      expect(result.body.paging.page).toBe(1);
      expect(result.body.paging.totalPage).toBe(1);
      expect(result.body.paging.totalItems).toBe(7);
   });

});