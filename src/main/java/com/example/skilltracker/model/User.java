package com.example.skilltracker.model;


import lombok.Data;
import lombok.NonNull;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;


@Document(collection = "users")
@Data
public class User {

    @Id
    private ObjectId id;


    private String username;

    private String password;

    private List<String> roles;

    @DBRef
    private List<Skill> skills = new ArrayList<>();
}
