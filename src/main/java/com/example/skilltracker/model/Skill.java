package com.example.skilltracker.model;

import lombok.Data;
import lombok.NonNull;
import org.bson.types.ObjectId;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.stereotype.Component;


@Document(collection = "skills")
@Data
public class Skill {

    @Id
    private ObjectId id;

    @NonNull
    @Indexed(unique = true)
    private String name;

    private String proficiency;
}
