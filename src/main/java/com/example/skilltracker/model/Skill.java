package com.example.skilltracker.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "skills")
@Data
@NoArgsConstructor        // ⭐ REQUIRED FOR JACKSON
@AllArgsConstructor
public class Skill {

    @Id
    private ObjectId id;

    private String name;

    private String proficiency;
}
