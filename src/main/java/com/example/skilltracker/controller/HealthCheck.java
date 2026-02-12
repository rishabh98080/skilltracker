package com.example.skilltracker.controller;


import com.example.skilltracker.model.User;
import com.example.skilltracker.service.CustomUserDetails;
import com.example.skilltracker.service.UserService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/skill-tracker")
public class HealthCheck {
    @Autowired
    UserService userService;
    @GetMapping("/login")
    public ResponseEntity<?> check(@AuthenticationPrincipal CustomUserDetails userDetails){
        String id = userDetails.getUserId().toHexString();
        return ResponseEntity.ok(id);
    }
    @PostMapping("/register")
    public ResponseEntity<?> createUser(@RequestBody User user){
        if(user == null || user.getUsername().isEmpty() || user.getPassword().isEmpty()){
            return new ResponseEntity<>("Username and Password must not be null or empty.",HttpStatus.BAD_REQUEST);
        }
        try{
            userService.saveNewUser(user);
            return new ResponseEntity<>(HttpStatus.CREATED);
        }catch (Exception e){
            return new ResponseEntity<>(e.getMessage(),HttpStatus.NO_CONTENT);
        }
    }
}
