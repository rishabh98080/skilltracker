package com.example.skilltracker.controller;


import com.example.skilltracker.model.User;
import com.example.skilltracker.repository.UserRepository;
import com.example.skilltracker.service.UserService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/skill-tracker/user")
public class UserController {
    
    @Autowired
    protected UserService userService;
    @GetMapping("/id/{id}")
    public ResponseEntity<?> getUser(@PathVariable ObjectId id){
        try{
            User user = userService.getUserById(id);
            if(user != null){
                return new ResponseEntity<>(user,HttpStatus.FOUND);
            }
        }catch (Exception e){
            return new ResponseEntity<>(e.getMessage(),HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
    @PutMapping("/id/{id}")
    public ResponseEntity<?> updateUser(@RequestBody User user,@PathVariable ObjectId id){
        try{
            User oldUser = userService.getUserById(id);
            if(oldUser != null){
                oldUser.setUsername(!user.getUsername().isEmpty() ? user.getUsername(): oldUser.getUsername());
                oldUser.setPassword(!user.getPassword().isEmpty() ? user.getPassword(): oldUser.getPassword());
                userService.saveUser(oldUser);
            }
            return new ResponseEntity<>(oldUser,HttpStatus.ACCEPTED);
        }catch (Exception e){
            return new ResponseEntity<>(e.getMessage(),HttpStatus.BAD_REQUEST);
        }
    }
    @DeleteMapping("/id/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable ObjectId id){
        try{
            User oldUser = userService.getUserById(id);
            if(oldUser != null){
                userService.deleteById(id);
                return new ResponseEntity<>(HttpStatus.OK);
            }
        }catch (Exception e){
            return new ResponseEntity<>(e.getMessage(),HttpStatus.NOT_FOUND);
        }
        return null;
    }
 }
