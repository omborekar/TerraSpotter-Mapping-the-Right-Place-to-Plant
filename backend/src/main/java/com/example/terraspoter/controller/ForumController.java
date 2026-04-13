package com.example.terraspoter.controller;

import com.example.terraspoter.model.ForumQuestion;
import com.example.terraspoter.model.ForumReply;
import com.example.terraspoter.model.User;
import com.example.terraspoter.repository.ForumQuestionRepository;
import com.example.terraspoter.repository.ForumReplyRepository;
import com.example.terraspoter.repository.UserRepository;
import com.example.terraspoter.service.ProfanityFilterService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/forum")
public class ForumController {

    @Autowired
    private ForumQuestionRepository questionRepo;

    @Autowired
    private ForumReplyRepository replyRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ProfanityFilterService profanityFilterService;

    // --- DTOs ---
    public static class QuestionRequest {
        public String title;
        public String content;
    }

    public static class ReplyRequest {
        public String content;
    }

    // --- Endpoints ---

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllQuestions() {
        List<ForumQuestion> questions = questionRepo.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> response = questions.stream().map(q -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", q.getId());
            map.put("title", q.getTitle());
            map.put("content", q.getContent());
            map.put("createdAt", q.getCreatedAt());
            map.put("authorName", q.getAuthor().getFullName());
            map.put("authorAvatar", q.getAuthor().getProfilePictureUrl());
            map.put("replyCount", replyRepo.findByQuestionIdOrderByCreatedAtAsc(q.getId()).size());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getQuestion(@PathVariable Long id) {
        ForumQuestion q = questionRepo.findById(id).orElse(null);
        if (q == null) return ResponseEntity.notFound().build();

        List<ForumReply> replies = replyRepo.findByQuestionIdOrderByCreatedAtAsc(id);
        
        List<Map<String, Object>> repliesDto = replies.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("content", r.getContent());
            map.put("createdAt", r.getCreatedAt());
            map.put("authorName", r.getAuthor().getFullName());
            map.put("authorAvatar", r.getAuthor().getProfilePictureUrl());
            // optionally if author is admin, etc.
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> map = new HashMap<>();
        map.put("id", q.getId());
        map.put("title", q.getTitle());
        map.put("content", q.getContent());
        map.put("createdAt", q.getCreatedAt());
        map.put("authorName", q.getAuthor().getFullName());
        map.put("authorAvatar", q.getAuthor().getProfilePictureUrl());
        map.put("replies", repliesDto);

        return ResponseEntity.ok(map);
    }

    @PostMapping
    public ResponseEntity<?> createQuestion(@RequestBody QuestionRequest req, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Must be logged in to post."));
        }
        User author = userRepo.findById(userId).orElse(null);
        if (author == null) return ResponseEntity.status(401).build();

        ForumQuestion q = new ForumQuestion();
        q.setAuthor(author);
        q.setTitle(profanityFilterService.filter(req.title));
        q.setContent(profanityFilterService.filter(req.content));

        questionRepo.save(q);
        return ResponseEntity.ok(Map.of("message", "Question posted successfully", "id", q.getId()));
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<?> createReply(@PathVariable Long id, @RequestBody ReplyRequest req, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Must be logged in to reply."));
        }
        User author = userRepo.findById(userId).orElse(null);
        if (author == null) return ResponseEntity.status(401).build();

        ForumQuestion q = questionRepo.findById(id).orElse(null);
        if (q == null) return ResponseEntity.notFound().build();

        ForumReply reply = new ForumReply();
        reply.setAuthor(author);
        reply.setQuestion(q);
        reply.setContent(profanityFilterService.filter(req.content));

        replyRepo.save(reply);
        return ResponseEntity.ok(Map.of("message", "Reply posted successfully"));
    }
}
