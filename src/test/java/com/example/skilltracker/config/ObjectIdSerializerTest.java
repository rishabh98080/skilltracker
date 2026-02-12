package com.example.skilltracker.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ObjectIdSerializerTest {

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testObjectIdSerializesToHexString() throws Exception {
        ObjectId objectId = new ObjectId("507f1f77bcf86cd799439011");
        
        String json = objectMapper.writeValueAsString(objectId);
        
        assertEquals("\"507f1f77bcf86cd799439011\"", json);
    }

    @Test
    void testNullObjectIdSerializesToNull() throws Exception {
        ObjectId objectId = null;
        
        String json = objectMapper.writeValueAsString(objectId);
        
        assertEquals("null", json);
    }
}
