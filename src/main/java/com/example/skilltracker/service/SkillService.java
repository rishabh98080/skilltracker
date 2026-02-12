package com.example.skilltracker.service;

import com.example.skilltracker.model.Skill;
import com.example.skilltracker.model.User;
import com.example.skilltracker.repository.SkillRepository;
import com.example.skilltracker.repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SkillService {

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;

    public void saveSkill(ObjectId userId, Skill skill){
        User user = userService.getUserById(userId);
        Skill saved = skillRepository.save(skill);
        user.getSkills().add(saved);
        userService.saveUser(user);
    }
    public List<Skill> getAll(ObjectId userId){
        User user = userService.getUserById(userId);
        if(user != null){
            return user.getSkills();
        }
        return new ArrayList<>();
    }
    public Skill getSkillById(ObjectId id){
        return skillRepository.findById(id).orElse(null);
    }
    public void deleteSkillById(ObjectId id, ObjectId userId){
        User user = userService.getUserById(userId);
        if(user != null){
            skillRepository.deleteById(id);
            user.getSkills().removeIf(s -> s.getId().equals(id));
            userService.saveUser(user);
        }
    }
}
