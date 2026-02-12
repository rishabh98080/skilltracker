package com.example.skilltracker.controller;

import com.example.skilltracker.model.Skill;
import com.example.skilltracker.model.User;
import com.example.skilltracker.service.SkillService;
import com.example.skilltracker.service.UserService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/skill-tracker/skill")
public class SkillController {
    @Autowired
    protected UserService userService;
    @Autowired
    protected SkillService skillService;

@PostMapping("/id/{id}")
public ResponseEntity<?> createSkill(@RequestBody Skill skill, @PathVariable String id){
    try{
        if(!ObjectId.isValid(id)){
            return new ResponseEntity<>("Invalid User ID", HttpStatus.BAD_REQUEST);
        }

        skillService.saveSkill(new ObjectId(id), skill);
        return new ResponseEntity<>(HttpStatus.CREATED);

    }catch (Exception e){
        return new ResponseEntity<>(e.getMessage(),HttpStatus.BAD_REQUEST);
    }
}
    @GetMapping("/id/{userId}")
    public ResponseEntity<?>  getAllSkills(@PathVariable ObjectId userId){
        try{
            return new ResponseEntity<>(skillService.getAll(userId),HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
    }
    @PutMapping("/userId/{userId}/skillId/{skillId}")
    public ResponseEntity<?> putSkill(@PathVariable ObjectId userId,@PathVariable ObjectId skillId,@RequestBody Skill skill){
        try {
            User user = userService.getUserById(userId);
            if (user != null) {
                Optional<Skill> oldskill = user.getSkills().stream().filter(x -> x.getId().equals(skillId)).findFirst();
                if (oldskill.isPresent()) {
                    oldskill.get().setName(!skill.getName().isEmpty() ? skill.getName() : oldskill.get().getName());
                    oldskill.get().setProficiency(!skill.getProficiency().isEmpty() ? skill.getProficiency() : oldskill.get().getProficiency());
                    skillService.saveSkill(userId, oldskill.get());
                }
            }
            return new ResponseEntity<>(HttpStatus.OK);
        }catch (Exception E){
            return  new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/userId/{userId}/skillId/{skillId}")
    public ResponseEntity<?> deleteSkill(@PathVariable ObjectId userId,@PathVariable ObjectId skillId){
        try {
            User user = userService.getUserById(userId);
            if (user != null) {
                skillService.deleteSkillById(skillId,userId);
            }
            return new ResponseEntity<>(HttpStatus.OK);
        }catch (Exception E){
            return  new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
