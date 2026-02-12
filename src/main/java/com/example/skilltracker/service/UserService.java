package com.example.skilltracker.service;

import com.example.skilltracker.model.User;
import com.example.skilltracker.repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public void saveNewUser(User user){
        user.setRoles(Arrays.asList("ROLE_USER"));
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }
    public void saveUser(User user){
        userRepository.save(user);
    }
    public List<User> getAll(){
        return userRepository.findAll();
    }
    public User getUserById(ObjectId id){
        User user = userRepository.findById(id).orElse(null);
        return user;
    }
    private  User findUserByUsername(String username){
         return userRepository.findUserByUsername(username);
    }
    public void deleteById(ObjectId id){
        userRepository.deleteById(id);
    }
}
