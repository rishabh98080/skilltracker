package com.example.skilltracker.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ObjectIdSerializerTest {

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        SimpleModule module = new SimpleModule();
        module.addSerializer(ObjectId.class, new ObjectIdSerializer());
        objectMapper.registerModule(module);
    }

    @Test
    void testObjectIdSerializesToHexString() throws Exception {
        ObjectId objectId = new ObjectId("507f1f77bcf86cd799439011");
        
        String json = objectMapper.writeValueAsString(objectId);
        
        assertEquals("\"507f1f77bcf86cd799439011\"", json);
    }

    @Test
    void testObjectIdInObjectWithNullValue() throws Exception {
        // Test that null ObjectId in an object is handled correctly
        TestObject obj = new TestObject(null);
        
        String json = objectMapper.writeValueAsString(obj);
        
        assertTrue(json.contains("\"id\":null"));
    }

    // Helper class for testing
    static class TestObject {
        public ObjectId id;
        
        TestObject(ObjectId id) {
            this.id = id;
        }
    }
}
